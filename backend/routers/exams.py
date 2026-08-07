from typing import Optional
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.schemas.exam import ExamCreate, AttemptSubmit, PracticeAnswer
from backend.services.exam_service import create_exam, list_exams, get_exam, toggle_save, start_attempt, submit_attempt, answer_practice
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/exams", tags=["Exams"])

@router.get("")
def exams(request: Request, subject: Optional[str] = None, exam_type: Optional[str] = None, is_saved: Optional[bool] = None, search: Optional[str] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dynamic = {key.removeprefix("filter_"): value for key, value in request.query_params.items() if key.startswith("filter_")}
    return list_exams(db, current_user.id, subject, exam_type, is_saved, search, dynamic)

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
    return start_attempt(db, exam_id, current_user.id)

@router.post("/{exam_id}/attempts/{attempt_id}/submit")
def submit(exam_id: int, attempt_id: int, data: AttemptSubmit, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return submit_attempt(db, exam_id, attempt_id, current_user.id, data)


@router.post("/{exam_id}/practice-answer")
def practice_answer(exam_id: int, data: PracticeAnswer, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return answer_practice(db, exam_id, current_user.id, data)
