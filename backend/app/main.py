import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.routers import auth, experiences, comments, users

# Import all models so Base.metadata knows about them
from app.models import User, Experience, Comment, Like  # noqa: F401
from app.models.token import AccountToken  # noqa: F401

settings = get_settings()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    logger.info(f"🚀 Starting {settings.APP_NAME}")
    logger.info(f"📦 Database: {settings.DATABASE_URL}")

    # Create all tables (for dev — use Alembic migrations in production)
    Base.metadata.create_all(bind=engine)
    logger.info("✅ Database tables created")

    yield

    logger.info("👋 Shutting down")


app = FastAPI(
    title=settings.APP_NAME,
    description="A platform for university students to share placement and interview experiences.",
    version="1.0.0",
    lifespan=lifespan,
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register Routers ---
app.include_router(auth.router)
app.include_router(experiences.router)
app.include_router(comments.router)
app.include_router(users.router)


@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": "1.0.0",
    }
