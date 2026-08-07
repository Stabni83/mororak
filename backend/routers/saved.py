from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.models.saved import SavedNote, SavedExam
from backend.models.user_answer import SavedQuestion
from backend.models.note import Note
from backend.models.question import Question
from backend.models.exam import Exam
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Saved & Recent"])


def _saved_item(item_type: str, item_id: int, title: str, href: str, subject: str | None, saved_at: Any):
    return {
        "type": item_type,
        "id": item_id,
        "title": title,
        "href": href,
        "subject": subject,
        "saved_at": saved_at,
    }


@router.get("/saved")
def get_saved_items(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = []

    for row in db.query(SavedNote).filter(SavedNote.user_id == current_user.id).order_by(SavedNote.saved_at.desc()).all():
        note = db.query(Note).filter(Note.id == row.note_id).first()
        if note:
            result.append(_saved_item("note", note.id, note.title, f"/dashboard/notes/{note.id}", note.subject, row.saved_at))

    for row in db.query(SavedQuestion).filter(SavedQuestion.user_id == current_user.id).order_by(SavedQuestion.saved_at.desc()).all():
        question = db.query(Question).filter(Question.id == row.question_id).first()
        if question:
            result.append(_saved_item("question", question.id, question.text, f"/dashboard/questions/{question.id}", question.subject, row.saved_at))

    for row in db.query(SavedExam).filter(SavedExam.user_id == current_user.id).order_by(SavedExam.saved_at.desc()).all():
        exam = db.query(Exam).filter(Exam.id == row.exam_id).first()
        if exam:
            result.append(_saved_item("exam", exam.id, exam.title, f"/dashboard/exams/{exam.id}", exam.subject, row.saved_at))

    result.sort(key=lambda x: str(x.get("saved_at") or ""), reverse=True)
    return result
