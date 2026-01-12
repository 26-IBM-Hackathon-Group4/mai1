from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class EmailBase(BaseModel):
    subject: Optional[str] = None
    sender: str
    received_at: datetime
    snippet: Optional[str] = None

class EmailCreate(EmailBase):
    user_id: int
    provider: str = "GMAIL"
    message_id: str
    classification: str = "UNCERTAIN"

class EmailResponse(EmailBase):
    email_id: int
    provider: str
    classification: str

    class Config:
        from_attributes = True

class EmailListResponse(BaseModel):
    total_count: int
    emails: List[EmailResponse]

class EmailSyncRequest(BaseModel):
    search_query: str = "subject:가입 OR subject:welcome OR subject:verify"
    limit: int = 50
    start_date: Optional[str] = None # YYYY-MM-DD
    end_date: Optional[str] = None   # YYYY-MM-DD