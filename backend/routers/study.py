"""Study-time tracking endpoints.

The frontend calls POST /api/study/log every time a user finishes (or leaves)
a note-reading session, sending how many seconds were spent that day. We keep
one row per (user, date, note) so re-visiting the same note on the same day
simply updates the existing counter instead of creating duplicates.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.study_time import StudyTime
from backend.schemas.study_time import StudyTimeCreate
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/study", tags=["Study Time"])


@router.post("/log")
def log_study_time(
    data: StudyTimeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Upsert today's study-time counter for the current user."""
    existing = (
        db.query(StudyTime)
        .filter(
            StudyTime.user_id == current_user.id,
            StudyTime.date == data.date,
            StudyTime.note_id == data.note_id,
            StudyTime.resource_id == data.resource_id,
        )
        .first()
    )

    if existing:
        # Same user/date/note(or resource) combo already logged today -> just update it.
        existing.seconds = data.seconds
    else:
        db.add(
            StudyTime(
                user_id=current_user.id,
                note_id=data.note_id,
                resource_id=data.resource_id,
                date=data.date,
                seconds=data.seconds,
            )
        )

    db.commit()
    return {"status": "success", "seconds": data.seconds}
