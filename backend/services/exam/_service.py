"""Backward-compatible exam service import path.

Some existing installations import these functions from
``backend.services.exam._service``. Re-export the single canonical
implementation so old routers cannot accidentally use an unfixed version.
"""
from backend.services.exam_service import (  # noqa: F401
    create_exam,
    list_exams,
    get_exam,
    toggle_save,
    start_attempt,
    submit_attempt,
)
