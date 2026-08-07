from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application configuration via environment variables."""

    # App
    APP_NAME: str = "Placement Experience Platform"
    DEBUG: bool = True

    # Database — SQLite for local dev, PostgreSQL for Docker
    DATABASE_URL: str = "sqlite:///./placement.db"

    # JWT
    SECRET_KEY: str = "super-secret-dev-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

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

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache
def get_settings() -> Settings:
    return Settings()
