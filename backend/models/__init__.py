"""Import every model here so that backend.database.Base knows about all of
them before Base.metadata.create_all() runs in migrate.py. Without this,
SQLAlchemy would silently skip creating tables for models nobody imported.
"""
from backend.models.user import User
from backend.models.note import Note
from backend.models.question import Question
from backend.models.user_answer import UserAnswer, SavedQuestion
from backend.models.study_time import StudyTime
from backend.models.exam import Exam, ExamQuestion, ExamAttempt
from backend.models.saved import SavedNote, SavedExam
from backend.models.personal_note import UserNote
from backend.models.catalog import SubjectCatalog, FilterDefinition
from backend.models.resource import Resource
