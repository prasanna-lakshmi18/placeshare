from datetime import datetime, timezone, timedelta
from sqlalchemy import String, DateTime, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class AccountToken(Base):
    __tablename__ = "account_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    purpose: Mapped[str] = mapped_column(String(20), nullable=False) # 'verify_email', 'reset_password'
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user = relationship("User")

    @property
    def is_expired(self) -> bool:
        # Handle SQLite returning naive datetimes
        expires_at = self.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        now = datetime.now(timezone.utc)
        return now > expires_at
