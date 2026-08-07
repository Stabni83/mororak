from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.question import Question
from backend.models.user_answer import SavedQuestion, UserAnswer
from backend.models.user import User
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

@router.get("")
def list_questions(subject: Optional[str] = None, difficulty: Optional[str] = None, is_saved: Optional[bool] = None, mine: Optional[bool] = None, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    query = db.query(Question)
    if subject and subject != "all": query = query.filter(Question.subject == subject)
    if difficulty and difficulty != "all": query = query.filter(Question.difficulty == difficulty)
    if mine is True:
        if not current_user.is_admin:
            raise HTTPException(403, "دسترسی مدیر لازم است")
        query = query.filter((Question.created_by_id == current_user.id) | (Question.created_by_id.is_(None)))
    questions = query.order_by(Question.created_at.desc()).all()
    saved_ids = {x.question_id for x in db.query(SavedQuestion).filter(SavedQuestion.user_id == current_user.id).all()}
    if is_saved is True: questions = [q for q in questions if q.id in saved_ids]
    if is_saved is False: questions = [q for q in questions if q.id not in saved_ids]
    return [{"id": q.id, "subject": q.subject, "difficulty": q.difficulty, "text": q.text, "options": q.options, "correct_option_id": q.correct_option_id, "explanation": q.explanation, "code_example": q.code_example, "note_id": q.note_id, "created_by_id": q.created_by_id, "is_saved": q.id in saved_ids, "created_at": q.created_at} for q in questions]

@router.get("/{question_id}")
def get_question(question_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q: raise HTTPException(404, "سؤال یافت نشد")
    saved = db.query(SavedQuestion).filter(SavedQuestion.user_id == current_user.id, SavedQuestion.question_id == q.id).first() is not None
    return {"id": q.id, "subject": q.subject, "difficulty": q.difficulty, "text": q.text, "options": q.options, "correct_option_id": q.correct_option_id, "explanation": q.explanation, "code_example": q.code_example, "note_id": q.note_id, "created_by_id": q.created_by_id, "is_saved": saved, "created_at": q.created_at}

@router.post("", status_code=201)
def create_question(data: QuestionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin: raise HTTPException(403, "دسترسی مدیر لازم است")
    if data.difficulty not in {"beginner", "intermediate", "advanced"}: raise HTTPException(422, "سطح سختی نامعتبر است")
    if not data.options or data.correct_option_id < 0 or data.correct_option_id >= len(data.options): raise HTTPException(422, "گزینه صحیح نامعتبر است")
    q = Question(**data.model_dump(), created_by_id=current_user.id)
    db.add(q); db.commit(); db.refresh(q)
    return q

@router.patch("/{question_id}/save")
def toggle_save(question_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q: raise HTTPException(404, "سؤال یافت نشد")
    saved = db.query(SavedQuestion).filter(SavedQuestion.user_id == current_user.id, SavedQuestion.question_id == question_id).first()
    if saved: db.delete(saved); result = False
    else: db.add(SavedQuestion(user_id=current_user.id, question_id=question_id)); result = True
    db.commit(); return {"is_saved": result}

@router.post("/{question_id}/answer")
def answer(question_id: int, data: AnswerCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q: raise HTTPException(404, "سؤال یافت نشد")
    correct = data.selected_option_id == q.correct_option_id
    result = UserAnswer(user_id=current_user.id, question_id=question_id, selected_option_id=data.selected_option_id, is_correct=correct, personal_note=data.personal_note)
    db.add(result); db.commit(); db.refresh(result)
    return {"is_correct": correct, "correct_option_id": q.correct_option_id, "explanation": q.explanation}
