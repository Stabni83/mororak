from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date
from backend.database import get_db
from backend.models.user import User
from backend.utils.auth import get_current_user
from backend.models.user_answer import UserAnswer
from backend.models.question import Question
from backend.models.note import Note
from backend.models.study_time import StudyTime

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/progress")
def get_user_progress(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_answers_query = db.query(UserAnswer).filter(UserAnswer.user_id == current_user.id)
    total_answered = user_answers_query.count()
    correct_answers = user_answers_query.filter(UserAnswer.is_correct == True).count()
    
    target_questions = 30
    progress_percentage = int(min(100, (total_answered / target_questions) * 100)) if target_questions > 0 else 0

    note_subjects = db.query(Note.subject).distinct().all()
    q_subjects = db.query(Question.subject).distinct().all()
    all_active_subjects = list(set([s[0] for s in note_subjects if s[0]] + [s[0] for s in q_subjects if s[0]]))

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
    seven_days_ago = today - timedelta(days=7)
    
    recent_answers = user_answers_query.all()
    for ans in recent_answers:
        if ans.answered_at:
            ans_date = ans.answered_at.date()
            if ans_date >= seven_days_ago:
                wd = ans_date.weekday()
                idx = (wd + 2) % 7
                weekdays[idx]["questions"] += 1

    # خواندن مستقیم زمان‌ها و تطبیق دقیق روز هفته بر اساس رشته تاریخ ذخیره شده
    study_logs = db.query(StudyTime).filter(StudyTime.user_id == current_user.id).all()
    for log in study_logs:
        try:
            log_date = datetime.strptime(log.date.strip(), "%Y-%m-%d").date()
            if log_date >= seven_days_ago:
                wd = log_date.weekday()
                idx = (wd + 2) % 7
                # حتی اگر ثانیه کمتر از ۶۰ بود، حداقل ۱ دقیقه در نظر گرفته شود تا روی نمودار دیده شود
                minutes = max(1, round(log.seconds / 60)) if log.seconds > 0 else 0
                weekdays[idx]["study_minutes"] += minutes
        except Exception as e:
            print(f"Error parsing date: {e}")
            continue

    return {
        "total_questions": total_answered,
        "correct_questions": correct_answers,
        "progress_percentage": progress_percentage,
        "suggested_subjects": all_active_subjects[:3],
        "weekly_activity": weekdays
    }