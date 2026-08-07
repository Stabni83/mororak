# مرورک

مرورک یک پلتفرم یادگیری فعال برای جزوه، سؤال، تمرین و آزمون است.

## Backend

```powershell
cd backend
python -m pip install -r requirements.txt
cd ..
python -m backend.migrate
python -m uvicorn backend.main:app --reload --port 8000
```

متغیرهای محیطی در `backend/.env.example` قرار دارند.

## Frontend

```powershell
cd client
npm install
npm run dev
```

در حالت عادی Frontend درخواست‌های `/api/*` را از طریق rewrite داخلی Next.js به Backend روی `http://127.0.0.1:8000` می‌فرستد؛ بنابراین مشکل CORS/`Failed to fetch` ناشی از تفاوت origin رخ نمی‌دهد. در صورت نیاز می‌توان مقصد Backend را با `MORORAK_API_URL` تغییر داد.

## ساختار

Backend بر اساس domain به مدل، schema، service و router تفکیک شده است.

Frontend مسئولیت‌ها را بین app، components، types و lib تقسیم می‌کند و CSS فعلی پروژه در `client/src/styles/globals.css` حفظ شده است.

## آزمون

`practice` برای حل آزاد و یادگیری است.

`timed` برای آزمون زمان‌دار است و نتیجه شامل درصد، صحیح، غلط، بی‌پاسخ و زمان ثبت‌شده است.

کاربر می‌تواند جزوه، سؤال و آزمون را به‌صورت مستقل برای حساب خودش ذخیره کند.

## سطح سختی

- `beginner`
- `intermediate`
- `advanced`
