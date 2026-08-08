"""Admin-configurable catalog: subject list + dynamic filter definitions
used by the Exams page. See routers/catalog.py for the endpoints."""
from sqlalchemy import Boolean, Column, DateTime, Integer, JSON, String, UniqueConstraint
from sqlalchemy.sql import func

from backend.database import Base


class SubjectCatalog(Base):
    """A study subject, e.g. "الگوریتم" (algorithm)."""

    __tablename__ = "subjects_catalog"
    __table_args__ = (UniqueConstraint("slug", name="uq_subject_catalog_slug"),)

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(120), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    position = Column(Integer, nullable=False, default=0)  # display order
    is_active = Column(Boolean, nullable=False, default=True)  # soft delete
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class FilterDefinition(Base):
    """An admin-defined filter field (select/number/text/boolean) that can
    be attached to exams, notes, or questions and rendered dynamically in
    the frontend filter panel."""

    __tablename__ = "filter_definitions"
    __table_args__ = (UniqueConstraint("key", "scope", name="uq_filter_definition_key_scope"),)

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(120), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    field_type = Column(String(40), nullable=False, default="select")
    options = Column(JSON, nullable=False, default=list)  # choices, for select/multi_select
    scope = Column(String(40), nullable=False, default="exams", index=True)
    position = Column(Integer, nullable=False, default=0)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
