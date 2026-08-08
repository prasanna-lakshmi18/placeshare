from pydantic_settings import BaseSettings
from functools import lru_cache


from pydantic import field_validator


class Settings(BaseSettings):
    """Application configuration via environment variables."""

    # App
    APP_NAME: str = "Placement Experience Platform"
    DEBUG: bool = True

    # Database — SQLite for local dev, PostgreSQL for Docker
    DATABASE_URL: str = "sqlite:///./placement.db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v

    # JWT
    SECRET_KEY: str = "super-secret-dev-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30  # 30 days

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Cache
    CACHE_TTL_SECONDS: int = 300  # 5 minutes
    CACHE_MAX_SIZE: int = 1024

    # SMTP / Email
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@placeshare.com"
    FRONTEND_URL: str = "https://frontend-2a96.prg1.zerops.app"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    return Settings()
