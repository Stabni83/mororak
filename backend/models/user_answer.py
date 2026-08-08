"""Records of a user answering a standalone question, plus question bookmarks."""
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class UserAnswer(Base):
    """One submitted answer to a Question (standalone practice or exam)."""

    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    # Nullable for standalone question practice. For exam answers it points to
    # the exact attempt so changing an answer does not create duplicate activity.
    exam_attempt_id = Column(Integer, ForeignKey("exam_attempts.id", ondelete="SET NULL"), nullable=True, index=True)
    selected_option_id = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    personal_note = Column(Text, nullable=True)  # optional note the user leaves for themselves

    user = relationship("User", backref="answers")
    question = relationship("Question")
    exam_attempt = relationship("ExamAttempt", backref="user_answers")


class SavedQuestion(Base):
    """A user's bookmark on a standalone question."""

    __tablename__ = "saved_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="saved_questions")
    question = relationship("Question")
