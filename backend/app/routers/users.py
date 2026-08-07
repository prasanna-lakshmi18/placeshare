from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from app.database import get_db
from app.models import User, Experience
from app.schemas.experience import ExperienceListResponse, AuthorResponse
from app.schemas.comment import UserCommentResponse, UserCommentListResponse
from app.routers.experiences import _build_response, FEED_PAGE_SIZE
from app.utils.pagination import encode_cursor, decode_cursor
from app.utils.security import get_optional_user

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/{user_id}", response_model=AuthorResponse)
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    """Get a user's public profile data."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return AuthorResponse.model_validate(user)

@router.get("/{user_id}/experiences", response_model=ExperienceListResponse)
def get_user_experiences(
    user_id: int,
    cursor: str | None = Query(None),
    limit: int = Query(FEED_PAGE_SIZE, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Get experiences shared by a specific user."""
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    query = db.query(Experience).options(joinedload(Experience.author)).filter(Experience.user_id == user_id)

    if cursor:
        try:
            cursor_time, cursor_id = decode_cursor(cursor)
            query = query.filter(
                (Experience.created_at < cursor_time) |
                ((Experience.created_at == cursor_time) & (Experience.id < cursor_id))
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    experiences = query.order_by(
        desc(Experience.created_at),
        desc(Experience.id),
    ).limit(limit + 1).all()

    has_more = len(experiences) > limit
    if has_more:
        experiences = experiences[:limit]

    next_cursor = None
    if has_more and experiences:
        last = experiences[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    items = [_build_response(exp, current_user, db) for exp in experiences]

    return ExperienceListResponse(items=items, next_cursor=next_cursor, has_more=has_more)


@router.get("/{user_id}/comments", response_model=UserCommentListResponse)
def get_user_comments(
    user_id: int,
    cursor: str | None = Query(None),
    limit: int = Query(FEED_PAGE_SIZE, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """Get comments made by a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from app.models import Comment
    query = db.query(Comment).options(joinedload(Comment.experience)).filter(Comment.user_id == user_id)

    if cursor:
        try:
            cursor_time, cursor_id = decode_cursor(cursor)
            query = query.filter(
                (Comment.created_at < cursor_time) |
                ((Comment.created_at == cursor_time) & (Comment.id < cursor_id))
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    comments = query.order_by(
        desc(Comment.created_at),
        desc(Comment.id),
    ).limit(limit + 1).all()

    has_more = len(comments) > limit
    if has_more:
        comments = comments[:limit]

    next_cursor = None
    if has_more and comments:
        last = comments[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    items = [
        UserCommentResponse(
            id=c.id,
            content=c.content,
            is_edited=c.is_edited,
            parent_id=c.parent_id,
            experience_id=c.experience_id,
            experience_company=c.experience.company,
            experience_role=c.experience.role,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for c in comments
    ]

    return UserCommentListResponse(items=items, next_cursor=next_cursor, has_more=has_more)


@router.get("/{user_id}/likes", response_model=ExperienceListResponse)
def get_user_likes(
    user_id: int,
    cursor: str | None = Query(None),
    limit: int = Query(FEED_PAGE_SIZE, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Get experiences liked by a specific user."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    from app.models import Like
    query = db.query(Experience).options(joinedload(Experience.author)).join(Like).filter(Like.user_id == user_id)

    if cursor:
        try:
            cursor_time, cursor_id = decode_cursor(cursor)
            query = query.filter(
                (Experience.created_at < cursor_time) |
                ((Experience.created_at == cursor_time) & (Experience.id < cursor_id))
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    experiences = query.order_by(
        desc(Experience.created_at),
        desc(Experience.id),
    ).limit(limit + 1).all()

    has_more = len(experiences) > limit
    if has_more:
        experiences = experiences[:limit]

    next_cursor = None
    if has_more and experiences:
        last = experiences[-1]
        next_cursor = encode_cursor(last.created_at, last.id)

    items = [_build_response(exp, current_user, db) for exp in experiences]

    return ExperienceListResponse(items=items, next_cursor=next_cursor, has_more=has_more)
