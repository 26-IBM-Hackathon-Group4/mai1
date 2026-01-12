import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.service import Service
from app.models.user import User
from app.schemas.common import CommonResponse
from app.schemas.admin import (
    AdminServiceListResponse, 
    AdminServiceResponse, 
    ServiceUpdate, 
    ServiceEvaluationResponse,
    AdminUserListResponse,
    AdminUserResponse,
    UserCreate,
    UserUpdate
)
from app.services.ai_service import ai_service

router = APIRouter()

# 임시 파일 저장 경로
TEMP_DIR = "temp_files"
os.makedirs(TEMP_DIR, exist_ok=True)

@router.get("/services", response_model=CommonResponse[AdminServiceListResponse])
def get_admin_services(
    status: str = Query("ALL", description="평가 상태: ALL, PENDING(미평가), COMPLETED(평가됨)"),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service)

    if search:
        query = query.filter(Service.service_name.ilike(f"%{search}%"))

    if status == "PENDING":
        query = query.filter(Service.risk_level == None)
    elif status == "COMPLETED":
        query = query.filter(Service.risk_level != None)

    services = query.order_by(Service.service_id.desc()).all()

    return {
        "status": "success",
        "message": "관리자용 서비스 목록 조회 성공",
        "data": {
            "total_count": len(services),
            "services": services
        }
    }

@router.patch("/services/{service_id}", response_model=CommonResponse[AdminServiceResponse])
def update_service_risk(
    service_id: int,
    update_data: ServiceUpdate,
    db: Session = Depends(get_db)
):
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    service.risk_level = update_data.risk_level
    service.evaluated_at = datetime.now()
    
    db.commit()
    db.refresh(service)

    return {
        "status": "success",
        "message": "서비스 등급이 수정되었습니다.",
        "data": service
    }

@router.post("/services/{service_id}/evaluate", response_model=CommonResponse[ServiceEvaluationResponse])
async def evaluate_service(
    service_id: int,
    type: str = Form(..., description="TEXT or FILE"),
    content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # print(f"DEBUG: service_id={service_id}, type={type}, file={file}, content={content}")

    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    temp_filename = f"{service.service_name}_{timestamp}.txt"
    temp_file_path = os.path.join(TEMP_DIR, temp_filename)

    input_type = type.upper()
    is_valid_input = False

    if input_type == "FILE" and file:
        is_valid_input = True
    elif input_type == "TEXT" and content:
        is_valid_input = True
    
    if not is_valid_input:
        error_msg = f"입력 조건 불만족: type={type} (기대: FILE/TEXT), file여부={bool(file)}, content여부={bool(content)}"
        print(f"{error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)

    try:
        if input_type == "FILE":
            with open(temp_file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
        
        elif input_type == "TEXT":
            with open(temp_file_path, "w", encoding="utf-8") as buffer:
                buffer.write(content)

        print(f"Calling AI Evaluation for file: {temp_file_path}")
        eval_result = ai_service.evaluate_service_security(temp_file_path, service.service_name)
        
        service.risk_level = eval_result["grade"]
        service.security_score = eval_result["score"]
        service.security_report = eval_result["report"]
        service.evaluated_at = datetime.now()
        
        db.commit()

        return {
            "status": "success",
            "message": "AI 보안 평가가 완료되었습니다.",
            "data": {
                "service_id": service.service_id,
                "service_name": service.service_name,
                "new_risk_level": service.risk_level,
                "security_score": service.security_score,
                "security_report": service.security_report,
                "evaluated_at": service.evaluated_at
            }
        }

    except Exception as e:
        print(f"Evaluation Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"평가 실패: {str(e)}")
    
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
                print(f"🗑️ Removed temp file: {temp_file_path}")
            except Exception as e:
                print(f"⚠️ Failed to remove temp file: {e}")

@router.get("/users", response_model=CommonResponse[AdminUserListResponse])
def get_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    total = db.query(User).count()
    users = db.query(User).order_by(User.user_id.desc()).offset(skip).limit(limit).all()

    return {
        "status": "success",
        "message": "전체 사용자 목록을 조회했습니다.",
        "data": {
            "total_count": total,
            "users": users
        }
    }

@router.post("/users", response_model=CommonResponse[AdminUserResponse])
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        email=user_in.email,
        nickname=user_in.nickname
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "status": "success",
        "message": "사용자가 생성되었습니다.",
        "data": new_user
    }

@router.patch("/users/{user_id}", response_model=CommonResponse[AdminUserResponse])
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_in.email:
        user.email = user_in.email
    if user_in.nickname:
        user.nickname = user_in.nickname

    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "message": "사용자 정보가 수정되었습니다.",
        "data": user
    }

@router.delete("/users/{user_id}", response_model=CommonResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {
        "status": "success",
        "message": "사용자가 삭제되었습니다.",
        "data": None
    }