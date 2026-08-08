"""One-off CLI utility to promote an existing user to admin.

Run this from the project root after the user has already registered
through the website:

    python make_admin.py

It imports backend modules directly (not via the `backend.` package prefix)
because it is meant to be run as a standalone script rather than as part of
the FastAPI app.
"""
import os
import sys

# Add the backend/ folder to the import path so "from database import ..."
# below resolves correctly when this script is run directly.
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from database import SessionLocal
from models.user import User


def make_user_admin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.is_admin = True
            db.commit()
            print(f"کاربر {email} با موفقیت ادمین شد!")
        else:
            print("کاربری با این ایمیل یافت نشد. اول در سایت ثبت‌نام کن.")
    finally:
        db.close()


if __name__ == "__main__":
    target_email = input("لطفا ایمیل حساب کاربری‌ات را وارد کن: ").strip()
    make_user_admin(target_email)
