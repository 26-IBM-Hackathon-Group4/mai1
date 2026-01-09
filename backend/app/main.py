from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Mai1 Security Service",
    description="이메일 분석을 통한 가입 서비스 보안 평가 서비스",
    version="1.0.0"
)

# CORS 설정 (프론트엔드 연동을 위해 필수)
origins = [
    "http://localhost:3000", # React 기본 포트
    "*" # 해커톤 편의상 전체 허용 (배포 시 수정 필요)
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