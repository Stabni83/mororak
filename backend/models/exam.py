from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, Float, JSON, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class Exam(Base):
    __tablename__ = "exams"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String, nullable=False)
    author = Column(String, nullable=False, default="مرورک")
    exam_type = Column(String, nullable=False, default="practice")
    time_limit_seconds = Column(Integer, nullable=True)
    show_answers_immediately = Column(Boolean, nullable=False, default=True)
    filter_values = Column(JSON, nullable=False, default=dict)
    is_published = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    questions = relationship("ExamQuestion", back_populates="exam", cascade="all, delete-orphan", order_by="ExamQuestion.position")

class ExamQuestion(Base):
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
    __tablename__ = "exam_attempts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    last_activity_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, nullable=False, default=0)
    score = Column(Float, nullable=True)
    # Legacy columns are kept mapped because older SQLite databases declared them NOT NULL.
    # Mapping them with defaults prevents INSERT failures while remaining backward compatible.
    total_questions = Column(Integer, nullable=False, default=0)
    correct_answers = Column(Integer, nullable=False, default=0)
    answered_questions = Column(Integer, nullable=False, default=0)
    correct_count = Column(Integer, nullable=False, default=0)
    wrong_count = Column(Integer, nullable=False, default=0)
    unanswered_count = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="in_progress")
    answers = Column(JSON, nullable=False, default=dict)
    user = relationship("User", backref="exam_attempts")
    exam = relationship("Exam")
