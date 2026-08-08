"""Tests for registration, login, and JWT-protected access."""
from tests.conftest import register_user


def test_register_and_login(client):
    user = register_user(client, "auth-flow@example.com")

    me = client.get("/api/auth/me", headers=user["headers"])
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == "auth-flow@example.com"
    assert body["is_admin"] is False
    # The hashed password must never be exposed through the API.
    assert "hashed_password" not in body
    assert "password" not in body


def test_register_duplicate_email_is_rejected(client):
    register_user(client, "duplicate@example.com")

    response = client.post(
        "/api/auth/register",
        json={"name": "دوباره", "email": "duplicate@example.com", "password": "anotherpass1"},
    )
    assert response.status_code == 400


def test_login_with_wrong_password_is_rejected(client):
    register_user(client, "wrongpass@example.com", password="correct-password")

    response = client.post(
        "/api/auth/login",
        data={"username": "wrongpass@example.com", "password": "not-the-password"},
    )
    assert response.status_code == 401


def test_login_with_unknown_email_is_rejected(client):
    response = client.post(
        "/api/auth/login",
        data={"username": "nobody@example.com", "password": "whatever123"},
    )
    assert response.status_code == 401


def test_protected_endpoint_requires_token(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_protected_endpoint_rejects_garbage_token(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert response.status_code == 401
