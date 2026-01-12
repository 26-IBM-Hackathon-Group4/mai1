from sqlalchemy import Column, Integer, ForeignKey, Date, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserService(Base):
    __tablename__ = "user_services"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.service_id"), nullable=False)
    email_id = Column(Integer, ForeignKey("emails.email_id"), nullable=True)
    
    subscription_date = Column(Date, nullable=True)
    status = Column(String(20), default="Active")

    user = relationship("User", back_populates="user_services")
    service = relationship("Service", back_populates="user_services")
    email_evidence = relationship("Email", back_populates="related_service_link")