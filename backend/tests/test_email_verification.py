import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from datetime import timedelta, timezone, datetime
from app.models.user import User
from app.models.token import AccountToken
from app.utils.security import hash_password

def test_request_verification(client: TestClient, db: Session):
    # 1. Create a user
    user = User(
        username="testverify",
        email="verify@example.com",
        hashed_password=hash_password("password123"),
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # 2. Login to get token
    login_res = client.post("/api/auth/login", json={"email": "verify@example.com", "password": "password123"})
    assert login_res.status_code == 200

    # 3. Request verification
    res = client.post("/api/auth/request-verification")
    assert res.status_code == 200
    assert res.json()["message"] == "Verification email sent"

    # 4. Check if token was created in DB
    token_record = db.query(AccountToken).filter(AccountToken.user_id == user.id, AccountToken.purpose == "verify_email").first()
    assert token_record is not None
    assert len(token_record.token) > 20

def test_verify_email_success(client: TestClient, db: Session):
    # 1. Create user and token
    user = User(
        username="successverify",
        email="success@example.com",
        hashed_password=hash_password("password123"),
        is_verified=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token_str = "secret-verification-token"
    expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
    db_token = AccountToken(
        user_id=user.id,
        token=token_str,
        purpose="verify_email",
        expires_at=expires_at
    )
    db.add(db_token)
    db.commit()

    # 2. Verify email
    res = client.post(f"/api/auth/verify-email?token={token_str}")
    assert res.status_code == 200
    assert res.json()["message"] == "Email verified successfully"

    # 3. Check user state
    db.refresh(user)
    assert user.is_verified is True

    # 4. Check token deleted
    token_check = db.query(AccountToken).filter(AccountToken.token == token_str).first()
    assert token_check is None

def test_verify_email_invalid_token(client: TestClient):
    res = client.post("/api/auth/verify-email?token=invalid-token")
    assert res.status_code == 400
    assert "Invalid or expired token" in res.json()["detail"]
