"""Daily study-time log used to draw the activity chart on the dashboard.

One row is written per user, per day, per note (see routers/study.py), so we
can later add up "minutes studied" for any date range.
"""
from sqlalchemy import Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.database import Base


class StudyTime(Base):
    __tablename__ = "study_times"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    resource_id = Column(Integer, ForeignKey("resources.id"), nullable=True)
    date = Column(String, nullable=False)  # stored as "YYYY-MM-DD" for simple string comparisons
    seconds = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="study_times")
