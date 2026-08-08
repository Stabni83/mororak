"""Tests for the exam system: creation, practice mode, and timed mode."""
from tests.conftest import make_admin, register_user


def _admin(client, email="exam-admin@example.com"):
    admin = register_user(client, email)
    make_admin(email)
    return admin


def _question(client, admin_headers, subject="algorithm", correct=1):
    payload = {
        "subject": subject,
        "difficulty": "beginner",
        "text": "سؤال آزمون تستی",
        "options": ["الف", "ب", "ج", "د"],
        "correct_option_id": correct,
        "explanation": "توضیح تستی",
    }
    return client.post("/api/questions", json=payload, headers=admin_headers).json()


def test_creating_exam_requires_admin(client):
    user = register_user(client, "student@example.com")
    response = client.post(
        "/api/exams",
        json={"title": "آزمون", "subject": "algorithm", "exam_type": "practice", "questions": []},
        headers=user["headers"],
    )
    assert response.status_code == 403


def test_exam_must_have_at_least_one_question(client):
    admin = _admin(client)
    response = client.post(
        "/api/exams",
        json={"title": "آزمون خالی", "subject": "algorithm", "exam_type": "practice", "questions": []},
        headers=admin["headers"],
    )
    assert response.status_code == 422


def test_exam_rejects_duplicate_questions(client):
    admin = _admin(client)
    q = _question(client, admin["headers"])
    response = client.post(
        "/api/exams",
        json={
            "title": "آزمون تکراری",
            "subject": "algorithm",
            "exam_type": "practice",
            "questions": [
                {"question_id": q["id"], "position": 1, "points": 1},
                {"question_id": q["id"], "position": 2, "points": 1},
            ],
        },
        headers=admin["headers"],
    )
    assert response.status_code == 422


def test_exam_rejects_subject_mismatch(client):
    admin = _admin(client)
    q = _question(client, admin["headers"], subject="algorithm")
    response = client.post(
        "/api/exams",
        json={
            "title": "آزمون ناسازگار",
            "subject": "database",
            "exam_type": "practice",
            "questions": [{"question_id": q["id"], "position": 1, "points": 1}],
        },
        headers=admin["headers"],
    )
    assert response.status_code == 422


def test_timed_exam_requires_time_limit(client):
    admin = _admin(client)
    q = _question(client, admin["headers"])
    response = client.post(
        "/api/exams",
        json={
            "title": "آزمون زمان‌دار بی‌زمان",
            "subject": "algorithm",
            "exam_type": "timed",
            "questions": [{"question_id": q["id"], "position": 1, "points": 1}],
        },
        headers=admin["headers"],
    )
    assert response.status_code == 422


def test_practice_exam_full_flow(client):
    admin = _admin(client)
    q = _question(client, admin["headers"], correct=2)
    exam = client.post(
        "/api/exams",
        json={
            "title": "آزمون تمرینی",
            "subject": "algorithm",
            "exam_type": "practice",
            "questions": [{"question_id": q["id"], "position": 1, "points": 1}],
        },
        headers=admin["headers"],
    ).json()

    student = register_user(client, "practice-student@example.com")

    started = client.post(f"/api/exams/{exam['id']}/attempts", headers=student["headers"])
    assert started.status_code == 200
    assert started.json()["status"] == "practice"

    answered = client.post(
        f"/api/exams/{exam['id']}/practice-answer",
        json={"question_id": q["id"], "selected_option_id": 2},
        headers=student["headers"],
    )
    assert answered.status_code == 200
    body = answered.json()
    assert body["is_correct"] is True
    assert body["attempt"]["score"] == 100.0


def test_practice_answer_rejected_on_timed_exam(client):
    admin = _admin(client)
    q = _question(client, admin["headers"])
    exam = client.post(
        "/api/exams",
        json={
            "title": "آزمون زمان‌دار",
            "subject": "algorithm",
            "exam_type": "timed",
            "time_limit_seconds": 600,
            "questions": [{"question_id": q["id"], "position": 1, "points": 1}],
        },
        headers=admin["headers"],
    ).json()
    student = register_user(client, "timed-student@example.com")
    client.post(f"/api/exams/{exam['id']}/attempts", headers=student["headers"])

    response = client.post(
        f"/api/exams/{exam['id']}/practice-answer",
        json={"question_id": q["id"], "selected_option_id": 1},
        headers=student["headers"],
    )
    assert response.status_code == 422


def test_timed_exam_submit_scores_correctly(client):
    admin = _admin(client)
    q1 = _question(client, admin["headers"], correct=0)
    q2 = _question(client, admin["headers"], correct=1)
    exam = client.post(
        "/api/exams",
        json={
            "title": "آزمون دو سؤالی",
            "subject": "algorithm",
            "exam_type": "timed",
            "time_limit_seconds": 600,
            "questions": [
                {"question_id": q1["id"], "position": 1, "points": 1},
                {"question_id": q2["id"], "position": 2, "points": 1},
            ],
        },
        headers=admin["headers"],
    ).json()

    student = register_user(client, "scoring-student@example.com")
    attempt = client.post(f"/api/exams/{exam['id']}/attempts", headers=student["headers"]).json()

    # One correct (q1=0), one wrong (q2 answered 0, correct is 1).
    result = client.post(
        f"/api/exams/{exam['id']}/attempts/{attempt['id']}/submit",
        json={"answers": {str(q1["id"]): 0, str(q2["id"]): 0}},
        headers=student["headers"],
    )
    assert result.status_code == 200
    body = result.json()
    assert body["correct_count"] == 1
    assert body["wrong_count"] == 1
    assert body["unanswered_count"] == 0
    assert body["score"] == 50.0
    assert body["status"] == "completed"


def test_resubmitting_a_finished_attempt_is_a_no_op(client):
    admin = _admin(client)
    q = _question(client, admin["headers"], correct=0)
    exam = client.post(
        "/api/exams",
        json={
            "title": "آزمون تک‌سؤالی",
            "subject": "algorithm",
            "exam_type": "timed",
            "time_limit_seconds": 600,
            "questions": [{"question_id": q["id"], "position": 1, "points": 1}],
        },
        headers=admin["headers"],
    ).json()
    student = register_user(client, "resubmit-student@example.com")
    attempt = client.post(f"/api/exams/{exam['id']}/attempts", headers=student["headers"]).json()

    first = client.post(
        f"/api/exams/{exam['id']}/attempts/{attempt['id']}/submit",
        json={"answers": {str(q["id"]): 0}},
        headers=student["headers"],
    ).json()
    # A second submit with different (wrong) answers must not change the score.
    second = client.post(
        f"/api/exams/{exam['id']}/attempts/{attempt['id']}/submit",
        json={"answers": {str(q["id"]): 1}},
        headers=student["headers"],
    ).json()

    assert first["score"] == second["score"] == 100.0
