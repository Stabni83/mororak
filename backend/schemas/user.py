"""Pydantic schemas for the auth flow: registration input, the public user
shape returned by the API, and the JWT token response."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back to the client - notice hashed_password is never
    included here, so it can never leak through the API by accident."""

    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    is_admin: bool
    created_at: Optional[datetime] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """The payload we expect to find inside a decoded JWT."""

    email: str
