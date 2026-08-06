import sys
import os

# اضافه کردن مسیر پوشه backend به پایتون
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