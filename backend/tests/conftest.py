"""Shared pytest fixtures for the backend test suite.

The app's database engine is normally a hardcoded SQLite file at the repo
root (backend/database.py). To avoid the test suite touching that real
file, this module swaps `backend.database.engine`/`SessionLocal` for a
throwaway SQLite file *before* anything that depends on them (routers,
migrate.ensure_schema, backend.main) gets imported for the first time.

This has to happen at module import time (not inside a fixture function),
because pytest imports every test module - and conftest.py first - during
collection, before any fixture runs.
"""
import tempfile
from pathlib import Path

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

_TEST_DB_PATH = Path(tempfile.gettempdir()) / "mororak_test.db"
_TEST_DB_PATH.unlink(missing_ok=True)

import backend.database as database  # noqa: E402

_test_engine = create_engine(f"sqlite:///{_TEST_DB_PATH}", connect_args={"check_same_thread": False})
database.engine = _test_engine
database.SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_test_engine)

from fastapi.testclient import TestClient  # noqa: E402

from backend.main import app  # noqa: E402  (ensure_schema() runs now, against the test engine)
from backend.migrate import ensure_schema  # noqa: E402
from backend.models.user import User  # noqa: E402


@pytest.fixture()
def client():
    """A TestClient backed by a freshly wiped database for every test."""
    database.Base.metadata.drop_all(bind=_test_engine)
    ensure_schema()
    with TestClient(app) as test_client:
        yield test_client


def register_user(client: TestClient, email: str, name: str = "کاربر تست", password: str = "supersecret1") -> dict:
    """Register + log in a new user, returning {"headers", "email", "password"}."""
    response = client.post("/api/auth/register", json={"name": name, "email": email, "password": password})
    assert response.status_code == 201, response.text

    login = client.post("/api/auth/login", data={"username": email, "password": password})
    assert login.status_code == 200, login.text
    token = login.json()["access_token"]
    return {"headers": {"Authorization": f"Bearer {token}"}, "email": email, "password": password}


def make_admin(email: str) -> None:
    """Promote a user to admin directly via the test database, mirroring make_admin.py."""
    db = database.SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        assert user is not None
        user.is_admin = True
        db.commit()
    finally:
        db.close()
