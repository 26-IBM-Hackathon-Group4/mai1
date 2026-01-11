import os.path
import base64
from datetime import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from sqlalchemy.orm import Session
from app.models.email import Email
from app.models.user import User

SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

class GmailService:
    def __init__(self):
        self.creds = None
        self.creds_file = "secret_credentials.json"
        self.token_file = "token.json"

    def authenticate(self):
        """OAuth 2.0 인증 처리 (최초 1회 브라우저 로그인 필요)"""
        if os.path.exists(self.token_file):
            self.creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
        
        if not self.creds or not self.creds.valid:
            if self.creds and self.creds.expired and self.creds.refresh_token:
                self.creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(self.creds_file, SCOPES)
                self.creds = flow.run_local_server(port=0)

            with open(self.token_file, 'w') as token:
                token.write(self.creds.to_json())

        return build('gmail', 'v1', credentials=self.creds)

    def fetch_and_save_emails(self, db: Session, user_id: int, query: str, limit: int):
        service = self.authenticate()
        
        results = service.users().messages().list(userId='me', q=query, maxResults=limit).execute()
        messages = results.get('messages', [])
        
        saved_count = 0
        
        for msg in messages:
            msg_id = msg['id']
            
            exists = db.query(Email).filter(Email.message_id == msg_id).first()
            if exists:
                continue

            detail = service.users().messages().get(userId='me', id=msg_id).execute()
            payload = detail.get('payload', {})
            headers = payload.get('headers', [])
            snippet = detail.get('snippet', '')

            subject = next((h['value'] for h in headers if h['name'] == 'Subject'), '(No Subject)')
            sender = next((h['value'] for h in headers if h['name'] == 'From'), 'Unknown')
            date_str = next((h['value'] for h in headers if h['name'] == 'Date'), None)

            received_at = datetime.now()
            try:
                from email.utils import parsedate_to_datetime
                if date_str:
                    received_at = parsedate_to_datetime(date_str)
            except:
                pass

            # 4. DB 저장
            new_email = Email(
                user_id=user_id,
                message_id=msg_id,
                provider="GMAIL",
                sender=sender,
                subject=subject,
                snippet=snippet,
                received_at=received_at,
                classification="UNCERTAIN"
            )
            db.add(new_email)
            saved_count += 1
        
        db.commit()
        return saved_count