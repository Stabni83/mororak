"""Business logic for exams: listing, creating, and both ways of taking one.

An exam can be one of two types, and they behave quite differently:
  - "practice": untimed, one attempt row is reused across the whole session,
    and every answer is graded and returned immediately (see answer_practice).
  - "timed": has a countdown, the whole exam is submitted at once at the end
    (see start_attempt / submit_attempt), and grading happens in one pass.

Keeping this logic in a service module (instead of directly in the router)
lets routers/exams.py stay a thin, easy-to-read HTTP layer.
"""
from datetime import datetime, timezone

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from backend.models.catalog import FilterDefinition
from backend.models.exam import Exam, ExamAttempt, ExamQuestion
from backend.models.question import Question
from backend.models.saved import SavedExam
from backend.models.user_answer import UserAnswer

VALID_TYPES = {"practice", "timed"}


def _now():
    """Current UTC time, used consistently so all timestamps stay comparable."""
    return datetime.now(timezone.utc)


def _question_payload(question: Question, include_answer: bool = False, is_saved: bool = False):
    """Serialize a Question for the exam-detail response.

    include_answer controls whether correct_option_id is revealed. It is
    kept hidden for a timed exam that has "show answers immediately" turned
    off, so a student cannot see the correct answer before submitting.
    """
    payload = {
        "id": question.id,
        "subject": question.subject,
        "difficulty": question.difficulty,
        "text": question.text,
        "options": question.options,
        "explanation": question.explanation,
        "code_example": question.code_example,
        "note_id": question.note_id,
        "is_saved": is_saved,
    }
    if include_answer:
        payload["correct_option_id"] = question.correct_option_id
    return payload


def _attempt_payload(attempt: ExamAttempt):
    """Serialize an ExamAttempt into the shape the frontend's exam-taking
    screen and results screen both expect."""
    return {
        "id": attempt.id,
        "exam_id": attempt.exam_id,
        "status": attempt.status,
        "duration_seconds": attempt.duration_seconds or 0,
        "score": attempt.score,
        "correct_count": attempt.correct_count or 0,
        "wrong_count": attempt.wrong_count or 0,
        "unanswered_count": attempt.unanswered_count or 0,
        "started_at": attempt.started_at,
        "finished_at": attempt.finished_at,
        "answers": attempt.answers or {},
    }


def create_exam(db: Session, data, user):
    """Create a new exam from a list of existing questions.

    Several checks run before anything is written to the database: the
    exam type must be valid, a timed exam must have a time limit, no
    question can be duplicated inside the exam, every referenced question
    must actually exist, the admin must own each question (or it must be a
    legacy question with no owner), and every question's subject must match
    the exam's subject so exams stay topically consistent.
    """
    if not user.is_admin:
        raise HTTPException(403, "دسترسی مدیر لازم است")
    if data.exam_type not in VALID_TYPES:
        raise HTTPException(422, "نوع آزمون نامعتبر است")
    if data.exam_type == "timed" and not data.time_limit_seconds:
        raise HTTPException(422, "آزمون زمان‌دار باید زمان داشته باشد")

    question_ids = [item.question_id for item in data.questions]
    if not question_ids:
        raise HTTPException(422, "آزمون باید حداقل یک سؤال داشته باشد")
    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(422, "یک سؤال نمی‌تواند دوبار در آزمون باشد")

    questions = db.query(Question).filter(Question.id.in_(question_ids)).all()
    if len(questions) != len(question_ids):
        raise HTTPException(404, "یکی از سؤال‌ها یافت نشد")
    question_map = {question.id: question for question in questions}

    unauthorized = [
        question_id for question_id in question_ids
        if question_map[question_id].created_by_id not in (None, user.id)
    ]
    if unauthorized:
        raise HTTPException(403, "فقط سؤال‌های خودتان یا سؤال‌های قدیمی قابل استفاده در آزمون هستند")

    mismatched = [
        question_id for question_id in question_ids
        if question_map[question_id].subject != data.subject
    ]
    if mismatched:
        raise HTTPException(422, "موضوع همه سؤال‌های آزمون باید با موضوع آزمون یکسان باشد")

    exam = Exam(
        title=data.title.strip(),
        description=(data.description or "").strip(),
        subject=data.subject,
        author=(data.author or "مرورک").strip() or "مرورک",
        exam_type=data.exam_type,
        time_limit_seconds=data.time_limit_seconds,
        show_answers_immediately=data.show_answers_immediately,
        is_published=data.is_published,
        filter_values=data.filter_values or {},
    )
    db.add(exam)
    db.flush()
    for item in data.questions:
        db.add(ExamQuestion(
            exam_id=exam.id,
            question_id=item.question_id,
            position=item.position,
            points=item.points,
        ))
    db.commit()
    db.refresh(exam)
    return exam


def _safe_float(value):
    """Convert value to float, returning None instead of raising on bad input.
    Used everywhere we compare a stored filter value that might not be numeric."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def list_exams(db: Session, user_id: int, subject=None, exam_type=None, saved=None, search=None, dynamic_filters=None):
    """List published exams, applying the standard filters plus any
    admin-defined dynamic filters (see models/catalog.py FilterDefinition).
    """
    query = db.query(Exam).options(joinedload(Exam.questions)).filter(Exam.is_published == True)
    if subject and subject != "all":
        query = query.filter(Exam.subject == subject)
    if exam_type and exam_type != "all":
        query = query.filter(Exam.exam_type == exam_type)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter((Exam.title.ilike(term)) | (Exam.description.ilike(term)) | (Exam.subject.ilike(term)) | (Exam.author.ilike(term)))

    exams = query.order_by(Exam.created_at.desc()).all()

    # Dynamic filters live in each exam's filter_values JSON column, so they
    # cannot be filtered with a plain SQL WHERE clause - we apply them in
    # Python after loading the (already subject/type/search-filtered) exams.
    # First pass: exact-match filters (select / multi_select / number / text / boolean).
    for key, expected in (dynamic_filters or {}).items():
        if expected in (None, "", "all") or key.endswith("__min") or key.endswith("__max"):
            continue
        definition = db.query(FilterDefinition).filter(
            FilterDefinition.key == key,
            FilterDefinition.is_active == True,
        ).first()
        if not definition:
            continue
        values = [v.strip() for v in str(expected).split(",") if v.strip()]
        if definition.field_type == "multi_select":
            exams = [x for x in exams if any(v in (x.filter_values or {}).get(key, []) for v in values)]
        elif definition.field_type == "number":
            target = _safe_float(expected)
            if target is not None:
                exams = [x for x in exams if _safe_float((x.filter_values or {}).get(key)) == target]
        elif definition.field_type == "boolean":
            target = str(expected).lower() in {"1", "true", "yes", "بله"}
            exams = [x for x in exams if bool((x.filter_values or {}).get(key)) == target]
        elif definition.field_type == "text":
            term = str(expected).strip().lower()
            exams = [x for x in exams if term in str((x.filter_values or {}).get(key, "")).lower()]
        else:
            exams = [x for x in exams if str((x.filter_values or {}).get(key, "")) == str(expected)]

    # Second pass: range filters, sent by the frontend as "<key>__min" and
    # "<key>__max" query params for any filter defined with field_type="number".
    for key, expected in (dynamic_filters or {}).items():
        if not (key.endswith("__min") or key.endswith("__max")) or expected in (None, ""):
            continue
        base = key.rsplit("__", 1)[0]
        definition = db.query(FilterDefinition).filter(
            FilterDefinition.key == base,
            FilterDefinition.field_type == "number",
            FilterDefinition.is_active == True,
        ).first()
        if not definition:
            continue
        target = _safe_float(expected)
        if target is None:
            continue
        if key.endswith("__min"):
            exams = [x for x in exams if (_safe_float((x.filter_values or {}).get(base)) is not None and _safe_float((x.filter_values or {}).get(base)) >= target)]
        else:
            exams = [x for x in exams if (_safe_float((x.filter_values or {}).get(base)) is not None and _safe_float((x.filter_values or {}).get(base)) <= target)]

    # Exam-level saving is intentionally no longer exposed by the UI. Keep the
    # old column/API for backward compatibility with existing databases.
    saved_ids = {x.exam_id for x in db.query(SavedExam).filter(SavedExam.user_id == user_id).all()}
    if saved is True:
        exams = [x for x in exams if x.id in saved_ids]
    if saved is False:
        exams = [x for x in exams if x.id not in saved_ids]

    return [
        {
            "id": x.id,
            "title": x.title,
            "description": x.description,
            "subject": x.subject,
            "author": x.author or "مرورک",
            "exam_type": x.exam_type,
            "time_limit_seconds": x.time_limit_seconds,
            "question_count": len(x.questions),
            "is_saved": False,
            "filter_values": x.filter_values or {},
        }
        for x in exams
    ]


def get_exam(db: Session, exam_id: int, user_id: int):
    """Full exam detail, including every question, used by the exam-taking page."""
    exam = db.query(Exam).options(
        joinedload(Exam.questions).joinedload(ExamQuestion.question)
    ).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(404, "آزمون یافت نشد")

    from backend.models.user_answer import SavedQuestion
    saved_question_ids = {row.question_id for row in db.query(SavedQuestion).filter(SavedQuestion.user_id == user_id).all()}
    return {
        "id": exam.id,
        "title": exam.title,
        "description": exam.description,
        "subject": exam.subject,
        "author": exam.author or "مرورک",
        "exam_type": exam.exam_type,
        "time_limit_seconds": exam.time_limit_seconds,
        "question_count": len(exam.questions),
        "is_saved": False,
        "show_answers_immediately": exam.show_answers_immediately,
        "filter_values": exam.filter_values or {},
        "questions": [
            {
                "id": eq.id,
                "position": eq.position,
                "points": eq.points,
                "question": _question_payload(
                    eq.question,
                    include_answer=(exam.exam_type == "practice" or exam.show_answers_immediately),
                    is_saved=eq.question_id in saved_question_ids,
                ),
            }
            for eq in exam.questions
        ],
    }


def toggle_save(db: Session, exam_id: int, user_id: int):
    """Bookmark/unbookmark an exam. Kept only for old clients - the current
    UI saves individual questions, never whole exams."""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(404, "آزمون یافت نشد")
    saved = db.query(SavedExam).filter(SavedExam.user_id == user_id, SavedExam.exam_id == exam_id).first()
    if saved:
        db.delete(saved)
        result = False
    else:
        db.add(SavedExam(user_id=user_id, exam_id=exam_id))
        result = True
    db.commit()
    return {"is_saved": result}


def start_attempt(db: Session, exam_id: int, user_id: int):
    """Begin (or resume) an attempt at an exam.

    For a practice exam there is no real "start" - we just reuse the most
    recent practice attempt if one exists, since practice sessions have no
    finish/end lifecycle and can be revisited indefinitely.
    """
    exam = db.query(Exam).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(404, "آزمون یافت نشد")
    if exam.exam_type != "timed":
        # Practice mode has a stopwatch, but no finish/end lifecycle.
        existing = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.exam_id == exam_id,
            ExamAttempt.status == "practice",
        ).order_by(ExamAttempt.id.desc()).first()
        if existing:
            return _attempt_payload(existing)
        now = _now()
        attempt = ExamAttempt(
            user_id=user_id, exam_id=exam_id, status="practice", started_at=now,
            last_activity_at=now, duration_seconds=0, score=0.0,
            total_questions=len(exam.questions), correct_answers=0, answered_questions=0,
            correct_count=0, wrong_count=0, unanswered_count=len(exam.questions), answers={},
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        return _attempt_payload(attempt)

    # Timed exam: reuse an in-progress attempt if the user refreshed the
    # page or navigated away without finishing, otherwise start a fresh one.
    existing = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user_id,
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.status == "in_progress",
    ).first()
    if existing:
        return _attempt_payload(existing)

    now = _now()
    attempt = ExamAttempt(
        user_id=user_id,
        exam_id=exam_id,
        status="in_progress",
        started_at=now,
        last_activity_at=now,
        duration_seconds=0,
        score=0.0,
        total_questions=len(exam.questions),
        correct_answers=0,
        answered_questions=0,
        correct_count=0,
        wrong_count=0,
        unanswered_count=0,
        answers={},
    )
    db.add(attempt)
    try:
        db.commit()
    except IntegrityError:
        # Two near-simultaneous requests both tried to create the first
        # attempt for this user/exam; the loser just falls back to reading
        # the attempt the winner created, instead of returning an error.
        db.rollback()
        existing = db.query(ExamAttempt).filter(
            ExamAttempt.user_id == user_id,
            ExamAttempt.exam_id == exam_id,
            ExamAttempt.status == "in_progress",
        ).first()
        if existing:
            return _attempt_payload(existing)
        raise HTTPException(500, "ایجاد دفترچه آزمون انجام نشد")
    db.refresh(attempt)
    return _attempt_payload(attempt)


def _get_exam_for_attempt(db: Session, exam_id: int):
    """Load an exam with its questions eagerly joined, for the answer/submit paths."""
    exam = db.query(Exam).options(
        joinedload(Exam.questions).joinedload(ExamQuestion.question)
    ).filter(Exam.id == exam_id, Exam.is_published == True).first()
    if not exam:
        raise HTTPException(404, "آزمون یافت نشد")
    return exam


def _upsert_exam_user_answer(db: Session, user_id: int, attempt_id: int, question_id: int, selected_option_id: int, is_correct: bool):
    """Create or update the UserAnswer row for one question inside one
    attempt, so re-answering the same question in an attempt updates the
    existing record instead of creating duplicate history."""
    row = db.query(UserAnswer).filter(
        UserAnswer.user_id == user_id,
        UserAnswer.question_id == question_id,
        UserAnswer.exam_attempt_id == attempt_id,
    ).first()
    if row:
        row.selected_option_id = selected_option_id
        row.is_correct = is_correct
        row.answered_at = _now()
    else:
        db.add(UserAnswer(
            user_id=user_id,
            question_id=question_id,
            exam_attempt_id=attempt_id,
            selected_option_id=selected_option_id,
            is_correct=is_correct,
        ))


def _calculate_attempt(exam, submitted):
    """Grade a full timed-exam submission in one pass.

    Returns (correct_count, wrong_count, unanswered_count, per_question
    results, final score as a 0-100 percentage weighted by each question's
    points).
    """
    correct = wrong = unanswered = 0
    answer_results = {}
    total_points = sum(float(eq.points or 1) for eq in exam.questions) or 1
    earned = 0.0
    valid_question_ids = {eq.question_id for eq in exam.questions}

    # First, pre-fill every submitted answer as "incorrect" so that even a
    # question we can't fully process below still shows up with the
    # student's selected option in the results.
    for raw_key, raw_value in submitted.items():
        try:
            qid = int(raw_key)
            selected = int(raw_value)
        except (TypeError, ValueError):
            continue
        if qid not in valid_question_ids:
            continue
        answer_results[str(qid)] = {"selected_option_id": selected, "is_correct": False}

    # Now walk the exam's real question list and do the actual grading;
    # this also catches any question the student left unanswered.
    for eq in exam.questions:
        key = str(eq.question_id)
        selected = submitted.get(key)
        if selected is None:
            unanswered += 1
            answer_results[key] = {"selected_option_id": None, "is_correct": False}
            continue
        is_correct = int(selected) == int(eq.question.correct_option_id)
        if is_correct:
            correct += 1
            earned += float(eq.points or 1)
        else:
            wrong += 1
        answer_results[key] = {"selected_option_id": int(selected), "is_correct": is_correct}

    return correct, wrong, unanswered, answer_results, round((earned / total_points) * 100, 2)


def answer_practice(db: Session, exam_id: int, user_id: int, data):
    """Grade a single answer inside a practice exam and update the running
    attempt totals immediately, so the UI can show live progress instead of
    waiting for a final submit step (practice exams have no submit step)."""
    exam = _get_exam_for_attempt(db, exam_id)
    if exam.exam_type != "practice":
        raise HTTPException(422, "این آزمون زمان‌دار است و باید از مسیر ارسال آزمون استفاده شود")

    question = next((eq.question for eq in exam.questions if eq.question_id == data.question_id), None)
    if question is None:
        raise HTTPException(404, "این سؤال متعلق به آزمون نیست")

    # Reuse the existing practice attempt if one is already running;
    # practice mode is a continuous session, not a one-shot submission.
    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.user_id == user_id,
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.status == "practice",
    ).order_by(ExamAttempt.id.desc()).first()
    now = _now()
    if not attempt:
        attempt = ExamAttempt(
            user_id=user_id,
            exam_id=exam_id,
            started_at=now,
            last_activity_at=now,
            duration_seconds=0,
            score=0.0,
            total_questions=len(exam.questions),
            correct_answers=0,
            answered_questions=0,
            correct_count=0,
            wrong_count=0,
            unanswered_count=len(exam.questions),
            status="practice",
            answers={},
        )
        db.add(attempt)
        db.flush()

    answers = dict(attempt.answers or {})
    selected = int(data.selected_option_id)
    started = attempt.started_at
    # SQLite can return naive datetimes even though the column is declared
    # timezone-aware; normalize to UTC before doing arithmetic on it.
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    attempt.duration_seconds = max(0, int((now - started).total_seconds()))
    is_correct = selected == question.correct_option_id
    answers[str(question.id)] = {"selected_option_id": selected, "is_correct": is_correct}
    attempt.answers = answers
    attempt.last_activity_at = now
    attempt.total_questions = len(exam.questions)
    attempt.answered_questions = len(answers)
    attempt.correct_count = sum(1 for x in answers.values() if x.get("is_correct"))
    attempt.wrong_count = sum(1 for x in answers.values() if not x.get("is_correct"))
    attempt.unanswered_count = max(0, len(exam.questions) - attempt.answered_questions)
    points = sum(float(eq.points or 1) for eq in exam.questions) or 1
    earned = sum(float(eq.points or 1) for eq in exam.questions if answers.get(str(eq.question_id), {}).get("is_correct"))
    attempt.score = round((earned / points) * 100, 2)
    _upsert_exam_user_answer(db, user_id, attempt.id, question.id, selected, is_correct)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt": _attempt_payload(attempt),
        "question_id": question.id,
        "selected_option_id": selected,
        "is_correct": is_correct,
        "correct_option_id": question.correct_option_id,
        "explanation": question.explanation,
    }


def submit_attempt(db: Session, exam_id: int, attempt_id: int, user_id: int, data):
    """Finish a timed exam attempt: grade every answer at once, detect a
    time-out, persist per-question results, and mark the attempt as done.
    Submitting an already-finished attempt is a no-op that just returns the
    existing result, so a duplicate click can't corrupt the score.
    """
    exam = _get_exam_for_attempt(db, exam_id)
    if exam.exam_type != "timed":
        raise HTTPException(422, "آزمون تمرینی نیاز به پایان آزمون ندارد")

    attempt = db.query(ExamAttempt).filter(
        ExamAttempt.id == attempt_id,
        ExamAttempt.exam_id == exam_id,
        ExamAttempt.user_id == user_id,
    ).first()
    if not attempt:
        raise HTTPException(404, "دفترچه آزمون یافت نشد")
    if attempt.status != "in_progress":
        return _attempt_payload(attempt)

    now = _now()
    started = attempt.started_at
    if started.tzinfo is None:
        started = started.replace(tzinfo=timezone.utc)
    duration = max(0, int((now - started).total_seconds()))
    timed_out = exam.time_limit_seconds is not None and duration >= exam.time_limit_seconds
    if timed_out:
        # Cap the recorded duration at the exam's own time limit so the
        # results screen never shows more time than the exam actually allowed.
        duration = exam.time_limit_seconds

    submitted = {}
    for key, value in (data.answers or {}).items():
        try:
            submitted[str(int(key))] = int(value)
        except (TypeError, ValueError):
            continue

    correct, wrong, unanswered, answer_results, score = _calculate_attempt(exam, submitted)

    for eq in exam.questions:
        selected = submitted.get(str(eq.question_id))
        if selected is not None:
            _upsert_exam_user_answer(
                db, user_id, attempt.id, eq.question_id,
                selected, selected == eq.question.correct_option_id,
            )

    attempt.finished_at = now
    attempt.last_activity_at = now
    attempt.duration_seconds = duration
    attempt.total_questions = len(exam.questions)
    attempt.correct_answers = correct
    attempt.answered_questions = correct + wrong
    attempt.correct_count = correct
    attempt.wrong_count = wrong
    attempt.unanswered_count = unanswered
    attempt.score = score
    attempt.answers = answer_results
    attempt.status = "timed_out" if timed_out else "completed"
    db.commit()
    db.refresh(attempt)
    return _attempt_payload(attempt)
