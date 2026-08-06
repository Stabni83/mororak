# backend/schemas/question.py
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any

class QuestionResponse(BaseModel):
    id: int
    subject: str
    difficulty: str
    text: str
    options: List[Any]
    correct_option_id: int
    explanation: str
    code_example: Optional[str] = None
    note_id: Optional[int] = None
    is_saved: bool  # اضافه شد
    created_at: datetime

    class Config:
        from_attributes = True

class AnswerSubmit(BaseModel):
    selected_option_id: int
    personal_note: Optional[str] = None

class AnswerResponse(BaseModel):
    id: int
    is_correct: bool
    correct_option_id: int
    explanation: str
    answered_at: datetime

    class Config:
        from_attributes = True