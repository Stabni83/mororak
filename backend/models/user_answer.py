from sqlalchemy import Column, Integer, ForeignKey, Boolean, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.database import Base

class UserAnswer(Base):
    __tablename__ = "user_answers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_option_id = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    personal_note = Column(Text, nullable=True)

    user = relationship("User", backref="answers")
    question = relationship("Question")

class SavedQuestion(Base):
    __tablename__ = "saved_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    saved_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="saved_questions")
    question = relationship("Question")