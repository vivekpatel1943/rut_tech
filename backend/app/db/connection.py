import asyncio
import sys
from pathlib import Path

# Allow running directly from `backend/` or `backend/app/`
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from sqlalchemy import text
from app.core.logging import logger
from app.db.session import engine


async def test_connection() -> None:
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT 1"))
            value = result.scalar()
            logger.info(f"Database connection successful! (SELECT 1 -> {value})")
    except Exception as exc:
        logger.error(f"Database connection failed: {exc}")
        raise
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(test_connection())
