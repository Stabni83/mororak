from datetime import datetime
from pydantic import BaseModel, ConfigDict

class NoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    slug: str
    title: str
    subject: str
    content: str
    author: str = "مرورک"
    reading_time: int
    is_saved: bool = False
    created_at: datetime
