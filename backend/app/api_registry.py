from fastapi import APIRouter
from app.features.revisions.router import router as revisions_router

api_router = APIRouter()
api_router.include_router(revisions_router)

