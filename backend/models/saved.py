"""Bookmark tables for notes and exams (mirrors SavedQuestion in user_answer.py)."""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class SavedNote(Base):
    __tablename__ = "saved_notes"
    __table_args__ = (UniqueConstraint("user_id", "note_id", name="uq_saved_note_user_note"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="saved_notes")
    note = relationship("Note")


class SavedExam(Base):
    """Kept for backward compatibility; exam-level saving is no longer
    exposed in the current UI (see services/exam_service.py list_exams)."""

    __tablename__ = "saved_exams"
    __table_args__ = (UniqueConstraint("user_id", "exam_id", name="uq_saved_exam_user_exam"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", backref="saved_exams")
    exam = relationship("Exam")
