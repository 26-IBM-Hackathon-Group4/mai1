from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.api import api_router
from app.core.database import engine, Base
from app.models import user, service, email, user_service

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mai1 Security Service",
    description="이메일 분석을 통한 가입 서비스 보안 평가 서비스",
    version="1.0.0"
)

origins = [
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "success", "message": "Mai1 API Server is running!"}

app.include_router(api_router, prefix="/api")