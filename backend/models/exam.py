"""Exam, its questions, and a user's attempt at taking it."""
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)
    author = Column(String, nullable=False, default="مرورک")
    exam_type = Column(String, nullable=False, default="practice")  # "practice" | "timed"
    time_limit_seconds = Column(Integer, nullable=True)  # required when exam_type == "timed"
    show_answers_immediately = Column(Boolean, nullable=False, default=True)
    filter_values = Column(JSON, nullable=False, default=dict)  # values for admin-defined filters
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    questions = relationship(
        "ExamQuestion", back_populates="exam", cascade="all, delete-orphan", order_by="ExamQuestion.position"
    )


class ExamQuestion(Base):
    """Join table: which questions belong to an exam, in what order, worth
    how many points."""

    __tablename__ = "exam_questions"
    __table_args__ = (UniqueConstraint("exam_id", "question_id", name="uq_exam_question"),)

    id = Column(Integer, primary_key=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    question_id = Column(Integer, ForeignKey("questions.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(Integer, nullable=False)
    points = Column(Float, nullable=False, default=1)

    exam = relationship("Exam", back_populates="questions")
    question = relationship("Question")


class ExamAttempt(Base):
    """One user's attempt (in progress, practice, or completed) at an exam."""

    __tablename__ = "exam_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=True)  # percentage, 0-100
    # Legacy columns are kept mapped because older SQLite databases declared them NOT NULL.
    # Mapping them with defaults prevents INSERT failures while remaining backward compatible.
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    answered_questions = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    wrong_count = Column(Integer, nullable=False, default=0)
    unanswered_count = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="in_progress")  # in_progress | practice | completed | timed_out
    answers = Column(JSON, nullable=False, default=dict)  # {question_id: {selected_option_id, is_correct}}

    user = relationship("User", backref="exam_attempts")
    exam = relationship("Exam")
