from datetime import datetime
from sqlalchemy import ForeignKey, DateTime, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Like(Base):
    """Like model with unique constraint per user+experience pair."""
    __tablename__ = "likes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    experience_id: Mapped[int] = mapped_column(ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Unique constraint: one like per user per experience
    __table_args__ = (
        UniqueConstraint("user_id", "experience_id", name="uq_user_experience_like"),
    )

    # Relationships
    user = relationship("User", back_populates="likes")
    experience = relationship("Experience", back_populates="likes")

    def __repr__(self) -> str:
        return f"<Like(user_id={self.user_id}, experience_id={self.experience_id})>"
