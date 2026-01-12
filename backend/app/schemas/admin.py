from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class ServiceUpdate(BaseModel):
    risk_level: str

class ServiceEvaluationResponse(BaseModel):
    service_id: int
    service_name: str
    new_risk_level: str
    security_score: float
    security_report: str
    evaluated_at: datetime

class AdminServiceResponse(BaseModel):
    service_id: int
    service_name: str
    domain: Optional[str] = None
    risk_level: Optional[str] = None
    security_score: Optional[float] = None
    evaluated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AdminServiceListResponse(BaseModel):
    total_count: int
    services: List[AdminServiceResponse]

class UserCreate(BaseModel):
    email: EmailStr
    nickname: Optional[str] = None

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nickname: Optional[str] = None

class AdminUserResponse(BaseModel):
    user_id: int
    email: str
    nickname: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AdminUserListResponse(BaseModel):
    total_count: int
    users: List[AdminUserResponse]