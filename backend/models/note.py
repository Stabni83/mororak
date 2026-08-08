"""A study note (article) belonging to a subject, e.g. "Big-O Notation"."""
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from sqlalchemy.sql import func

from backend.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    author = Column(String, nullable=False, default="مرورک")
    reading_time = Column(Integer, nullable=False)  # minutes, estimated from word count
    # NOTE: is_saved is legacy - "saved" is really a per-user relationship
    # (see models/saved.py SavedNote). The routers compute is_saved at
    # request time from SavedNote and only touch this column for backward
    # compatibility with the response schema; don't rely on this value being
    # correct on its own.
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
