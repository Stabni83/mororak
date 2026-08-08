"""Request/response shapes for the daily study-time logging endpoint."""
from typing import Optional

from pydantic import BaseModel


class StudyTimeCreate(BaseModel):
    note_id: Optional[int] = None
    date: str  # "YYYY-MM-DD"
    seconds: int


class StudyTimeResponse(StudyTimeCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True
