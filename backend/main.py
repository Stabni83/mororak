from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend import models
from backend.routers import auth, notes, questions, progress, study, exams, saved, catalog
from backend.migrate import ensure_schema

ensure_schema()

app = FastAPI(title="Mororak API", description="بک‌اند پلتفرم Active Recall مرورک", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
for router in (auth.router, notes.router, questions.router, progress.router, study.router, exams.router, saved.router, catalog.router):
    app.include_router(router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "خوش آمدید به API پلتفرم مرورک"}
