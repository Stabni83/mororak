"""Tests for the standalone question endpoints."""
from tests.conftest import make_admin, register_user

QUESTION_PAYLOAD = {
    "subject": "algorithm",
    "difficulty": "beginner",
    "text": "کدام ساختار داده FIFO است؟",
    "options": ["پشته", "صف", "درخت", "گراف"],
    "correct_option_id": 1,
    "explanation": "صف (Queue) اولین ورودی را اولین خروجی می‌دهد.",
}


def test_creating_a_question_requires_admin(client):
    user = register_user(client, "not-admin@example.com")
    response = client.post("/api/questions", json=QUESTION_PAYLOAD, headers=user["headers"])
    assert response.status_code == 403


def test_admin_can_create_and_list_question(client):
    admin = register_user(client, "q-admin@example.com")
    make_admin("q-admin@example.com")

    created = client.post("/api/questions", json=QUESTION_PAYLOAD, headers=admin["headers"])
    assert created.status_code == 201
    question_id = created.json()["id"]

    listed = client.get("/api/questions", headers=admin["headers"])
    assert listed.status_code == 200
    assert any(q["id"] == question_id for q in listed.json())


def test_invalid_correct_option_id_is_rejected(client):
    admin = register_user(client, "q-admin-2@example.com")
    make_admin("q-admin-2@example.com")

    bad_payload = {**QUESTION_PAYLOAD, "correct_option_id": 99}
    response = client.post("/api/questions", json=bad_payload, headers=admin["headers"])
    assert response.status_code == 422


def test_answering_a_question_grades_correctly(client):
    admin = register_user(client, "q-admin-3@example.com")
    make_admin("q-admin-3@example.com")
    question = client.post("/api/questions", json=QUESTION_PAYLOAD, headers=admin["headers"]).json()

    user = register_user(client, "answerer@example.com")

    correct = client.post(
        f"/api/questions/{question['id']}/answer",
        json={"selected_option_id": 1},
        headers=user["headers"],
    )
    assert correct.status_code == 200
    assert correct.json()["is_correct"] is True

    wrong = client.post(
        f"/api/questions/{question['id']}/answer",
        json={"selected_option_id": 0},
        headers=user["headers"],
    )
    assert wrong.status_code == 200
    assert wrong.json()["is_correct"] is False


def test_toggle_save_flips_state(client):
    admin = register_user(client, "q-admin-4@example.com")
    make_admin("q-admin-4@example.com")
    question = client.post("/api/questions", json=QUESTION_PAYLOAD, headers=admin["headers"]).json()

    user = register_user(client, "saver@example.com")

    first = client.patch(f"/api/questions/{question['id']}/save", headers=user["headers"])
    assert first.json()["is_saved"] is True

    second = client.patch(f"/api/questions/{question['id']}/save", headers=user["headers"])
    assert second.json()["is_saved"] is False
