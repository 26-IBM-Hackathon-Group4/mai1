from fastapi import APIRouter, Depends, HTTPException, Query, File, UploadFile, Form
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime

from app.core.database import get_db
from app.models.service import Service
from app.schemas.common import CommonResponse
from app.schemas.admin import (
    AdminServiceListResponse, 
    AdminServiceResponse, 
    ServiceUpdate, 
    ServiceEvaluationResponse
)

from app.models.user import User
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserResponse,
    UserCreate,
    UserUpdate
)

router = APIRouter()

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
    service = db.query(Service).filter(Service.service_id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # [임시 로직]
    ai_risk_score = "B" 
    if type == "FILE" and file:
        print(f"Analyzing file: {file.filename}")
        ai_risk_score = "A"
    elif type == "TEXT" and content:
        print(f"Analyzing text: {content[:20]}...")
        ai_risk_score = "C"
    
    service.risk_level = ai_risk_score
    service.evaluated_at = datetime.now()
    db.commit()

    return {
        "status": "success",
        "message": "AI 평가가 완료되었습니다.",
        "data": {
            "service_id": service.service_id,
            "service_name": service.service_name,
            "new_risk_level": ai_risk_score,
            "evaluated_at": service.evaluated_at
        }
    }
    
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