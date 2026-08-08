"""Exam endpoints (list/detail/create/save + practice & timed attempts).

The actual business logic lives in backend/services/exam_service.py; this
router is intentionally a thin HTTP layer that just validates the request
shape and delegates.
"""
from typing import Optional

from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.user import User
from backend.schemas.exam import AttemptSubmit, ExamCreate, PracticeAnswer
from backend.services.exam_service import (
    answer_practice,
    create_exam,
    get_exam,
    list_exams,
    start_attempt,
    submit_attempt,
    toggle_save,
)
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/exams", tags=["Exams"])


@router.get("")
def exams(
    request: Request,
    subject: Optional[str] = None,
    exam_type: Optional[str] = None,
    is_saved: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Admin-defined filters (see catalog.py) arrive as ?filter_<key>=<value>
    # query params. We can't know their names ahead of time, so we pull them
    # straight out of the raw query string here and hand them to the service.
    dynamic_filters = {
        key.removeprefix("filter_"): value
        for key, value in request.query_params.items()
        if key.startswith("filter_")
    }
    return list_exams(db, current_user.id, subject, exam_type, is_saved, search, dynamic_filters)


@router.get("/{exam_id}")
def exam(exam_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_exam(db, exam_id, current_user.id)


@router.post("", status_code=201)
def create(data: ExamCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_exam(db, data, current_user)


@router.patch("/{exam_id}/save")
def save(exam_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return toggle_save(db, exam_id, current_user.id)


@router.post("/{exam_id}/attempts")
def begin(exam_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Start a new timed-exam attempt."""
    return start_attempt(db, exam_id, current_user.id)


@router.post("/{exam_id}/attempts/{attempt_id}/submit")
def submit(
    exam_id: int,
    attempt_id: int,
    data: AttemptSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Finish a timed-exam attempt and grade it."""
    return submit_attempt(db, exam_id, attempt_id, current_user.id, data)


@router.post("/{exam_id}/practice-answer")
def practice_answer(
    exam_id: int,
    data: PracticeAnswer,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Answer one question in an untimed practice exam (instant feedback)."""
    return answer_practice(db, exam_id, current_user.id, data)
