"""Endpoints for personal, user-uploaded study resources (PDF/image files
brought from the user's own phone or laptop storage).

Unlike Notes (shared, admin-authored content), a Resource always belongs to
exactly one user - every query here is scoped to `current_user.id`, so
nobody can ever list, view, or delete another user's uploaded file.
"""
import base64
import os
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from backend.database import get_db
from backend.models.resource import Resource
from backend.models.user import User
from backend.schemas.resource import ResourceProgressUpdate, ResourceResponse, ResourceUpdate
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/resources", tags=["Resources"])

# Files live outside the repo's tracked source, at <repo_root>/uploads/<user_id>/.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB - plenty for PDFs/photos, not for video.

# content-type -> (resource_type, file extension to store it with)
ALLOWED_TYPES = {
    "application/pdf": ("pdf", ".pdf"),
    "image/jpeg": ("image", ".jpg"),
    "image/jpg": ("image", ".jpg"),
    "image/png": ("image", ".png"),
    "image/webp": ("image", ".webp"),
}


def _user_upload_dir(user_id: int) -> str:
    path = os.path.join(UPLOAD_DIR, str(user_id))
    os.makedirs(path, exist_ok=True)
    return path


def _require_owned_resource(db: Session, resource_id: int, user_id: int) -> Resource:
    resource = (
        db.query(Resource)
        .filter(Resource.id == resource_id, Resource.user_id == user_id)
        .first()
    )
    if not resource:
        raise HTTPException(404, "فایل یافت نشد")
    return resource


@router.get("", response_model=List[ResourceResponse])
def list_resources(
    resource_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Resource).filter(Resource.user_id == current_user.id)
    if resource_type and resource_type != "all":
        query = query.filter(Resource.resource_type == resource_type)
    return query.order_by(Resource.created_at.desc()).all()


@router.get("/{resource_id}", response_model=ResourceResponse)
def get_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _require_owned_resource(db, resource_id, current_user.id)


@router.post("", response_model=ResourceResponse, status_code=201)
async def upload_resource(
    title: str = Form(...),
    subject: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(422, "فقط فایل PDF یا عکس (jpg, png, webp) قابل آپلود است")

    resource_type, extension = ALLOWED_TYPES[content_type]
    stored_filename = f"{uuid.uuid4().hex}{extension}"
    destination_path = os.path.join(_user_upload_dir(current_user.id), stored_filename)

    size_bytes = 0
    try:
        with open(destination_path, "wb") as out_file:
            while chunk := await file.read(1024 * 1024):
                size_bytes += len(chunk)
                if size_bytes > MAX_FILE_SIZE_BYTES:
                    raise HTTPException(413, "حجم فایل نباید بیشتر از ۵۰ مگابایت باشد")
                out_file.write(chunk)
    except HTTPException:
        if os.path.exists(destination_path):
            os.remove(destination_path)
        raise
    finally:
        await file.close()

    clean_title = title.strip() or (file.filename or "بدون عنوان")

    resource = Resource(
        user_id=current_user.id,
        title=clean_title,
        subject=(subject or "").strip() or None,
        resource_type=resource_type,
        original_filename=file.filename or stored_filename,
        stored_filename=stored_filename,
        mime_type=content_type,
        size_bytes=size_bytes,
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource


@router.get("/{resource_id}/file")
def download_resource_file(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Streams the raw file back. The frontend calls this with the normal
    Authorization header (via fetch, not a plain <img>/<embed> src) and turns
    the response into a blob: URL - see lib/api.ts's `resources.getFileUrl`.
    """
    resource = _require_owned_resource(db, resource_id, current_user.id)
    file_path = os.path.join(_user_upload_dir(current_user.id), resource.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "فایل روی سرور پیدا نشد")
    # No filename/"attachment" header on purpose: it is displayed inline in our own
    # viewer, and download-manager browser extensions hijack "attachment" responses.
    return FileResponse(file_path, media_type=resource.mime_type)


@router.get("/{resource_id}/content")
def get_resource_content(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Same bytes as /file but wrapped in JSON (base64). Used as a fallback by the
    frontend when something between the browser and the API swallows binary responses."""
    resource = _require_owned_resource(db, resource_id, current_user.id)
    file_path = os.path.join(_user_upload_dir(current_user.id), resource.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(404, "فایل روی سرور پیدا نشد")
    with open(file_path, "rb") as f:
        encoded = base64.b64encode(f.read()).decode("ascii")
    return {"mime_type": resource.mime_type, "data": encoded}


@router.patch("/{resource_id}", response_model=ResourceResponse)
def update_resource(
    resource_id: int,
    data: ResourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Rename a file or move it to another subject (درس)."""
    resource = _require_owned_resource(db, resource_id, current_user.id)

    if "subject" in data.model_fields_set:
        resource.subject = (data.subject or "").strip() or None
    if "title" in data.model_fields_set and data.title and data.title.strip():
        resource.title = data.title.strip()

    db.commit()
    db.refresh(resource)
    return resource


@router.patch("/{resource_id}/progress", response_model=ResourceResponse)
def update_progress(
    resource_id: int,
    data: ResourceProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upserts the resume-position bookmark. Called (debounced) whenever the
    page changes in the PDF viewer, and once more when the viewer unmounts."""
    resource = _require_owned_resource(db, resource_id, current_user.id)

    if data.last_page is not None:
        resource.last_page = data.last_page
    if data.total_pages is not None:
        resource.total_pages = data.total_pages
    resource.last_viewed_at = func.now()

    db.commit()
    db.refresh(resource)
    return resource


@router.delete("/{resource_id}", status_code=204)
def delete_resource(
    resource_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resource = _require_owned_resource(db, resource_id, current_user.id)

    file_path = os.path.join(_user_upload_dir(current_user.id), resource.stored_filename)
    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(resource)
    db.commit()
    return None
