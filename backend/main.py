from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import auth, notes, questions, progress
from backend.routers import study


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Mororak API",
    description="بک‌اند پلتفرم Active Recall مرورک",
    version="1.0.0"
)

# تنظیمات CORS (بسیار مهم برای ارتباط با Next.js روی پورت 3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(questions.router, prefix="/api")
app.include_router(progress.router, prefix="/api")
app.include_router(study.router, prefix="/api")
@app.get("/")
def read_root():
    return {"message": "خوش آمدید به API پلتفرم مرورک "}