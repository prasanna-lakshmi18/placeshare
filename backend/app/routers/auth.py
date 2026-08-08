from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
import secrets
from datetime import timedelta, datetime, timezone
from app.database import get_db
from app.models.user import User
from app.models.token import AccountToken
from app.schemas.user import UserCreate, UserLogin, UserResponse, EmailRequest, PasswordReset
from app.utils.security import (
    hash_password, verify_password, create_token, decode_token,
    get_current_user, set_auth_cookies, clear_auth_cookies,
)
from app.utils.email import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: UserCreate,
    response: Response,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Register a new user account."""
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate verification token and dispatch email in background
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db_token = AccountToken(user_id=user.id, token=token, purpose="verify_email", expires_at=expires_at)
    db.add(db_token)
    db.commit()

    background_tasks.add_task(send_verification_email, user.email, token)

    access_token = create_token({"sub": str(user.id)}, "access")
    refresh_token = create_token({"sub": str(user.id)}, "refresh")
    set_auth_cookies(response, access_token, refresh_token)

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        created_at=user.created_at,
        access_token=access_token,
    )


@router.post("/login", response_model=UserResponse)
def login(credentials: UserLogin, response: Response, db: Session = Depends(get_db)):
    """Authenticate user and issue JWT tokens."""
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_token({"sub": str(user.id)}, "access")
    refresh_token = create_token({"sub": str(user.id)}, "refresh")
    set_auth_cookies(response, access_token, refresh_token)

    return UserResponse(
        id=user.id,
        username=user.username,
        email=user.email,
        avatar_url=user.avatar_url,
        is_verified=user.is_verified,
        created_at=user.created_at,
        access_token=access_token,
    )


@router.post("/logout")
def logout(response: Response):
    """Clear auth cookies."""
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user."""
    return current_user


@router.post("/refresh")
def refresh_tokens(request: Request, response: Response, db: Session = Depends(get_db)):
    """Rotate tokens using refresh token cookie."""
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token")

    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    access_token = create_token({"sub": str(user.id)}, "access")
    new_refresh_token = create_token({"sub": str(user.id)}, "refresh")
    set_auth_cookies(response, access_token, new_refresh_token)

    return {"message": "Tokens refreshed"}


@router.post("/request-verification")
async def request_verification(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.is_verified:
        return {"message": "Already verified"}
    
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    
    db_token = AccountToken(user_id=current_user.id, token=token, purpose="verify_email", expires_at=expires_at)
    db.add(db_token)
    db.commit()
    
    await send_verification_email(current_user.email, token)
    return {"message": "Verification email sent"}

@router.post("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    db_token = db.query(AccountToken).filter(
        AccountToken.token == token, 
        AccountToken.purpose == "verify_email"
    ).first()
    
    if not db_token or db_token.is_expired:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if user:
        user.is_verified = True
        
    db.delete(db_token)
    db.commit()
    return {"message": "Email verified successfully"}

@router.post("/forgot-password")
async def forgot_password(req: EmailRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # Prevent email enumeration by returning success anyway
        return {"message": "If the email is registered, a reset link has been sent"}
        
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    
    db_token = AccountToken(user_id=user.id, token=token, purpose="reset_password", expires_at=expires_at)
    db.add(db_token)
    db.commit()
    
    await send_password_reset_email(user.email, token)
    return {"message": "If the email is registered, a reset link has been sent"}

@router.post("/reset-password")
def reset_password(req: PasswordReset, db: Session = Depends(get_db)):
    db_token = db.query(AccountToken).filter(
        AccountToken.token == req.token, 
        AccountToken.purpose == "reset_password"
    ).first()
    
    if not db_token or db_token.is_expired:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
        
    user = db.query(User).filter(User.id == db_token.user_id).first()
    if user:
        user.hashed_password = hash_password(req.new_password)
        
    # Delete all reset tokens for this user
    db.query(AccountToken).filter(AccountToken.user_id == user.id, AccountToken.purpose == "reset_password").delete()
    db.commit()
    return {"message": "Password reset successfully"}
