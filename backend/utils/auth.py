"""JWT authentication helpers: password hashing, token issuing/decoding,
and the get_current_user / require_admin FastAPI dependencies used across
every protected router.
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.schemas.user import TokenData

# In production, set MORORAK_SECRET_KEY as an environment variable - the
# fallback below is only for local development.
SECRET_KEY = os.getenv("MORORAK_SECRET_KEY", "mororak-development-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Encode a JWT access token. `data` typically holds {"sub": user.email}."""
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Decode the bearer token and load the matching user, or 401."""
    auth_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="خطا در احراز هویت کاربر.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise auth_error
        TokenData(email=email)  # validates the shape of the token payload
    except JWTError:
        raise auth_error

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise auth_error
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency that additionally enforces the caller is an admin."""
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="دسترسی مدیر لازم است")
    return current_user
