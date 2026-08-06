from pydantic import BaseModel
from datetime import datetime

class NoteResponse(BaseModel):
    id: int
    slug: str
    title: str
    subject: str
    content: str
    reading_time: int
    created_at: datetime

    class Config:
        from_attributes = True