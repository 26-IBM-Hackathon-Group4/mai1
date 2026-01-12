import sys
import os
import json
import shutil
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.email import Email
from app.models.service import Service
from app.models.user_service import UserService

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../")))

try:
    from ai.AI import classifier, call_privacy_evaluate
except ImportError:
    print("Warning: ai.AI module not found. Using dummy functions.")
    def classifier(data): return {"results": []}
    def call_privacy_evaluate(path, name): 
        return {'name': name, 'score': 0.5, 'missing': 'AI module not connected'}

class AIService:
    def process_email_classification(self, db: Session, email_list: list):
        """
        1. AI로 메일 분류
        2. Emails 테이블에 classification 결과 업데이트
        3. 'REGISTER'인 경우 발송자 도메인과 Services 테이블 매칭
        4. 매칭되면 UserServices 테이블에 관계 생성
        """

        ai_input = {"emails": []}
        for email in email_list:
            ai_input["emails"].append({
                "id": email["id"],
                "subject": email["subject"],
                "sender": email["sender"]
            })

        ai_response = classifier(ai_input)

        if isinstance(ai_response, str):
            try:
                clean_response = ai_response.replace("```json", "").replace("```", "").strip()
                ai_response = json.loads(clean_response)
            except json.JSONDecodeError:
                print(f"JSON Parsing Error: {ai_response}")
                return []

        raw_results = ai_response.get("results", [])
        final_results = []

        for item in raw_results:
            if isinstance(item, str): continue

            email_id = item.get("id")
            signup_yn = item.get("signup")
            classification = "REGISTER" if signup_yn == "Y" else "OTHER"
            
            email_obj = db.query(Email).filter(Email.email_id == email_id).first()
            if email_obj:
                email_obj.classification = classification
                
                if classification == "REGISTER":
                    self._link_user_to_service(db, email_obj)

            final_results.append({
                "id": email_id,
                "classification": classification
            })
        
        db.commit()
        return final_results

    def _link_user_to_service(self, db: Session, email: Email):
        sender_email = email.sender
        if not sender_email or "@" not in sender_email:
            return

        domain_part = sender_email.split("@")[1].lower()
        matched_service = db.query(Service).filter(Service.domain != None).all()
        
        target_service = None
        for service in matched_service:
            if service.domain in domain_part:
                target_service = service
                break
        
        if target_service:
            existing_link = db.query(UserService).filter(
                UserService.user_id == email.user_id,
                UserService.service_id == target_service.service_id
            ).first()

            if not existing_link:
                new_link = UserService(
                    user_id=email.user_id,
                    service_id=target_service.service_id,
                    email_id=email.email_id,
                    subscription_date=email.received_at.date() if email.received_at else datetime.now().date(),
                    status="Active"
                )
                db.add(new_link)
                print(f"[매칭 성공] {email.user_id}번 유저 -> {target_service.service_name} 서비스 연결됨")

    def evaluate_service_security(self, file_path: str, service_name: str):
        """
        저장된 약관 파일 경로와 서비스명을 받아 AI 평가(call_privacy_evaluate)를 수행합니다.
        """
        print(f"🔍 Analyzing Privacy Policy: {file_path} for {service_name}")

        try:
            result = call_privacy_evaluate(file_path, service_name)
            
            score = float(result.get("score", 0.0))
            missing_info = result.get("missing", "")

            grade = "C"
            if score >= 0.8:
                grade = "A"
            elif score >= 0.5:
                grade = "B"

            return {
                "grade": grade,
                "score": score,
                "report": missing_info
            }

        except Exception as e:
            print(f"Privacy Evaluation Error: {e}")
            return {
                "grade": "Unrated", 
                "score": 0.0, 
                "report": f"AI evaluation failed: {str(e)}"
            }

ai_service = AIService()