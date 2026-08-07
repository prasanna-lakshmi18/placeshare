"""Comments router — flat-load + tree-build strategy to avoid N+1.

All comments for an experience are loaded in a single query, then assembled
into a nested tree structure in Python. This is the key bottleneck mitigation.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import User, Experience, Comment
from app.schemas.comment import CommentCreate, CommentUpdate, CommentResponse, CommentTreeResponse, CommentAuthor
from app.utils.security import get_current_user

router = APIRouter(prefix="/api/experiences/{experience_id}/comments", tags=["Comments"])


def _build_comment_tree(comments: list[Comment]) -> list[CommentTreeResponse]:
    """Build a nested tree from a flat list of comments.

    Strategy: O(n) time — single pass to index by id, then link children to parents.
    This avoids the N+1 query problem entirely.
    """
    # Build lookup dict
    nodes: dict[int, dict] = {}
    for c in comments:
        nodes[c.id] = {
            "id": c.id,
            "content": c.content,
            "is_edited": c.is_edited,
            "author": CommentAuthor.model_validate(c.author),
            "parent_id": c.parent_id,
            "experience_id": c.experience_id,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "children": [],
        }

    # Link children to parents
    roots = []
    for c in comments:
        node = nodes[c.id]
        if c.parent_id and c.parent_id in nodes:
            nodes[c.parent_id]["children"].append(node)
        else:
            roots.append(node)

    # Convert to Pydantic models
    def to_pydantic(node_dict: dict) -> CommentTreeResponse:
        node_dict["children"] = [to_pydantic(child) for child in node_dict["children"]]
        return CommentTreeResponse(**node_dict)

    return [to_pydantic(r) for r in roots]


@router.get("", response_model=list[CommentTreeResponse])
def get_comments(
    experience_id: int,
    db: Session = Depends(get_db),
):
    """Get all comments for an experience as a nested tree.

    Single query loads ALL comments, then tree is built in Python — O(n).
    """
    # Verify experience exists
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    # Flat-load ALL comments for this experience in one query
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.author))
        .filter(Comment.experience_id == experience_id)
        .order_by(Comment.created_at.asc())
        .all()
    )

    return _build_comment_tree(comments)


@router.post("", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    experience_id: int,
    data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new comment (top-level or reply)."""
    exp = db.query(Experience).filter(Experience.id == experience_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")

    # Validate parent exists if replying
    if data.parent_id:
        parent = db.query(Comment).filter(
            Comment.id == data.parent_id,
            Comment.experience_id == experience_id,
        ).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent comment not found")

    comment = Comment(
        user_id=current_user.id,
        experience_id=experience_id,
        parent_id=data.parent_id,
        content=data.content,
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        is_edited=comment.is_edited,
        author=CommentAuthor.model_validate(current_user),
        parent_id=comment.parent_id,
        experience_id=comment.experience_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    experience_id: int,
    comment_id: int,
    data: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a comment (only by author)."""
    comment = db.query(Comment).options(joinedload(Comment.author)).filter(
        Comment.id == comment_id,
        Comment.experience_id == experience_id,
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this comment")

    comment.content = data.content
    db.commit()
    db.refresh(comment)

    return CommentResponse(
        id=comment.id,
        content=comment.content,
        is_edited=comment.is_edited,
        author=CommentAuthor.model_validate(comment.author),
        parent_id=comment.parent_id,
        experience_id=comment.experience_id,
        created_at=comment.created_at,
        updated_at=comment.updated_at,
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    experience_id: int,
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a comment and its children (cascade)."""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.experience_id == experience_id,
    ).first()

    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this comment")

    db.delete(comment)
    db.commit()
