import pytest
from app.utils.rate_limiter import login_rate_limiter
from app.models.user import User
from app.utils.security import hash_password


def test_password_strength_validation(client):
    # Too short (< 8 chars)
    res = client.post("/api/auth/register", json={
        "username": "shortpass",
        "email": "short@example.com",
        "password": "Pass1"
    })
    assert res.status_code == 422

    # No uppercase
    res = client.post("/api/auth/register", json={
        "username": "nouppercase",
        "email": "noupper@example.com",
        "password": "password123"
    })
    assert res.status_code == 422

    # No number
    res = client.post("/api/auth/register", json={
        "username": "nonumber",
        "email": "nonum@example.com",
        "password": "PasswordWithoutNumber"
    })
    assert res.status_code == 422

    # Valid strong password
    res = client.post("/api/auth/register", json={
        "username": "validuser",
        "email": "valid@example.com",
        "password": "StrongPassword123"
    })
    assert res.status_code == 201


def test_login_brute_force_lockout(client, db):
    # Ensure fresh state
    login_rate_limiter._records.clear()

    target_email = "brutetest@example.com"
    user = User(
        username="brutetest",
        email=target_email,
        hashed_password=hash_password("SuperSecret123"),
        is_verified=True
    )
    db.add(user)
    db.commit()
    
    # 4 failed attempts should return 401 with remaining attempts warning
    for i in range(1, 5):
        res = client.post("/api/auth/login", json={
            "email": target_email,
            "password": "WrongPassword999"
        })
        assert res.status_code == 401
        expected_remaining = 5 - i
        assert f"{expected_remaining} attempt" in res.json()["detail"]

    # 5th failed attempt should trigger 429 Lockout
    res5 = client.post("/api/auth/login", json={
        "email": target_email,
        "password": "WrongPassword999"
    })
    assert res5.status_code == 429
    assert "temporarily locked" in res5.json()["detail"]

    # Subsequent attempt during lockout should also return 429
    res_locked = client.post("/api/auth/login", json={
        "email": target_email,
        "password": "SuperSecret123"
    })
    assert res_locked.status_code == 429
    assert "temporarily locked" in res_locked.json()["detail"]

    # Reset limiter for test cleanup
    login_rate_limiter._records.clear()

    # Now login with correct password succeeds and resets limiter
    res_success = client.post("/api/auth/login", json={
        "email": target_email,
        "password": "SuperSecret123"
    })
    assert res_success.status_code == 200
