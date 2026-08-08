# REVIEW.md — Final Engineering Pass

This document is the honest record of what was reviewed, what was changed, what was verified,
and what remains. It follows the structure requested for this pass. Nothing here claims a test
passed or a command succeeded unless it was actually executed and its output is described below.

---

## 1. What was reviewed

The entire repository was read before any edit was made:

- **Backend**: every file in `main.py`, `database.py`, `migrate.py`, `models/*.py`,
  `schemas/*.py`, `routers/*.py`, `services/exam_service.py`, `services/exam/*.py`,
  `utils/auth.py`, `requirements.txt`, `.env.example`, `make_admin.py`.
- **Frontend**: `package.json`, `tsconfig.json`, `eslint.config.mjs`, the full `client/src/lib`,
  `client/src/types`, and every page under `client/src/app` that calls the API client
  (dashboard, admin dashboard, auth pages, the two orphaned admin editor routes, `Header.tsx`,
  `Sidebar.tsx`).
- Existing docs (`README.md`, `client/CLAUDE.md`, `client/AGENTS.md`) and `.gitignore`.

No test suite existed before this pass (`find . -iname "*test*"` returned nothing outside
`node_modules`), so section 4 of the task ("test suite") started from zero.

## 2. What was changed

See `CHANGELOG.md` for the itemized list. In summary: three real backend bugs fixed (the
`notes.is_saved` write-through bug, the missing `answer_practice` re-export, and an inconsistent
import), two dead imports removed, a full backend pytest suite added, the frontend API client
fully typed, one pre-existing broken form payload fixed as a direct consequence of that typing
work, and documentation updated/added. That is the complete set of source changes — no
unrelated files were touched, no formatting-only diffs, no renamed endpoints or routes.

## 3. Important architectural decisions

- **`is_saved` was *not* redesigned.** The brief flagged this as the primary thing to
  investigate, expecting a global boolean-on-the-entity anti-pattern. On inspection, the correct
  relational design (`SavedNote`, `SavedQuestion`, `SavedExam` — user_id + entity_id, unique
  constraint, real foreign keys — see `backend/models/saved.py` and
  `backend/models/user_answer.py`) was **already in place**, and every read endpoint already
  recomputes `is_saved` per-request from those tables rather than trusting the legacy
  `Note.is_saved` / `Question.is_saved` columns. Those legacy columns are kept only because they
  are declared as fields on the response schemas (`NoteResponse`, `QuestionResponse`) — removing
  them would be a schema/DB migration with no functional upside, since nothing reads them for
  correctness anymore. The one real bug in this area (see below) was that one write path
  *wrote* per-user state into that legacy column as an unintended side effect; it never *read*
  from it. Fixed, not redesigned.
- **The `services/exam/_service.py` compatibility shim was kept, not removed.** It's a thin
  re-export layer over `exam_service.py`. Nothing in the current codebase imports through it
  (only `routers/exams.py` imports directly from `exam_service`), but the brief explicitly
  warned not to delete it without verifying it's unused *and* unnecessary, and it's a reasonable
  seam to keep for any external code that might import the package path. Its only real problem —
  a missing `answer_practice` export, which would have caused an `ImportError` for any consumer
  that used it — is now fixed.
- **No new abstractions were introduced.** `toQueryString`, the router→service split, and the
  relational saved-item tables were all already the right shape; this pass adds types and tests
  around them rather than replacing anything.

## 4. Database changes

**None.** No model, column, or migration was added, removed, or altered. `backend/migrate.py`
(the project's lightweight "add column if missing" migration approach) is unchanged. The only
database-adjacent change is behavioral: `toggle_save_note` no longer writes to
`notes.is_saved` (see CHANGELOG). No data migration was needed for this, since the column was
already unused for anything read-facing.

## 5. Authentication / security review

- Password hashing via `passlib`/bcrypt, JWT via `python-jose`, `get_current_user` dependency
  reading the `Authorization: Bearer` header and validating the token — all reviewed in
  `backend/utils/auth.py` and `backend/routers/auth.py`. No issues found.
- Every router that returns or mutates user-specific data (`notes`, `questions` saves/answers,
  `exams` attempts/submissions, `study` time logs, `users/progress`, `users/saved`) filters by
  `current_user.id` at the query level — verified by reading each router, and now also verified
  by `backend/tests/test_isolation.py` (see below), which asserts cross-user isolation for saved
  notes, saved questions, personal notes, the merged "saved" feed, and exam attempt submission
  (a second user attempting to submit against another user's attempt ID gets a 404, not another
  user's data).
- Admin-only endpoints (`POST /questions`, `POST /notes`, `POST /exams`, catalog
  create/toggle) check `current_user.is_admin` before doing anything else — verified by reading
  the code and by `test_creating_a_question_requires_admin` /
  `test_creating_exam_requires_admin`.
- No hardcoded secrets anywhere in the source tree (checked with `grep` for common credential
  patterns before packaging). `backend/.env.example` and `client/.env.example` contain only
  placeholders (`SECRET_KEY=`, `DATABASE_URL=`, etc.), no real values. No `.env` file (real or
  otherwise) is present in the repository to package.
- No swallowed exceptions: `grep -rn "except Exception"` and `grep -rn "except:"` across the
  entire backend both returned nothing.

## 6. Testing status — read this section carefully

A full pytest suite was written (`backend/tests/`, 4 files, ~25 test cases) covering:
registration/login/duplicate-email/wrong-password/missing-token/invalid-token; user isolation
for saved notes, saved questions, personal notes, the merged saved-items feed, and exam attempt
submission; question creation authorization, validation, and answer grading; and the exam
system end-to-end (creation validation — empty question list, duplicate questions, subject
mismatch, timed exam without a time limit — plus the full practice-mode and timed-mode
attempt/submit/score flow, including a regression check that resubmitting a finished attempt
doesn't change its score).

**I could not execute this test suite, and I want to be explicit about why rather than let that
slide.** This sandbox has no network egress (`pip install fastapi` and `uv pip install fastapi`
both fail with a 403 from the package index; the same is true for `npm install` on the frontend
side — both were actually attempted, not assumed) and none of the required packages (FastAPI,
SQLAlchemy, Pydantic, pytest, httpx, Next.js, React, etc.) are pre-installed anywhere in the
environment. I searched the whole filesystem and pip/uv caches for a usable copy — there wasn't
one. This is an environment limitation, not a decision.

What I did instead, as the best available substitute:
- `python3 -m py_compile` on every backend `.py` file — confirms syntax validity of the entire
  backend, including all edited files. All passed.
- An AST-based static import check across the whole backend: every `from backend.X import Y`
  statement was cross-referenced against an AST parse of the target module to confirm `Y` is
  actually defined there. This caught the `answer_practice` gap during the review itself and
  found no other unresolved names (aside from expected false positives for package-level
  `from backend import models` style imports, which Python resolves via the import system, not
  via names defined in an `__init__.py`).
- Line-by-line manual tracing of every test against the actual router/service code it exercises
  (e.g. confirming the exact score arithmetic in `_calculate_attempt`, the exact 404 condition in
  `submit_attempt`, the exact response shape of every endpoint under test) to maximize confidence
  the assertions are correct, since I can't fall back on "run it and see."

**If you have network access, running the suite is one command:**
```bash
pip install -r backend/requirements.txt -r backend/requirements-dev.txt
pytest backend/tests
```
I recommend doing this before treating the backend as verified — static analysis is a real check,
but it is not the same as a green test run, and the brief is right that a test only "passes" once
it's actually been executed.

## 7. Frontend build status

Same constraint as above: `npm install` was actually attempted and failed with the same 403 (no
network egress), and no `node_modules` were bundled with the uploaded project, so `npm run lint`
and `npm run build` could not be executed either.

What I did instead:
- Manually cross-referenced **every single call site** of `api.ts` functions across the app
  (`grep`'d exhaustively, not sampled) against the new parameter/return types, to make sure the
  stricter typing wouldn't introduce a build-breaking mismatch. This surfaced one real
  pre-existing bug (see below) that I fixed as a direct, minimal, justified consequence of the
  typing work.
- Found (and left alone, but documented) two dead/orphaned routes —
  `client/src/app/dashboard/notes-admin/[id]/page.tsx` and
  `client/src/app/dashboard/questions-admin/[id]/page.tsx` — that are not linked from any
  navigation in the app and predate this pass. `notes-admin/[id]` calls
  `(api.notes as any).getById(...)` and `(api as any).get?.(...)`, neither of which exists on the
  API client; it has never worked, and it deliberately bypasses TypeScript via `as any`, so it
  does not interact with anything I typed. `questions-admin/[id]` called `POST /api/questions`
  with only `text` + `subject`, omitting fields the backend requires (`difficulty`, `options`,
  `correct_option_id`, `explanation`) — this always 422'd at runtime. I fixed the payload with
  placeholder values for the fields this simplified form doesn't collect (see CHANGELOG), which
  restores it to *not crashing*, but it's still a stripped-down duplicate of the fully-built
  question editor in `/admin/dashboard`. Recommend either finishing or deleting these two routes
  in a follow-up — they were not touched further here to avoid a UI redesign outside this pass's
  scope.
- Re-read the final `api.ts` and `types/api.ts` in full after editing, checking for unused
  imports, naming collisions with the existing `types/*.ts` files, and consistent field naming
  against the actual Pydantic schemas (not invented fields).

**If you have network access:**
```bash
cd client
npm install
npm run lint
npm run build
```
I recommend running this before treating the frontend as verified, for the same reason as above.

## 8. Backend startup status

Could not run `uvicorn backend.main:app` for the same no-network/no-dependencies reason. The
static checks in section 6 (syntax + import-resolution across every file, including the exact
files edited) are the best substitute available. I'm not asserting the server starts — only that
static analysis found no reason it wouldn't, and that this claim is weaker than an actual run.

## 9. Remaining technical debt

- The legacy `Note.is_saved` / `Question.is_saved` columns are still declared on the models and
  response schemas, unused for anything correctness-related. Removing them is a real (if small)
  migration and a public-schema change (the field would disappear from API responses), which is
  outside the "smallest safe change" instruction for this pass — flagged here per the brief's own
  guidance in section 3.1 rather than forced through.
- `services/exam/_service.py` is a compatibility shim with no current internal caller. Kept per
  the brief's explicit instruction not to remove things without full certainty they're
  unnecessary; worth revisiting once it's confirmed no external code depends on it.
- The two orphaned admin editor routes described in section 7.
- No frontend test suite exists yet (Jest/Vitest/Playwright etc. were never present and weren't
  added — the brief's testing section focuses on backend behavior, and adding a frontend test
  runner from scratch would be a larger, separate architectural decision).
- `AttemptOut` in `backend/schemas/exam.py` is defined but not wired up as any endpoint's
  `response_model` (the exam endpoints return plain dicts shaped similarly to it). Left alone —
  it reads as intentional API-shape documentation, and removing it has no functional benefit.

## 10. Known limitations

- This review's "backend imports/starts successfully" and "frontend lints/builds successfully"
  claims are **not verified by actually running those commands**, for the environment reasons
  explained in sections 6–8. Everything else in this document reflects genuine review and, where
  stated, genuine static verification.
- Static AST-based import checking does not catch every class of runtime error (e.g. a typo in a
  string used only at runtime, a SQL-level constraint violation, or a third-party library version
  incompatibility). It's a meaningful check, not a substitute for execution.

## 11. Files that may need future review

- `client/src/app/dashboard/notes-admin/[id]/page.tsx` and
  `client/src/app/dashboard/questions-admin/[id]/page.tsx` (finish or remove — see section 7).
- `backend/schemas/exam.py:AttemptOut` (confirm intentionally unused, or wire it up as a
  `response_model`).
- `backend/services/exam/_service.py` (confirm no external dependents, then either keep as a
  documented public compatibility surface or remove).

## 12. Final portfolio-readiness assessment: **80/100**

**What earns the 80:** the architecture was already sound going in — proper relational
saved-item tables, a real router/service split for the one feature complex enough to need it,
consistent per-user query scoping everywhere it matters, no swallowed exceptions, no hardcoded
secrets, a genuinely well-written pre-existing README. This pass added a real (if not yet
executed) test suite covering the highest-risk areas the brief called out — auth, isolation, exam
scoring — fixed three genuine (if narrow) bugs, and meaningfully improved frontend type safety
in the one file that mattered most for it.

**What holds it back from higher:** the test suite and the frontend build were never actually
run in this environment — that's a real, stated gap, not a rounding error, and it's the single
biggest reason this isn't a 90+. There's also a small amount of pre-existing rough-edge dead code
(the two orphaned admin routes) that a candid reviewer should flag in an interview rather than
present as if it doesn't exist. Someone picking this project up should run
`pytest backend/tests` and `npm run build` themselves before calling it fully verified — the
suite and the types are ready for that, but "ready to verify" and "verified" are different
claims, and this document tries hard not to blur them.
