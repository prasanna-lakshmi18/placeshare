from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, and_, or_
from app.database import get_db
from app.models import User, Experience, Like, Comment
from app.schemas.experience import (
    ExperienceCreate, ExperienceUpdate, ExperienceResponse,
    ExperienceListResponse, AuthorResponse,
)
from app.utils.security import get_current_user, get_optional_user
from app.utils.pagination import encode_cursor, decode_cursor
from app.services.cache import cache

router = APIRouter(prefix="/api/experiences", tags=["Experiences"])

FEED_PAGE_SIZE = 10


def _build_response(exp: Experience, current_user: User | None, db: Session) -> ExperienceResponse:
    """Build an ExperienceResponse with liked_by_me and comments_count."""
    liked_by_me = False
    if current_user:
        liked_by_me = db.query(Like).filter(
            Like.user_id == current_user.id,
            Like.experience_id == exp.id,
        ).first() is not None

    comments_count = db.query(Comment).filter(Comment.experience_id == exp.id).count()

    return ExperienceResponse(
        id=exp.id,
        company=exp.company,
        role=exp.role,
        description=exp.description,
        difficulty=exp.difficulty,
        result=exp.result,
        likes_count=exp.likes_count,
        is_edited=exp.is_edited,
        liked_by_me=liked_by_me,
        comments_count=comments_count,
        author=AuthorResponse.model_validate(exp.author),
        created_at=exp.created_at,
        updated_at=exp.updated_at,
    )


@router.get("", response_model=ExperienceListResponse)
def list_experiences(
    cursor: str | None = Query(None),
    limit: int = Query(FEED_PAGE_SIZE, ge=1, le=50),
    search: str | None = Query(None),
    company: str | None = Query(None),
    role: str | None = Query(None),
    difficulty: str | None = Query(None),
    result: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Get paginated experience feed with cursor-based pagination."""
    query = db.query(Experience).options(joinedload(Experience.author))

    # Search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                Experience.company.ilike(search_term),
                Experience.role.ilike(search_term),
                Experience.description.ilike(search_term),
            )
        )
        
    # Advanced filters
    if company:
        query = query.filter(Experience.company.ilike(f"%{company}%"))
    if role:
        query = query.filter(Experience.role.ilike(f"%{role}%"))
    if difficulty:
        query = query.filter(Experience.difficulty == difficulty)
    if result:
        query = query.filter(Experience.result == result)

    # Cursor-based pagination: get items BEFORE the cursor (newest first)
    if cursor:
        try:
            cursor_time, cursor_id = decode_cursor(cursor)
            query = query.filter(
                or_(
                    Experience.created_at < cursor_time,
                    and_(
                        Experience.created_at == cursor_time,
                        Experience.id < cursor_id,
                    ),
                )
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid cursor")

    # Order by newest first, fetch limit+1 to check for more
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


@router.get("/{experience_id}", response_model=ExperienceResponse)
def get_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Get a single experience by ID."""
    exp = db.query(Experience).options(
        joinedload(Experience.author)
    ).filter(Experience.id == experience_id).first()

    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    return _build_response(exp, current_user, db)


@router.post("", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(
    data: ExperienceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new experience post."""
    exp = Experience(
        user_id=current_user.id,
        company=data.company,
        role=data.role,
        description=data.description,
        difficulty=data.difficulty,
        result=data.result,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)

    # Invalidate feed cache
    cache.invalidate_pattern("feed:")

    return _build_response(exp, current_user, db)


@router.put("/{experience_id}", response_model=ExperienceResponse)
def update_experience(
    experience_id: int,
    data: ExperienceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an experience (only by author)."""
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    if exp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this experience")

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exp, field, value)

    db.commit()
    db.refresh(exp)

    cache.invalidate_pattern("feed:")
    return _build_response(exp, current_user, db)


@router.delete("/{experience_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an experience (only by author)."""
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    if exp.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this experience")

    db.delete(exp)
    db.commit()
    cache.invalidate_pattern("feed:")


@router.post("/{experience_id}/like")
def toggle_like(
    experience_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle like on an experience. Returns the new like status."""
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    existing_like = db.query(Like).filter(
        Like.user_id == current_user.id,
        Like.experience_id == experience_id,
    ).first()

    if existing_like:
        # Unlike
        db.delete(existing_like)
        exp.likes_count = max(0, exp.likes_count - 1)
        liked = False
    else:
        # Like
        like = Like(user_id=current_user.id, experience_id=experience_id)
        db.add(like)
        exp.likes_count += 1
        liked = True

    db.commit()
    return {"liked": liked, "likes_count": exp.likes_count}
