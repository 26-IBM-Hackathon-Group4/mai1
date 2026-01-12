from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    nickname = Column(String(50))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    emails = relationship("Email", back_populates="owner")
    user_services = relationship("UserService", back_populates="user")