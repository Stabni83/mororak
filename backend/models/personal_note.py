"""A user's private notebook attached to a shared Note.

This lets a student write their own summary or extra thoughts under an
official note, without changing the original note content for other users.
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from backend.database import Base


class UserNote(Base):
    __tablename__ = "user_notes"
    __table_args__ = (UniqueConstraint("user_id", "note_id", name="uq_user_note_user_note"),)

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False, default="")
    # updated_at is refreshed automatically by the database every time this row changes.
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", backref="personal_notes")
    note = relationship("Note", backref="personal_notes")
