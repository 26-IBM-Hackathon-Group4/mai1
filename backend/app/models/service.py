from sqlalchemy import Column, Integer, String, DateTime, Text, Float
from app.core.database import Base
from sqlalchemy.orm import relationship

class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    domain = Column(String(255), index=True)
    risk_level = Column(String(10), nullable=True)
    security_score = Column(Float, nullable=True)
    security_report = Column(Text, nullable=True)
    
    evaluated_at = Column(DateTime, nullable=True)

    user_services = relationship("UserService", back_populates="service")