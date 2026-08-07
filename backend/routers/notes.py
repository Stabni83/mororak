from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.note import Note
from backend.models.saved import SavedNote
from backend.models.personal_note import UserNote
from backend.models.user import User
from backend.schemas.note import NoteResponse
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/notes", tags=["Notes"])

class NoteCreate(BaseModel):
    title: str
    subject: str
    content: str
    author: str = "مرورک"

class PersonalNoteUpdate(BaseModel):
    content: str = ""

@router.get("", response_model=List[NoteResponse])
def get_notes(
    subject: Optional[str] = None,
    is_saved: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Note)
    if subject and subject != "all":
        query = query.filter(Note.subject == subject)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter((Note.title.ilike(term)) | (Note.content.ilike(term)) | (Note.author.ilike(term)))
    notes = query.order_by(Note.created_at.desc()).all()
    saved_ids = {x.note_id for x in db.query(SavedNote).filter(SavedNote.user_id == current_user.id).all()}
    if is_saved is True:
        notes = [n for n in notes if n.id in saved_ids]
    if is_saved is False:
        notes = [n for n in notes if n.id not in saved_ids]
    for note in notes:
        note.is_saved = note.id in saved_ids
    return notes

@router.get("/{note_id}/personal-note")
def get_personal_note(note_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "جزوه یافت نشد")
    personal = db.query(UserNote).filter(UserNote.user_id == current_user.id, UserNote.note_id == note_id).first()
    return {"note_id": note_id, "content": personal.content if personal else ""}

@router.patch("/{note_id}/personal-note")
def update_personal_note(note_id: int, payload: PersonalNoteUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "جزوه یافت نشد")
    personal = db.query(UserNote).filter(UserNote.user_id == current_user.id, UserNote.note_id == note_id).first()
    content = payload.content
    if personal:
        personal.content = content
    elif content.strip():
        personal = UserNote(user_id=current_user.id, note_id=note_id, content=content)
        db.add(personal)
    db.commit()
    return {"note_id": note_id, "content": content}

@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "جزوه مورد نظر یافت نشد.")
    note.is_saved = db.query(SavedNote).filter(SavedNote.user_id == current_user.id, SavedNote.note_id == note.id).first() is not None
    return note

@router.get("/slug/{slug}", response_model=NoteResponse)
def get_note_by_slug(slug: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.slug == slug).first()
    if not note:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "جزوه مورد نظر یافت نشد.")
    note.is_saved = db.query(SavedNote).filter(SavedNote.user_id == current_user.id, SavedNote.note_id == note.id).first() is not None
    return note

@router.patch("/{note_id}/save", response_model=NoteResponse)
def toggle_save_note(note_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(404, "جزوه یافت نشد")
    saved = db.query(SavedNote).filter(SavedNote.user_id == current_user.id, SavedNote.note_id == note_id).first()
    if saved:
        db.delete(saved)
        note.is_saved = False
    else:
        db.add(SavedNote(user_id=current_user.id, note_id=note_id))
        note.is_saved = True
    db.commit()
    db.refresh(note)
    return note

@router.post("", response_model=NoteResponse, status_code=201)
def create_note(note_data: NoteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if not current_user.is_admin:
        raise HTTPException(403, "دسترسی مدیر لازم است")
    title = note_data.title.strip()
    if not title:
        raise HTTPException(422, "عنوان جزوه الزامی است")
    base_slug = title.lower().replace(" ", "-")
    slug = base_slug
    counter = 2
    while db.query(Note).filter(Note.slug == slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    reading_time = max(1, len(note_data.content.split()) // 200)
    author = note_data.author.strip() or "مرورک"
    note = Note(
        title=title,
        subject=note_data.subject,
        content=note_data.content,
        author=author,
        slug=slug,
        reading_time=reading_time,
        is_saved=False,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note
