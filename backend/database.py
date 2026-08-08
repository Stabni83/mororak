"""SQLAlchemy engine/session setup.

The project uses a single SQLite file (mororak.db) that lives at the repo
root. SQLite is enough for a study-platform portfolio project; swapping the
SQLALCHEMY_DATABASE_URL below is all that's needed to move to Postgres later.
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATABASE_PATH = os.path.join(BASE_DIR, "mororak.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    # SQLite only allows a connection to be used by the thread that created
    # it by default; FastAPI's request handling can hop threads, so this
    # flag is required.
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
