from datetime import datetime
from sqlalchemy import Text, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Comment(Base):
    """Self-referential comment model for Instagram-style nested threading.

    parent_id is nullable — top-level comments have parent_id=None.
    Replies point to their parent comment via parent_id, enabling infinite nesting.
    """
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    experience_id: Mapped[int] = mapped_column(ForeignKey("experiences.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("comments.id", ondelete="CASCADE"), nullable=True, index=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)
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
    author = relationship("User", back_populates="comments")
    experience = relationship("Experience", back_populates="comments")

    # Self-referential: parent/children
    parent = relationship("Comment", remote_side="Comment.id", back_populates="children")
    children = relationship("Comment", back_populates="parent", cascade="all, delete-orphan")

    @property
    def is_edited(self) -> bool:
        if self.updated_at and self.created_at:
            return self.updated_at > self.created_at
        return False

    def __repr__(self) -> str:
        return f"<Comment(id={self.id}, parent_id={self.parent_id})>"
