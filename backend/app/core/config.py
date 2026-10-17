import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings with environment variable overrides and sensible defaults."""

    def __init__(self) -> None:
        self.APP_NAME: str = os.getenv("APP_NAME", "RISKWISE Pre-Trade Risk Intelligence")
        self.API_PREFIX: str = os.getenv("API_PREFIX", "/api/v1")
        self.DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./riskwise.db")
        
        # Support comma-separated CORS origins or defaults for Vite frontend
        raw_cors = os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000",
        )
        self.CORS_ORIGINS: List[str] = [origin.strip() for origin in raw_cors.split(",") if origin.strip()]

    @property
    def sqlite_db_path(self) -> str:
        """Extract the SQLite database file path from DATABASE_URL."""
        if ":///" in self.DATABASE_URL:
            return self.DATABASE_URL.split(":///", 1)[1]
        elif "://" in self.DATABASE_URL:
            return self.DATABASE_URL.split("://", 1)[1]
        return self.DATABASE_URL


settings = Settings()
