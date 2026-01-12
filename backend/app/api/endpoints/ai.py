from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from pydantic import BaseModel
from typing import List

from app.schemas.common import CommonResponse
from app.services.ai_service import ai_service

router = APIRouter()

class EmailInput(BaseModel):
    id: int
    subject: str
    sender: str

class AIClassifyRequest(BaseModel):
    emails: List[EmailInput]

class ClassificationResult(BaseModel):
    id: int
    classification: str

class AIClassifyResponse(BaseModel):
    results: List[ClassificationResult]
    failed_ids: List[int] = []

@router.post("/classify-emails", response_model=CommonResponse[AIClassifyResponse])
async def classify_emails(
    request: AIClassifyRequest, 
    db: Session = Depends(get_db)
):
    try:
        email_list = [e.model_dump() for e in request.emails]
        
        classified_results = ai_service.process_email_classification(db, email_list)
        
        return {
            "status": "success",
            "message": "메일 분류 및 DB 반영이 완료되었습니다.",
            "data": {
                "results": classified_results,
                "failed_ids": []
            }
        }
    except Exception as e:
        print(f"AI Classification Error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="AI 분류 중 오류가 발생했습니다.")