from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class ServiceBase(BaseModel):
    service_name: str
    domain: Optional[str] = None
    risk_level: Optional[str] = None  # A, B, C 등급

class UserServiceResponse(ServiceBase):
    user_service_id: int
    service_id: int
    subscription_date: Optional[date] = None
    evidence_email_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class UserServiceListResponse(BaseModel):
    total_count: int
    services: List[UserServiceResponse]