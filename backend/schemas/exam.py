"""Request/response shapes for exam creation and taking exams."""
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ExamQuestionCreate(BaseModel):
    """One question slot inside an exam being created, with its order and weight."""

    question_id: int
    position: int = Field(ge=1)
    points: float = Field(default=1, gt=0)


class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    author: str = "مرورک"
    exam_type: str = "practice"  # "practice" | "timed"
    time_limit_seconds: Optional[int] = Field(default=None, ge=1)
    show_answers_immediately: bool = True
    is_published: bool = True
    questions: List[ExamQuestionCreate]
    filter_values: Dict[str, Any] = Field(default_factory=dict)


class AttemptSubmit(BaseModel):
    """Final answers submitted when finishing a timed exam attempt."""

    answers: Dict[str, int] = Field(default_factory=dict)  # {question_id: selected_option_id}


class PracticeAnswer(BaseModel):
    """A single answer submitted while taking an untimed practice exam."""

    question_id: int
    selected_option_id: int


class AttemptOut(BaseModel):
    id: int
    exam_id: int
    status: str
    duration_seconds: int
    score: Optional[float]
    correct_count: int
    wrong_count: int
    unanswered_count: int
    started_at: datetime
    finished_at: Optional[datetime]
    answers: Dict[str, dict]
