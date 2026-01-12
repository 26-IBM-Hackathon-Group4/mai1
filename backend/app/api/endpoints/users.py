from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models.user import User
from app.models.user_service import UserService
from app.models.service import Service
from app.schemas.common import CommonResponse
from app.schemas.service import UserServiceListResponse

router = APIRouter()

@router.get("/me/services", response_model=CommonResponse[UserServiceListResponse])
def get_my_services(
    sort: str = Query("latest", description="정렬 기준: latest(최신순), risk_desc(위험도순), risk_asc(안전순)"),
    risk_level: Optional[str] = Query(None, description="특정 등급 필터링 (예: A, B, C)"),
    db: Session = Depends(get_db)
):

    user_id = 1
    
    query = db.query(UserService).join(Service).filter(UserService.user_id == user_id)

    if risk_level:
        query = query.filter(Service.risk_level == risk_level)

    if sort == "risk_desc":
        query = query.order_by(Service.risk_level.desc())
    elif sort == "risk_asc":
        query = query.order_by(Service.risk_level.asc())
    else:
        query = query.order_by(UserService.subscription_date.desc())

    services = query.all()
    
    result_list = []
    for us in services:
        result_list.append({
            "user_service_id": us.id,
            "service_id": us.service.service_id,
            "service_name": us.service.service_name,
            "domain": us.service.domain,
            "risk_level": us.service.risk_level,
            "subscription_date": us.subscription_date,
            "evidence_email_id": us.email_id
        })

    return {
        "status": "success",
        "message": "가입된 서비스 목록을 조회했습니다.",
        "data": {
            "total_count": len(result_list),
            "services": result_list
        }
    }