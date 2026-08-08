"""Aggregated "everything I saved" endpoint.

Notes, questions, and exams each have their own bookmark table (see
models/saved.py and models/user_answer.py:SavedQuestion). This router just
merges the three lists into one feed for the "Saved" page in the dashboard.
"""
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.exam import Exam
from backend.models.note import Note
from backend.models.question import Question
from backend.models.saved import SavedExam, SavedNote
from backend.models.user import User
from backend.models.user_answer import SavedQuestion
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Saved & Recent"])


def _saved_item(item_type: str, item_id: int, title: str, href: str, subject: str | None, saved_at: Any) -> dict:
    """Build one entry of the merged "saved items" feed in a shared shape,
    regardless of whether it originally came from a note, question, or exam."""
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

    saved_notes = (
        db.query(SavedNote)
        .filter(SavedNote.user_id == current_user.id)
        .order_by(SavedNote.saved_at.desc())
        .all()
    )
    for row in saved_notes:
        note = db.query(Note).filter(Note.id == row.note_id).first()
        if note:
            result.append(_saved_item("note", note.id, note.title, f"/dashboard/notes/{note.id}", note.subject, row.saved_at))

    saved_questions = (
        db.query(SavedQuestion)
        .filter(SavedQuestion.user_id == current_user.id)
        .order_by(SavedQuestion.saved_at.desc())
        .all()
    )
    for row in saved_questions:
        question = db.query(Question).filter(Question.id == row.question_id).first()
        if question:
            result.append(
                _saved_item("question", question.id, question.text, f"/dashboard/questions/{question.id}", question.subject, row.saved_at)
            )

    saved_exams = (
        db.query(SavedExam)
        .filter(SavedExam.user_id == current_user.id)
        .order_by(SavedExam.saved_at.desc())
        .all()
    )
    for row in saved_exams:
        exam = db.query(Exam).filter(Exam.id == row.exam_id).first()
        if exam:
            result.append(_saved_item("exam", exam.id, exam.title, f"/dashboard/exams/{exam.id}", exam.subject, row.saved_at))

    # The three lists above are each sorted individually, so we sort the
    # merged result one more time to get a single, correctly ordered feed.
    result.sort(key=lambda item: str(item.get("saved_at") or ""), reverse=True)
    return result
