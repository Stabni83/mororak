# Mororak (مرورک)

Mororak is a full-stack **Active Recall study platform** built for Persian-speaking computer
science / computer engineering students. It combines short study notes, multiple-choice
questions, and exams into one loop: **read → recall → get graded → repeat**, and tracks the
user's study activity over time.

The UI is entirely in Persian and laid out **right-to-left (RTL)**. This README is in English
so the project itself (architecture, decisions, and how to run it) is understandable to anyone,
regardless of whether they read Persian.

---

## 1. What the app actually does

| Feature | Description |
|---|---|
| **Notes** | Short study articles per subject (e.g. Algorithms, Databases). Users can bookmark a note and keep a private personal note underneath the shared content. |
| **Questions** | A bank of standalone multiple-choice questions. Answering one gives instant feedback plus an explanation — this is the core "recall" mechanic. |
| **Exams** | Groups of questions assembled by an admin. Two modes: <br>• **Practice** — untimed, answer one question at a time with instant feedback.<br>• **Timed** — has a countdown, all answers are submitted together at the end and graded in one pass. |
| **Dashboard** | Overall progress ring, a 7-day activity chart (questions answered + minutes studied), and "continue where you left off" shortcuts. |
| **Saved items** | One merged, chronological feed of every note/question/exam the user has bookmarked. |
| **Admin panel** | Create/edit notes, questions, and exams; manage the subject list and dynamic filter fields shown on the Exams page — all without touching code. |
| **Auth** | Email + password registration/login, JWT-based sessions. |

---

## 2. Tech stack

**Backend**
- [FastAPI](https://fastapi.tiangolo.com/) (Python) — REST API
- [SQLAlchemy](https://www.sqlalchemy.org/) ORM + SQLite (file-based, zero setup) — swappable for Postgres by changing one connection string
- JWT auth via `python-jose`, password hashing via `passlib`/`bcrypt`
- Pydantic v2 for request/response validation

**Frontend**
- [Next.js](https://nextjs.org/) (App Router) + React + TypeScript
- Tailwind CSS
- [Vazirmatn](https://github.com/rastikerdar/vazirmatn) — the Persian font used across the UI
- [Recharts](https://recharts.org/) for the activity chart
- [lucide-react](https://lucide.dev/) for icons

---

## 3. Project structure

```
mororack/
├── backend/                     FastAPI application
│   ├── main.py                  App entry point: creates the app, mounts routers, runs migrations
│   ├── database.py              SQLAlchemy engine/session setup
│   ├── migrate.py               Lightweight "add column if missing" schema upgrades (no Alembic)
│   ├── models/                  SQLAlchemy ORM models (one file per table/entity)
│   ├── schemas/                 Pydantic request/response schemas
│   ├── routers/                 One FastAPI router per resource (auth, notes, questions, exams, ...)
│   ├── services/
│   │   ├── exam_service.py      All exam business logic (create/list/attempt/grade)
│   │   └── exam/_service.py     Thin backward-compatible re-export of exam_service (see below)
│   ├── tests/                   Pytest suite (auth, user isolation, questions, exams)
│   └── utils/
│       └── auth.py              JWT creation/verification, password hashing, current-user dependency
│
├── client/                      Next.js application
│   └── src/
│       ├── app/                 Pages, using the Next.js App Router (route groups for auth/dashboard)
│       ├── components/          Reusable UI split into ui/ (generic), layout/, dashboard/, admin/, ...
│       ├── lib/
│       │   ├── api.ts           Single API client — every backend call goes through here
│       │   └── utils.ts         Small shared helpers (Tailwind class merging, etc.)
│       ├── types/                TypeScript types that mirror the backend's Pydantic schemas
│       ├── context/              React Context (sidebar open/closed state)
│       └── hooks/                Custom hooks (scroll-reveal animation)
│
├── make_admin.py                 CLI script to promote a registered user to admin
└── mororak.db                    SQLite database file (created automatically on first run)
```

---

## 4. How the pieces talk to each other

1. **Every frontend request goes through `client/src/lib/api.ts`.** This one file owns
   attaching the JWT to outgoing requests, redirecting to `/login` on a 401, and turning
   backend error responses into readable `Error` objects. No component calls `fetch()` directly.
2. **Routers are thin.** Files under `backend/routers/` mostly just validate the request shape
   (via FastAPI + Pydantic) and call into models or, for the more complex Exams feature, into
   `backend/services/exam_service.py`. This keeps business logic in one testable place instead
   of scattered across HTTP handlers.
3. **"Saved" is a relationship, not a flag.** Whether a note/question/exam is bookmarked by the
   *current* user is computed per-request from a join table (`SavedNote`, `SavedQuestion`,
   `SavedExam`) — it is never trusted from a stored boolean column, because "saved" is inherently
   per-user, not a property of the note/question/exam itself.
4. **The subject list and exam filters are data, not code.** They live in the
   `subjects_catalog` / `filter_definitions` tables (`backend/models/catalog.py`) and are
   editable from the admin panel. This means adding a new subject (e.g. "Compilers") never
   requires a frontend deploy.
5. **Schema upgrades are hand-written, on purpose.** `backend/migrate.py` runs once on startup
   and adds any missing columns to the existing SQLite file. For a project this size, a handful
   of explicit `ALTER TABLE ... ADD COLUMN` calls are easier to read and reason about than
   pulling in a full migration framework like Alembic.

---

## 5. Running it locally

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend

```bash
cd mororack
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r backend/requirements.txt

# Optional: copy backend/.env.example to backend/.env and adjust the secret key
cp backend/.env.example backend/.env

uvicorn backend.main:app --reload --port 8000
```

The API is now running at `http://127.0.0.1:8000`. Interactive docs (Swagger UI) are available
at `http://127.0.0.1:8000/docs`. On first launch, `ensure_schema()` automatically creates
`mororak.db` and seeds the default subject list — no manual migration step needed.

### Frontend

```bash
cd mororack/client
npm install

# Optional: copy .env.example to .env.local if you need to point at a non-default API URL
cp .env.example .env.local

npm run dev
```

The site is now running at `http://localhost:3000`.

### Creating your first admin account

1. Register a normal account through the website's signup page.
2. From the project root, run:
   ```bash
   python make_admin.py
   ```
3. Enter the email you just registered with. The script flips that user's `is_admin` flag to
   `true` directly in the database. Log out and back in on the site to pick up the change.

---

## 6. Running the tests

The backend has a pytest suite covering authentication, authorization, user-isolation for saved
notes/questions, question answering, and the full exam create → attempt → submit → score flow.
Every test runs against an isolated, throwaway SQLite database (created fresh per test) — it
never touches your real `mororak.db`.

```bash
cd mororack
pip install -r backend/requirements.txt -r backend/requirements-dev.txt
pytest backend/tests
```

---

## 7. API overview

All endpoints are mounted under `/api`. A few representative examples:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Exchange email/password for a JWT |
| `GET`  | `/api/notes` | List notes (filter by subject / saved / search) |
| `PATCH`| `/api/notes/{id}/save` | Toggle bookmark on a note |
| `GET`  | `/api/questions` | List standalone questions |
| `POST` | `/api/questions/{id}/answer` | Submit an answer, get instant grading |
| `GET`  | `/api/exams` | List exams (with dynamic filter support) |
| `POST` | `/api/exams/{id}/attempts` | Start (or resume) an exam attempt |
| `POST` | `/api/exams/{id}/attempts/{attempt_id}/submit` | Submit a timed exam for grading |
| `GET`  | `/api/users/progress` | Dashboard summary: progress %, weekly activity, recent visits |

See `/docs` (Swagger) while the backend is running for the complete, always-up-to-date list.

---

## 8. Building something similar

If you want to build a study platform with the same shape, the pattern that made this project
work well is:

1. **Pick one entity that is "content"** (here: Notes) **and one that is "assessment"** (here:
   Questions), and design them so assessments can optionally point back at content
   (`Question.note_id`). This lets you jump from "I don't understand this" straight into "let me
   read the note about it."
2. **Model bookmarking as its own join table per entity**, not a boolean column, from day one —
   retrofitting this later (as this project had to) means finding and fixing every endpoint that
   assumed the column was trustworthy.
3. **Keep an HTTP layer (routers) and a logic layer (services) separate** as soon as any single
   feature's rules get more complex than a few lines — exams were the first feature here to earn
   their own `services/` module, and it made grading logic much easier to follow and change.
4. **Put configurable-by-admin data in the database, not in frontend constants**, for anything
   you expect to grow (subjects, filters, categories). It costs one extra table and saves every
   future deploy-just-to-add-an-option cycle.
5. **Centralize your frontend's networking in one client module.** Auth headers, 401 handling,
   and error-message formatting are exactly the kind of logic that becomes a maintenance
   nightmare if it is duplicated across dozens of `fetch()` calls.

---

## 9. Known limitations / ideas for next steps

- SQLite is fine for a portfolio/demo but should move to Postgres for real multi-user traffic
  (the SQLAlchemy layer already makes this a one-line change).
- Test coverage is still limited to the backend (`backend/tests/`). There is no frontend test
  suite yet.
- The legacy `is_saved` columns on `Note`/`Question` (kept only for response-schema backward
  compatibility) could be dropped entirely once every client is confirmed to rely solely on the
  per-request computed value.
- Two admin editor routes (`/dashboard/notes-admin/[id]`, `/dashboard/questions-admin/[id]`) are
  incomplete leftovers from an earlier iteration of the admin panel and aren't linked from any
  navigation — the fully-built equivalents live in `/admin/dashboard`. See `REVIEW.md` for detail.
