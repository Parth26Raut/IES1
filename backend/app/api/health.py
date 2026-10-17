import aiosqlite
from fastapi import APIRouter, status
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    app_name: str
    database_connected: bool
    version: str


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Application Health & Database Connectivity Check",
)
async def health_check() -> HealthResponse:
    """Return health status and verify SQLite database responsiveness."""
    db_ok = False
    try:
        async with aiosqlite.connect(settings.sqlite_db_path) as conn:
            cursor = await conn.execute("SELECT 1;")
            row = await cursor.fetchone()
            if row and row[0] == 1:
                db_ok = True
    except Exception:
        db_ok = False

    return HealthResponse(
        status="healthy" if db_ok else "degraded",
        app_name=settings.APP_NAME,
        database_connected=db_ok,
        version="1.0.0",
    )
