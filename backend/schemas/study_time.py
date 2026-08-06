from pydantic import BaseModel
from typing import Optional

class StudyTimeCreate(BaseModel):
    note_id: Optional[int] = None
    date: str
    seconds: int

class StudyTimeResponse(StudyTimeCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True