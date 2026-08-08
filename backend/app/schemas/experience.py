from datetime import datetime
from pydantic import BaseModel, Field


class ExperienceCreate(BaseModel):
    company: str = Field(..., min_length=1, max_length=200)
    role: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=10)
    difficulty: str = Field("medium", pattern=r"^(easy|medium|hard)$")
    result: str = Field("pending", pattern=r"^(selected|rejected|pending)$")


class ExperienceUpdate(BaseModel):
    company: str | None = Field(None, min_length=1, max_length=200)
    role: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, min_length=10)
    difficulty: str | None = Field(None, pattern=r"^(easy|medium|hard)$")
    result: str | None = Field(None, pattern=r"^(selected|rejected|pending)$")


class AuthorResponse(BaseModel):
    id: int
    username: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str | None = None
    avatar_url: str | None = None
    is_verified: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class ExperienceResponse(BaseModel):
    id: int
    company: str
    role: str
    description: str
    difficulty: str
    result: str
    likes_count: int
    is_edited: bool
    liked_by_me: bool = False
    comments_count: int = 0
    author: AuthorResponse
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ExperienceListResponse(BaseModel):
    """Cursor-paginated response for the experience feed."""
    items: list[ExperienceResponse]
    next_cursor: str | None = None
    has_more: bool = False
