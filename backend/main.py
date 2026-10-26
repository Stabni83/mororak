"""FastAPI application entry point.

Wires together the database schema, CORS policy, and every router. Run with:
    uvicorn backend.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend import models  # noqa: F401  (import registers all models with Base)
from backend.migrate import ensure_schema
from backend.routers import auth, catalog, exams, notes, progress, questions, resources, saved, study

# Create tables / apply lightweight migrations before the app starts serving.
ensure_schema()

app = FastAPI(
    title="Mororak API",
    description="بک‌اند پلتفرم Active Recall مرورک",
    version="2.0.0",
)

# The Next.js dev server runs on :3000; allow it (and 127.0.0.1) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Every router is mounted under /api, e.g. auth.router -> /api/auth/...
for router in (
    auth.router,
    notes.router,
    questions.router,
    progress.router,
    study.router,
    exams.router,
    saved.router,
    catalog.router,
    resources.router,
):
    app.include_router(router, prefix="/api")


@app.get("/")
def read_root():
    """Simple health-check / landing endpoint for the API root."""
    return {"message": "خوش آمدید به API پلتفرم مرورک"}
