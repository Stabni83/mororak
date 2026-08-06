# backend/routers/questions.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

from backend.database import get_db
from backend.models.question import Question
from backend.models.user import User  
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/questions", tags=["Questions"])

class QuestionCreate(BaseModel):
    subject: str
    difficulty: str
    text: str
    options: List[Any]
    correct_option_id: int
    explanation: str
    code_example: Optional[str] = None
    note_id: Optional[int] = None
    is_saved: Optional[bool] = False

@router.get("/")
def get_questions(
    subject: Optional[str] = None, 
    difficulty: Optional[str] = None,
    is_saved: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Question)
    if subject and subject != "all":
        query = query.filter(Question.subject == subject)
    if difficulty and difficulty != "all":
        query = query.filter(Question.difficulty == difficulty)
    if is_saved is not None:
        query = query.filter(Question.is_saved == is_saved)
    return query.all()

@router.post("/{question_id}/save")
def toggle_save_question(question_id: int, db: Session = Depends(get_db)):
    q = db.query(Question).filter(Question.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="سوال یافت نشد")
    q.is_saved = not q.is_saved
    db.commit()
    return {"message": "وضعیت ذخیره تغییر کرد", "is_saved": q.is_saved}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_question(
    question_data: QuestionCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        db_question = Question(
            subject=question_data.subject,
            difficulty=question_data.difficulty,
            text=question_data.text,
            options=question_data.options,
            correct_option_id=question_data.correct_option_id,
            explanation=question_data.explanation,
            code_example=question_data.code_example,
            note_id=question_data.note_id,
            is_saved=question_data.is_saved
        )
        db.add(db_question)
        db.commit()
        db.refresh(db_question)
        return {"message": "سوال با موفقیت ایجاد شد", "id": db_question.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))