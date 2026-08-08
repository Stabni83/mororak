# Changelog

All notable changes from this engineering/testing/portfolio-readiness pass are listed here.
Dates are omitted since this was a single pass; entries are grouped by area.

## Backend

### Fixed
- **`backend/routers/notes.py` — `toggle_save_note`**: stopped writing the current user's
  per-request bookmark flag into the shared `notes.is_saved` column before `db.commit()`. The
  flag is now only stamped onto the in-memory response object *after* the commit, matching the
  pattern already used correctly by every other route in the file (`get_notes`, `get_note`,
  `get_note_by_slug`) and by `backend/routers/questions.py`. This was a data-hygiene bug, not an
  API-visible one — every read path already recomputes `is_saved` from the `SavedNote` table
  before returning, so no response was ever affected — but it silently corrupted a stored column
  on every save/unsave. See `REVIEW.md` for the full analysis.
- **`backend/services/exam/_service.py`**: added the missing `answer_practice` re-export. This
  compatibility shim re-exports the public functions of `exam_service.py`; it was missing one of
  them, so any code importing `answer_practice` through this module (rather than directly from
  `exam_service`) would have failed with an `ImportError`.
- **`backend/routers/study.py`**: fixed an inconsistent import — `get_current_user` was imported
  indirectly via `backend.routers.auth` instead of `backend.utils.auth`, unlike every other
  router. Same function object, purely a consistency fix.
- Removed two genuinely unused imports found via an AST-based sweep of the whole backend:
  `ConfigDict` in `backend/schemas/exam.py` and `List` in `backend/routers/questions.py`.

### Added
- `backend/tests/` — a new pytest suite: `conftest.py` (isolated per-test SQLite database +
  `TestClient` fixture), `test_auth.py`, `test_isolation.py`, `test_questions.py`,
  `test_exams.py`. Covers registration/login/token validation, user isolation for saved
  notes/questions/personal notes/exam attempts, question creation & answering, and the full exam
  create → attempt → submit → score flow (including edge cases: duplicate questions, subject
  mismatch, missing time limit, practice-answer-on-timed-exam, re-submitting a finished attempt).
- `backend/requirements-dev.txt` — `pytest` and `httpx`, kept separate from the production
  `requirements.txt`.

## Frontend

### Changed
- **`client/src/lib/api.ts`**: replaced every implicit/explicit `any` in the API client's
  function signatures with concrete request/response types. Every endpoint function now returns
  a typed `Promise<T>` instead of an untyped one.
- **`client/src/types/api.ts`** (new file): request/response DTOs that weren't already covered by
  an entity type — `RegisterInput`, `AuthTokenResponse`, `NoteCreateInput`,
  `QuestionCreateInput`, `QuestionAnswerResult`, `ToggleSaveResult`, `ExamCreateInput`,
  `SavedItem`, `ProgressResponse` (+ its nested shapes), `LogStudyTimeResult`. Field names mirror
  the backend Pydantic schemas and router return shapes one-to-one; re-exported from
  `client/src/types/index.ts`.
- **`client/src/app/dashboard/questions-admin/[id]/page.tsx`**: this editor only ever collected
  `text` + `subject` but called `POST /api/questions`, which requires `difficulty`, `options`,
  `correct_option_id`, and `explanation` too — the call would always fail with a 422. Since
  making `QuestionCreateInput` accurately reflect the backend's required fields would otherwise
  turn this pre-existing runtime bug into a build-time type error, the payload now includes
  placeholder values for the fields this simplified form doesn't collect yet. See `REVIEW.md`
  for why this page (and its sibling `notes-admin/[id]`) are flagged as incomplete/orphaned.

## Documentation
- `README.md`: added a "Running the tests" section, listed `backend/tests/` in the project
  structure, updated "known limitations" (test suite exists now; noted the two orphaned admin
  editor routes).
- `CHANGELOG.md` (this file) and `REVIEW.md` added.

## Not changed (reviewed, found correct)
- Authentication/JWT flow, password hashing, `get_current_user` dependency.
- `SavedQuestion`/`SavedNote`/`SavedExam` relational tables and the ownership checks in
  `exam_service.py` (attempt lookups, submit authorization) — already correctly scoped per user.
- Exception handling — no bare `except:` or swallowed `except Exception: pass` found anywhere in
  the backend.
- `backend/routers/questions.py` and `backend/routers/catalog.py` — already thin and correct, no
  changes made.
