from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.study_time import StudyTime
from backend.schemas.study_time import StudyTimeCreate
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/study", tags=["Study Time"])

@router.post("/log")
def log_study_time(
    data: StudyTimeCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(StudyTime).filter(
        StudyTime.user_id == current_user.id,
        StudyTime.date == data.date,
        StudyTime.note_id == data.note_id
    ).first()

    if existing:
        existing.seconds = data.seconds
    else:
        new_record = StudyTime(
        id=None,
            user_id=current_user.id,
            note_id=data.note_id,
            date=data.date,
            seconds=data.seconds
        )
        db.add(new_record)

    db.commit()
    return {"status": "success", "seconds": data.seconds}
