# backend/routers/notes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from backend.database import get_db
from backend.models.note import Note
from backend.schemas.note import NoteResponse

router = APIRouter(prefix="/notes", tags=["Notes"])

class NoteCreate(BaseModel):
    title: str
    subject: str
    content: str
    is_saved: Optional[bool] = False

@router.get("", response_model=List[NoteResponse])
def get_notes(
    subject: Optional[str] = None, 
    is_saved: Optional[bool] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(Note)
    if subject and subject != "all":
        query = query.filter(Note.subject == subject)
    if is_saved is not None:
        query = query.filter(Note.is_saved == is_saved)
    return query.all()

@router.patch("/{note_id}/save", response_model=NoteResponse)
def toggle_save_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="جزوه یافت نشد")
    note.is_saved = not note.is_saved
    db.commit()
    db.refresh(note)
    return note

@router.get("/{slug}", response_model=NoteResponse)
def get_note_by_slug(slug: str, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.slug == slug).first()
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="جزوه مورد نظر یافت نشد."
        )
    return note

@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_data: NoteCreate, db: Session = Depends(get_db)):
    slug = note_data.title.strip().lower().replace(" ", "-")
    
    word_count = len(note_data.content.split())
    reading_time = max(1, word_count // 200)

    db_note = Note(
        title=note_data.title,
        subject=note_data.subject,
        content=note_data.content,
        slug=slug,
        reading_time=reading_time,
        is_saved=note_data.is_saved
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note