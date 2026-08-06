# backend/schemas/progress.py
from pydantic import BaseModel
from typing import List

class UserProgressResponse(BaseModel):
    total_notes: int
    total_questions: int
    completed_courses: int
    progress_percentage: int
    suggested_subjects: List[str]  

    class Config:
        from_attributes = True