from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.email import EmailSyncRequest, EmailListResponse, EmailResponse
from app.services.gmail_service import GmailService
from app.models.email import Email
from app.models.user import User
from app.schemas.common import CommonResponse

router = APIRouter()
gmail_service = GmailService()

@router.post("/sync")
def sync_emails(request: EmailSyncRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_id == 1).first()
    if not user:
        user = User(email="demo@gmail.com", nickname="DemoUser")
        db.add(user)
        db.commit()
        db.refresh(user)

    final_query = request.search_query
    if request.start_date:
        final_query += f" after:{request.start_date.replace('-', '/')}"
    if request.end_date:
        final_query += f" before:{request.end_date.replace('-', '/')}"

    try:
        count = gmail_service.fetch_and_save_emails(db, user.user_id, final_query, request.limit)
        return {
            "status": "success",
            "message": "메일 동기화가 완료되었습니다.",
            "data": {"synced_count": count}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=CommonResponse[EmailListResponse])
def get_emails(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    total = db.query(Email).count()
    emails = db.query(Email).order_by(Email.received_at.desc()).offset(skip).limit(limit).all()
  
    return {
        "status": "success", 
        "message": "메일 목록 조회 성공",
        "data": {
            "total_count": total,
            "emails": emails
        }
    }