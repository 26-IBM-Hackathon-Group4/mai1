from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Email(Base):
    __tablename__ = "emails"

    email_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    
    provider = Column(String(20), default="GMAIL")
    message_id = Column(String(255), unique=True, index=True)
    
    sender = Column(String(255))
    subject = Column(String(255))
    snippet = Column(Text)
    received_at = Column(DateTime)
    
    # REGISTER, OTHER
    classification = Column(String(50), default="OTHER") 

    owner = relationship("User", back_populates="emails")
    related_service_link = relationship("UserService", back_populates="email_evidence", uselist=False)