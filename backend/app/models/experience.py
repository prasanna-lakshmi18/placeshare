from datetime import datetime
from sqlalchemy import String, Text, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    company: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    role: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(20), nullable=False, default="medium")  # easy, medium, hard
    result: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # selected, rejected, pending
    likes_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    author = relationship("User", back_populates="experiences")
    comments = relationship("Comment", back_populates="experience", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="experience", cascade="all, delete-orphan")

    @property
    def is_edited(self) -> bool:
        """True if the experience was edited after creation."""
        if self.updated_at and self.created_at:
            return self.updated_at > self.created_at
        return False

    def __repr__(self) -> str:
        return f"<Experience(id={self.id}, company='{self.company}', role='{self.role}')>"
