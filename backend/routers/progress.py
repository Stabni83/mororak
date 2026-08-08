"""Dashboard summary endpoint: overall progress, last 7 days of activity,
and shortcuts back to whatever the user was doing most recently.
"""
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.catalog import SubjectCatalog
from backend.models.exam import Exam, ExamAttempt
from backend.models.note import Note
from backend.models.question import Question
from backend.models.study_time import StudyTime
from backend.models.user import User
from backend.models.user_answer import UserAnswer
from backend.utils.auth import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/progress")
def get_user_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_answers_query = db.query(UserAnswer).filter(UserAnswer.user_id == current_user.id)
    total_answered = user_answers_query.count()
    correct_answers = user_answers_query.filter(UserAnswer.is_correct == True).count()

    # A simple, fixed goal used to render the dashboard progress ring. This
    # is intentionally basic; a more advanced version could scale the target
    # by how many questions actually exist per subject.
    target_questions = 30
    progress_percentage = int(min(100, (total_answered / target_questions) * 100)) if target_questions else 0

    # Prefer the admin-managed subject catalog; fall back to whatever
    # subjects already exist on notes/questions if the catalog is empty
    # (useful for older databases created before the catalog feature existed).
    catalog_subjects = (
        db.query(SubjectCatalog)
        .filter(SubjectCatalog.is_active == True)
        .order_by(SubjectCatalog.position)
        .all()
    )
    if catalog_subjects:
        all_active_subjects = [item.slug for item in catalog_subjects]
    else:
        note_subjects = db.query(Note.subject).distinct().all()
        q_subjects = db.query(Question.subject).distinct().all()
        all_active_subjects = list(dict.fromkeys([s[0] for s in note_subjects + q_subjects if s[0]]))

    # The weekly activity chart always shows 7 days, starting on Saturday to
    # match the Persian calendar week used throughout the UI.
    weekdays = [
        {"day": "شنبه", "questions": 0, "study_minutes": 0},
        {"day": "یک‌شنبه", "questions": 0, "study_minutes": 0},
        {"day": "دوشنبه", "questions": 0, "study_minutes": 0},
        {"day": "سه‌شنبه", "questions": 0, "study_minutes": 0},
        {"day": "چهارشنبه", "questions": 0, "study_minutes": 0},
        {"day": "پنج‌شنبه", "questions": 0, "study_minutes": 0},
        {"day": "جمعه", "questions": 0, "study_minutes": 0},
    ]

    today = date.today()
    seven_days_ago = today - timedelta(days=6)

    for answer in user_answers_query.all():
        if not answer.answered_at:
            continue
        answer_date = answer.answered_at.date()
        if answer_date < seven_days_ago or answer_date > today:
            continue
        # Python's weekday() returns Monday=0, but our week starts on
        # Saturday, so we shift the index by 2 and wrap around with % 7.
        index = (answer_date.weekday() + 2) % 7
        weekdays[index]["questions"] += 1

    for log in db.query(StudyTime).filter(StudyTime.user_id == current_user.id).all():
        try:
            log_date = datetime.strptime(log.date.strip(), "%Y-%m-%d").date()
        except (AttributeError, ValueError):
            # Skip any malformed date strings instead of crashing the whole request.
            continue
        if log_date < seven_days_ago or log_date > today:
            continue
        index = (log_date.weekday() + 2) % 7
        weekdays[index]["study_minutes"] += max(0, round((log.seconds or 0) / 60))

    # "Continue where you left off" shortcuts: the most recent exam attempt
    # and the most recent note-reading session.
    latest_exam = (
        db.query(ExamAttempt, Exam)
        .join(Exam, Exam.id == ExamAttempt.exam_id)
        .filter(
            ExamAttempt.user_id == current_user.id,
            ExamAttempt.status.in_(["completed", "timed_out", "practice"]),
        )
        .order_by(
            ExamAttempt.last_activity_at.desc().nullslast(),
            ExamAttempt.finished_at.desc().nullslast(),
            ExamAttempt.id.desc(),
        )
        .first()
    )

    latest_note = (
        db.query(StudyTime, Note)
        .join(Note, Note.id == StudyTime.note_id)
        .filter(StudyTime.user_id == current_user.id)
        .order_by(StudyTime.id.desc())
        .first()
    )

    recent_visits = {"exam": None, "note": None}
    if latest_exam:
        attempt, exam = latest_exam
        recent_visits["exam"] = {
            "id": exam.id,
            "title": exam.title,
            "href": f"/dashboard/exams/{exam.id}",
            "visited_at": attempt.last_activity_at or attempt.finished_at or attempt.started_at,
            "score": attempt.score,
            "status": attempt.status,
            "answered_questions": attempt.answered_questions or 0,
            "total_questions": attempt.total_questions or 0,
        }
    if latest_note:
        log, note = latest_note
        recent_visits["note"] = {
            "id": note.id,
            "title": note.title,
            "href": f"/dashboard/notes/{note.id}",
            "visited_at": log.date,
        }

    return {
        "total_questions": total_answered,
        "correct_questions": correct_answers,
        "progress_percentage": progress_percentage,
        "suggested_subjects": all_active_subjects[:3],
        "weekly_activity": weekdays,
        "recent_visits": recent_visits,
    }
