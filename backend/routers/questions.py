"""CRUD + practice endpoints for standalone (non-exam) questions.

A "question" here is a single multiple-choice item that can either stand on
its own (answered from the Questions page) or be reused inside an Exam via
ExamQuestion. This router only deals with the standalone flow.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.question import Question
from backend.models.user import User
from backend.models.user_answer import SavedQuestion, UserAnswer
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/questions", tags=["Questions"])


class QuestionCreate(BaseModel):
    text: str
    subject: str
    difficulty: str
    options: list
    correct_option_id: int
    explanation: str
    code_example: Optional[str] = None
    note_id: Optional[int] = None


class AnswerCreate(BaseModel):
    selected_option_id: int
    personal_note: Optional[str] = None


def _saved_question_ids(db: Session, user_id: int) -> set[int]:
    """IDs of every question the current user has bookmarked."""
    rows = db.query(SavedQuestion).filter(SavedQuestion.user_id == user_id).all()
    return {row.question_id for row in rows}


def _question_payload(question: Question, is_saved: bool) -> dict:
    """Serialize a Question row into the shape the frontend expects.

    is_saved is computed per-request from the SavedQuestion table rather than
    read off the model, since "saved" is a per-user relationship and not an
    intrinsic property of the question itself.
    """
    return {
        "id": question.id,
        "subject": question.subject,
        "difficulty": question.difficulty,
        "text": question.text,
        "options": question.options,
        "correct_option_id": question.correct_option_id,
        "explanation": question.explanation,
        "code_example": question.code_example,
        "note_id": question.note_id,
        "created_by_id": question.created_by_id,
        "is_saved": is_saved,
        "created_at": question.created_at,
    }


@router.get("")
def list_questions(
    subject: Optional[str] = None,
    difficulty: Optional[str] = None,
    is_saved: Optional[bool] = None,
    mine: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List questions with optional subject/difficulty/saved filters.

    `mine=true` is used by the admin question editor to show only the
    questions this admin created (plus legacy ones with no owner).
    """
    query = db.query(Question)

    if subject and subject != "all":
        query = query.filter(Question.subject == subject)

    if difficulty and difficulty != "all":
        query = query.filter(Question.difficulty == difficulty)

    if mine is True:
        if not current_user.is_admin:
            raise HTTPException(403, "دسترسی مدیر لازم است")
        query = query.filter(
            (Question.created_by_id == current_user.id)
            | (Question.created_by_id.is_(None))
        )

    questions = query.order_by(Question.created_at.desc()).all()
    saved_ids = _saved_question_ids(db, current_user.id)

    if is_saved is True:
        questions = [q for q in questions if q.id in saved_ids]
    elif is_saved is False:
        questions = [q for q in questions if q.id not in saved_ids]

    return [_question_payload(q, q.id in saved_ids) for q in questions]


@router.get("/{question_id}")
def get_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "سؤال یافت نشد")

    is_saved = (
        db.query(SavedQuestion)
        .filter(
            SavedQuestion.user_id == current_user.id,
            SavedQuestion.question_id == question.id,
        )
        .first()
        is not None
    )
    return _question_payload(question, is_saved)


@router.post("", status_code=201)
def create_question(
    data: QuestionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_admin:
        raise HTTPException(403, "دسترسی مدیر لازم است")

    if data.difficulty not in {"beginner", "intermediate", "advanced"}:
        raise HTTPException(422, "سطح سختی نامعتبر است")

    if not data.options or not (0 <= data.correct_option_id < len(data.options)):
        raise HTTPException(422, "گزینه صحیح نامعتبر است")

    question = Question(**data.model_dump(), created_by_id=current_user.id)
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/{question_id}/save")
def toggle_save(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Bookmark/unbookmark a question for the current user."""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "سؤال یافت نشد")

    saved = (
        db.query(SavedQuestion)
        .filter(
            SavedQuestion.user_id == current_user.id,
            SavedQuestion.question_id == question_id,
        )
        .first()
    )

    if saved:
        db.delete(saved)
        is_saved = False
    else:
        db.add(SavedQuestion(user_id=current_user.id, question_id=question_id))
        is_saved = True

    db.commit()
    return {"is_saved": is_saved}


@router.post("/{question_id}/answer")
def answer(
    question_id: int,
    data: AnswerCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Record the user's answer and immediately tell them if it was correct.

    This powers the Active Recall loop: answer -> instant feedback ->
    explanation, without a separate "grade" step.
    """
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "سؤال یافت نشد")

    is_correct = data.selected_option_id == question.correct_option_id
    record = UserAnswer(
        user_id=current_user.id,
        question_id=question_id,
        selected_option_id=data.selected_option_id,
        is_correct=is_correct,
        personal_note=data.personal_note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "is_correct": is_correct,
        "correct_option_id": question.correct_option_id,
        "explanation": question.explanation,
    }
