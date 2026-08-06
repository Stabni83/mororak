# backend/models/question.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, DateTime, Boolean
from sqlalchemy.sql import func
from backend.database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    difficulty = Column(String, nullable=False)
    text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    correct_option_id = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    code_example = Column(Text, nullable=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    is_saved = Column(Boolean, default=False)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())