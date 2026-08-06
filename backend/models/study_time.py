from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class StudyTime(Base):
    __tablename__ = "study_times"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=True)
    date = Column(String, nullable=False) # فرمت YYYY-MM-DD
    seconds = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="study_times")