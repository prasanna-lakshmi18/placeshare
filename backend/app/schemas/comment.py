from datetime import datetime
from pydantic import BaseModel, Field


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)
    parent_id: int | None = None  # None = top-level comment


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)


class CommentAuthor(BaseModel):
    id: int
    username: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class CommentResponse(BaseModel):
    id: int
    content: str
    is_edited: bool
    author: CommentAuthor
    parent_id: int | None
    experience_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommentTreeResponse(BaseModel):
    """A comment with its nested children — built from flat-loaded data."""
    id: int
    content: str
    is_edited: bool
    author: CommentAuthor
    parent_id: int | None
    experience_id: int
    created_at: datetime
    updated_at: datetime
    children: list["CommentTreeResponse"] = []

    model_config = {"from_attributes": True}


class UserCommentResponse(BaseModel):
    id: int
    content: str
    is_edited: bool
    parent_id: int | None
    experience_id: int
    experience_company: str
    experience_role: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserCommentListResponse(BaseModel):
    items: list[UserCommentResponse]
    next_cursor: str | None = None
    has_more: bool = False
