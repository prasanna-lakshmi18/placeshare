def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "newuser", "email": "newuser@example.com", "password": "newpassword123"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data

def test_login_user(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "testpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    # Ensure cookies are set
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
