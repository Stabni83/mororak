# backend/models/note.py
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from backend.database import Base

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    reading_time = Column(Integer, nullable=False)
    is_saved = Column(Boolean, default=False)  
    created_at = Column(DateTime(timezone=True), server_default=func.now())