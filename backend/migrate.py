from sqlalchemy import inspect, text
from backend.database import engine, Base
from backend import models


def _columns(table: str):
    inspector = inspect(engine)
    if table not in inspector.get_table_names():
        return set()
    return {item["name"] for item in inspector.get_columns(table)}


def ensure_column(table: str, column: str, definition: str):
    if table not in inspect(engine).get_table_names():
        return
    if column not in _columns(table):
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {definition}"))


def ensure_exam_questions_schema():
    inspector = inspect(engine)
    if "exam_questions" not in inspector.get_table_names():
        return
    columns = _columns("exam_questions")
    if "id" not in columns:
        with engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE exam_questions_new (
                    id INTEGER PRIMARY KEY,
                    exam_id INTEGER NOT NULL,
                    question_id INTEGER NOT NULL,
                    position INTEGER NOT NULL,
                    points FLOAT NOT NULL DEFAULT 1,
                    CONSTRAINT uq_exam_question UNIQUE (exam_id, question_id),
                    FOREIGN KEY(exam_id) REFERENCES exams(id) ON DELETE CASCADE,
                    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
                )
            """))
            connection.execute(text("""
                INSERT INTO exam_questions_new (exam_id, question_id, position, points)
                SELECT exam_id, question_id, position, 1 FROM exam_questions
            """))
            connection.execute(text("DROP TABLE exam_questions"))
            connection.execute(text("ALTER TABLE exam_questions_new RENAME TO exam_questions"))
    else:
        ensure_column("exam_questions", "points", "FLOAT NOT NULL DEFAULT 1")
        with engine.begin() as connection:
            connection.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS uq_exam_question ON exam_questions (exam_id, question_id)"
            ))


def ensure_exam_attempt_schema():
    """Upgrade old exam_attempts tables without deleting attempts.

    Old versions used columns such as total_questions/correct_answers and had
    score as NOT NULL. The current application only needs the newer counters,
    but SQLite cannot alter a column's nullability directly. We therefore keep
    all legacy columns and rebuild the table only when required.
    """
    inspector = inspect(engine)
    if "exam_attempts" not in inspector.get_table_names():
        return

    columns = _columns("exam_attempts")
    ensure_column("exam_attempts", "total_questions", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "correct_answers", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "answered_questions", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "correct_count", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "wrong_count", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "unanswered_count", "INTEGER NOT NULL DEFAULT 0")
    ensure_column("exam_attempts", "status", "VARCHAR NOT NULL DEFAULT 'in_progress'")
    ensure_column("exam_attempts", "answers", "JSON NOT NULL DEFAULT '{}'")

    # We do NOT require score to be nullable anymore because start_attempt()
    # always writes score=0. This makes the fix safe for legacy SQLite files.
    # If a legacy database has NULL scores in completed rows, normalize them.
    with engine.begin() as connection:
        connection.execute(text("UPDATE exam_attempts SET score = 0 WHERE score IS NULL"))


def ensure_schema():
    Base.metadata.create_all(bind=engine)
    ensure_column("questions", "created_by_id", "INTEGER")
    ensure_column("notes", "author", "VARCHAR NOT NULL DEFAULT 'مرورک'")
    ensure_column("user_answers", "exam_attempt_id", "INTEGER")
    with engine.begin() as connection:
        connection.execute(text("UPDATE notes SET author = 'مرورک' WHERE author IS NULL OR TRIM(author) = ''"))
    ensure_column("exams", "author", "VARCHAR NOT NULL DEFAULT 'مرورک'")
    with engine.begin() as connection:
        connection.execute(text("UPDATE exams SET author = 'مرورک' WHERE author IS NULL OR TRIM(author) = ''"))
    ensure_column("exams", "show_answers_immediately", "BOOLEAN NOT NULL DEFAULT 1")
    ensure_column("exams", "filter_values", "JSON NOT NULL DEFAULT '{}'")
    ensure_exam_attempt_schema()
    ensure_column("exam_attempts", "last_activity_at", "DATETIME")
    ensure_exam_questions_schema()
    Base.metadata.create_all(bind=engine)
    from backend.models.catalog import SubjectCatalog
    from sqlalchemy.orm import Session
    with Session(engine) as db:
        if db.query(SubjectCatalog).count() == 0:
            defaults = [("algorithm", "الگوریتم"), ("data-structure", "ساختمان داده"), ("os", "سیستم‌عامل"), ("network", "شبکه"), ("database", "پایگاه داده")]
            for index, (slug, name) in enumerate(defaults):
                db.add(SubjectCatalog(slug=slug, name=name, position=index, is_active=True))
            db.commit()


if __name__ == "__main__":
    ensure_schema()
    print("Database schema is ready.")
