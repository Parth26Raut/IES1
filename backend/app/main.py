from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from app.api.behavioural import router as behavioural_router
from app.api.education import router as education_router
from app.api.health import router as health_router
from app.api.research import router as research_router
from app.api.risk import router as risk_router
from app.api.trades import router as trades_router
from app.core.config import settings
from app.core.database import init_db

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan event handler initializing DB tables on startup."""
    logger.info("Starting RISKWISE backend application...")
    await init_db()
    yield
    logger.info("Shutting down RISKWISE backend application...")


app = FastAPI(
    title=settings.APP_NAME,
    description="Deterministic pre-trade risk intelligence and derivatives educational framework.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS for Vite frontend and local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers with API Prefix
api_prefix = settings.API_PREFIX

app.include_router(health_router, prefix=api_prefix)
app.include_router(trades_router, prefix=api_prefix)
app.include_router(risk_router, prefix=api_prefix)
app.include_router(behavioural_router, prefix=api_prefix)
app.include_router(education_router, prefix=api_prefix)
app.include_router(research_router, prefix=api_prefix)


@app.get("/", include_in_schema=False)
async def root():
    """Redirect root path to interactive OpenAPI documentation."""
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
