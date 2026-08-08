"""A multiple-choice question. Can stand alone or be attached to an Exam."""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)  # "beginner" | "intermediate" | "advanced"
    text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # list[str]
    correct_option_id = Column(Integer, nullable=False)  # index into `options`
    explanation = Column(Text, nullable=False)
    code_example = Column(Text, nullable=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # Legacy column, same caveat as Note.is_saved - see models/saved.py /
    # models/user_answer.py:SavedQuestion for the real per-user bookmark data.
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
