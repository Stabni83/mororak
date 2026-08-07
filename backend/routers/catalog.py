import re
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.catalog import SubjectCatalog, FilterDefinition
from backend.models.user import User
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/catalog", tags=["Catalog"])

DEFAULT_SUBJECTS = [
    ("algorithm", "الگوریتم"),
    ("data-structure", "ساختمان داده"),
    ("os", "سیستم‌عامل"),
    ("network", "شبکه"),
    ("database", "پایگاه داده"),
]

FIELD_TYPES = {"select", "multi_select", "number", "text", "boolean"}
SCOPES = {"exams", "notes", "questions", "all"}


class SubjectCreate(BaseModel):
    slug: str = Field(min_length=2, max_length=120)
    name: str = Field(min_length=1, max_length=200)


class FilterCreate(BaseModel):
    key: str = Field(min_length=2, max_length=120)
    name: str = Field(min_length=1, max_length=200)
    field_type: str = "select"
    options: list[str] = Field(default_factory=list)
    scope: str = "exams"


def _admin(user: User):
    if not user.is_admin:
        raise HTTPException(403, "دسترسی مدیر لازم است")


def seed_catalog(db: Session):
    if db.query(SubjectCatalog).count() == 0:
        for index, (slug, name) in enumerate(DEFAULT_SUBJECTS):
            db.add(SubjectCatalog(slug=slug, name=name, position=index, is_active=True))
        db.commit()


def _subject_payload(item):
    return {"id": item.id, "slug": item.slug, "name": item.name, "position": item.position, "is_active": item.is_active}


def _filter_payload(item):
    return {"id": item.id, "key": item.key, "name": item.name, "field_type": item.field_type, "options": item.options or [], "scope": item.scope, "position": item.position, "is_active": item.is_active}


@router.get("/subjects")
def subjects(include_inactive: bool = False, db: Session = Depends(get_db)):
    query = db.query(SubjectCatalog)
    if not include_inactive:
        query = query.filter(SubjectCatalog.is_active == True)
    return [_subject_payload(x) for x in query.order_by(SubjectCatalog.position, SubjectCatalog.name).all()]


@router.post("/subjects", status_code=201)
def create_subject(data: SubjectCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _admin(current_user)
    slug = re.sub(r"[^a-zA-Z0-9_-]+", "-", data.slug.strip().lower()).strip("-")
    if not slug:
        raise HTTPException(422, "شناسه درس معتبر نیست")
    if db.query(SubjectCatalog).filter(SubjectCatalog.slug == slug).first():
        raise HTTPException(409, "این درس قبلاً ثبت شده است")
    max_position = db.query(SubjectCatalog).count()
    item = SubjectCatalog(slug=slug, name=data.name.strip(), position=max_position, is_active=True)
    db.add(item)
    db.commit(); db.refresh(item)
    return _subject_payload(item)


@router.patch("/subjects/{subject_id}")
def toggle_subject(subject_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _admin(current_user)
    item = db.query(SubjectCatalog).filter(SubjectCatalog.id == subject_id).first()
    if not item:
        raise HTTPException(404, "درس یافت نشد")
    item.is_active = not item.is_active
    db.commit(); db.refresh(item)
    return _subject_payload(item)


@router.get("/filters")
def filters(scope: Optional[str] = "exams", include_inactive: bool = False, db: Session = Depends(get_db)):
    query = db.query(FilterDefinition)
    if scope and scope != "all":
        query = query.filter((FilterDefinition.scope == scope) | (FilterDefinition.scope == "all"))
    if not include_inactive:
        query = query.filter(FilterDefinition.is_active == True)
    return [_filter_payload(x) for x in query.order_by(FilterDefinition.position, FilterDefinition.name).all()]


@router.post("/filters", status_code=201)
def create_filter(data: FilterCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _admin(current_user)
    key = re.sub(r"[^a-zA-Z0-9_-]+", "_", data.key.strip().lower()).strip("_")
    if not key:
        raise HTTPException(422, "کلید فیلتر معتبر نیست")
    if data.field_type not in FIELD_TYPES:
        raise HTTPException(422, "نوع فیلتر نامعتبر است")
    if data.scope not in SCOPES:
        raise HTTPException(422, "محدوده فیلتر نامعتبر است")
    if db.query(FilterDefinition).filter(FilterDefinition.key == key, FilterDefinition.scope == data.scope).first():
        raise HTTPException(409, "این فیلتر قبلاً ثبت شده است")
    item = FilterDefinition(key=key, name=data.name.strip(), field_type=data.field_type, options=[x.strip() for x in data.options if x.strip()], scope=data.scope, position=db.query(FilterDefinition).count(), is_active=True)
    db.add(item); db.commit(); db.refresh(item)
    return _filter_payload(item)


@router.patch("/filters/{filter_id}")
def toggle_filter(filter_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _admin(current_user)
    item = db.query(FilterDefinition).filter(FilterDefinition.id == filter_id).first()
    if not item:
        raise HTTPException(404, "فیلتر یافت نشد")
    item.is_active = not item.is_active
    db.commit(); db.refresh(item)
    return _filter_payload(item)
