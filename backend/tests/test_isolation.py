"""User-isolation tests.

Saved notes/questions are a per-user relationship, not a property of the
note/question itself (see backend/models/saved.py and
backend/models/user_answer.py:SavedQuestion). These tests prove that
saving/unsaving as one user never becomes visible to, or overwrites data
for, another user.
"""
from tests.conftest import make_admin, register_user


def _make_admin_client(client, email="admin@example.com"):
    admin = register_user(client, email)
    make_admin(email)
    return admin


def _create_question(client, admin_headers, subject="algorithm"):
    payload = {
        "subject": subject,
        "difficulty": "beginner",
        "text": "پیچیدگی زمانی جستجوی دودویی چیست؟",
        "options": ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        "correct_option_id": 1,
        "explanation": "جستجوی دودویی در هر مرحله فضای جستجو را نصف می‌کند.",
    }
    response = client.post("/api/questions", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def _create_note(client, admin_headers, subject="algorithm"):
    payload = {"title": "یادداشت تست", "subject": subject, "content": "محتوای یادداشت تست."}
    response = client.post("/api/notes", json=payload, headers=admin_headers)
    assert response.status_code == 201, response.text
    return response.json()


def test_saved_question_does_not_leak_between_users(client):
    admin = _make_admin_client(client)
    question = _create_question(client, admin["headers"])

    user_a = register_user(client, "user-a@example.com")
    user_b = register_user(client, "user-b@example.com")

    save_response = client.patch(f"/api/questions/{question['id']}/save", headers=user_a["headers"])
    assert save_response.status_code == 200
    assert save_response.json()["is_saved"] is True

    # User A sees it as saved...
    from_a = client.get(f"/api/questions/{question['id']}", headers=user_a["headers"])
    assert from_a.json()["is_saved"] is True

    # ...but User B, who never saved it, must not.
    from_b = client.get(f"/api/questions/{question['id']}", headers=user_b["headers"])
    assert from_b.json()["is_saved"] is False

    # The same isolation must hold in the list endpoint.
    list_for_b = client.get("/api/questions", headers=user_b["headers"]).json()
    matching = next(q for q in list_for_b if q["id"] == question["id"])
    assert matching["is_saved"] is False


def test_saved_note_does_not_leak_between_users(client):
    admin = _make_admin_client(client)
    note = _create_note(client, admin["headers"])

    user_a = register_user(client, "note-a@example.com")
    user_b = register_user(client, "note-b@example.com")

    save_response = client.patch(f"/api/notes/{note['id']}/save", headers=user_a["headers"])
    assert save_response.status_code == 200
    assert save_response.json()["is_saved"] is True

    from_a = client.get(f"/api/notes/{note['id']}", headers=user_a["headers"])
    assert from_a.json()["is_saved"] is True

    from_b = client.get(f"/api/notes/{note['id']}", headers=user_b["headers"])
    assert from_b.json()["is_saved"] is False


def test_toggling_note_save_does_not_write_to_the_shared_column(client):
    """Regression test for the bug fixed in routers/notes.py:toggle_save_note.

    It used to set `note.is_saved` on the ORM object *before* db.commit(),
    which persisted that one request's per-user flag into the shared
    notes.is_saved column. Every read path already recomputes is_saved from
    SavedNote before returning, so the bug never leaked through the API -
    but it silently corrupted stored data on every save/unsave. This checks
    the raw column directly, not just the API response.
    """
    import backend.database as database
    from backend.models.note import Note

    admin = _make_admin_client(client)
    note = _create_note(client, admin["headers"])
    user_a = register_user(client, "toggle-a@example.com")

    client.patch(f"/api/notes/{note['id']}/save", headers=user_a["headers"])

    db = database.SessionLocal()
    try:
        stored = db.query(Note).filter(Note.id == note["id"]).first()
        assert stored.is_saved is False
    finally:
        db.close()


def test_personal_note_is_private_to_each_user(client):
    admin = _make_admin_client(client)
    note = _create_note(client, admin["headers"])

    user_a = register_user(client, "personal-a@example.com")
    user_b = register_user(client, "personal-b@example.com")

    write = client.patch(
        f"/api/notes/{note['id']}/personal-note",
        json={"content": "یادداشت خصوصی من"},
        headers=user_a["headers"],
    )
    assert write.status_code == 200

    a_view = client.get(f"/api/notes/{note['id']}/personal-note", headers=user_a["headers"])
    assert a_view.json()["content"] == "یادداشت خصوصی من"

    b_view = client.get(f"/api/notes/{note['id']}/personal-note", headers=user_b["headers"])
    assert b_view.json()["content"] == ""


def test_users_saved_feed_only_contains_their_own_items(client):
    admin = _make_admin_client(client)
    question = _create_question(client, admin["headers"])
    note = _create_note(client, admin["headers"])

    user_a = register_user(client, "feed-a@example.com")
    user_b = register_user(client, "feed-b@example.com")

    client.patch(f"/api/questions/{question['id']}/save", headers=user_a["headers"])
    client.patch(f"/api/notes/{note['id']}/save", headers=user_a["headers"])

    feed_a = client.get("/api/users/saved", headers=user_a["headers"]).json()
    feed_b = client.get("/api/users/saved", headers=user_b["headers"]).json()

    assert len(feed_a) == 2
    assert feed_b == []


def test_user_cannot_submit_another_users_exam_attempt(client):
    admin = _make_admin_client(client)
    question = _create_question(client, admin["headers"])
    exam_payload = {
        "title": "آزمون تستی",
        "subject": "algorithm",
        "exam_type": "timed",
        "time_limit_seconds": 600,
        "questions": [{"question_id": question["id"], "position": 1, "points": 1}],
    }
    exam = client.post("/api/exams", json=exam_payload, headers=admin["headers"]).json()

    user_a = register_user(client, "exam-a@example.com")
    user_b = register_user(client, "exam-b@example.com")

    attempt = client.post(f"/api/exams/{exam['id']}/attempts", headers=user_a["headers"]).json()

    # B tries to submit A's attempt id - must be rejected, not silently graded.
    response = client.post(
        f"/api/exams/{exam['id']}/attempts/{attempt['id']}/submit",
        json={"answers": {str(question["id"]): 1}},
        headers=user_b["headers"],
    )
    assert response.status_code == 404
