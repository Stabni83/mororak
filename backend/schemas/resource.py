"""Request/response shapes for uploaded-resource endpoints."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ResourceResponse(BaseModel):
    id: int
    title: str
    subject: Optional[str] = None
    resource_type: str
    original_filename: str
    mime_type: str
    size_bytes: int
    last_page: Optional[int] = None
    total_pages: Optional[int] = None
    created_at: Optional[datetime] = None
    last_viewed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ResourceProgressUpdate(BaseModel):
    """Sent by the viewer every time the user's page/position changes
    (debounced on the frontend), and once more when they close the viewer."""

    last_page: Optional[int] = None
    total_pages: Optional[int] = None


class ResourceUpdate(BaseModel):
    """Editable fields. Only the fields actually sent are changed, so the
    frontend can send {"subject": null} to move a file to "no subject"."""

    title: Optional[str] = None
    subject: Optional[str] = None
