"""Uploaded study resources (PDFs and images) that a user brings from their
own device. Each resource remembers how far the user got (page number for
PDFs) so viewing can resume where they left off - the same "resume where you
left off" idea already used for notes, just applied to the user's own files.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class Resource(Base):
    __tablename__ = "resources"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    title = Column(String, nullable=False)
    subject = Column(String, nullable=True)
    resource_type = Column(String, nullable=False)  # "pdf" | "image"

    original_filename = Column(String, nullable=False)
    stored_filename = Column(String, nullable=False, unique=True)  # random name on disk
    mime_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)

    # Bookmark: for PDFs, the page the user was last on (1-indexed).
    # Images have no concept of pages, so these stay null for them.
    last_page = Column(Integer, nullable=True)
    total_pages = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_viewed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User")
