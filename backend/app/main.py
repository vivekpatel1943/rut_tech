import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Allow running from either `backend/` or `backend/app/`
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api_registry import api_router
from app.core.config import settings
from app.core.logging import logger
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up Revision Tracker Backend...")
    yield
    logger.info("Shutting down and disposing DB engine...")
    await engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok"}

