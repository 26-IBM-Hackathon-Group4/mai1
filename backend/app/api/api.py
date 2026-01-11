from fastapi import APIRouter
from app.api.endpoints import emails, users, admin

api_router = APIRouter()
api_router.include_router(emails.router, prefix="/emails", tags=["emails"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])