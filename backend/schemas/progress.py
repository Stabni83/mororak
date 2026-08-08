"""Response shape for the (legacy) simple progress summary.

The dashboard now mostly uses the richer payload built directly in
routers/progress.py, but this schema is kept for any client still expecting
the original, simpler shape.
"""
from typing import List

from pydantic import BaseModel


class UserProgressResponse(BaseModel):
    total_notes: int
    total_questions: int
    completed_courses: int
    progress_percentage: int
    suggested_subjects: List[str]

    class Config:
        from_attributes = True
