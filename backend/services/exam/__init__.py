"""Compatibility package for legacy imports.

The project originally exposed exam services from ``backend.services.exam._service``.
The implementation now lives in ``backend.services.exam_service``.  Keeping this
package avoids breaking older router files or local copies of the project.
"""
from backend.services.exam_service import *  # noqa: F401,F403
