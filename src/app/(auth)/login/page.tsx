"use client";

// صفحه ورود — دو ستونه: فرم سمت راست، تصویر سمت چپ
// "use client" چون فرم state دارد

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  // state برای مقادیر فرم
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // state برای خطاهای validation
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};

    if (!email.includes("@")) {
      newErrors.email = "آدرس ایمیل نامعتبر است";
    }
    if (password.length < 8) {
      newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
    }

    setErrors(newErrors);
    // اگر object خالی باشد validation موفق است
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // جلوگیری از reload صفحه
    if (validate()) {
      // TODO: ارسال به API
      console.log("ورود با:", email);
    }
  }

  return (
    // صفحه کامل — پس‌زمینه آبی کم‌رنگ
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      {/* کارت اصلی — دو ستونه */}
      <div className="w-full max-w-3xl bg-surface border border-border
                      rounded-xl shadow-card overflow-hidden flex">

        {/* ─── ستون راست — فرم ورود ─── */}
        <div className="flex-1 p-8 lg:p-10">

          {/* لوگو */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center
                            justify-center text-white text-sm font-bold">م</div>
            <span className="font-bold text-primary">مرورک</span>
          </Link>

          <h1 className="text-xl font-extrabold mb-1">خوش برگشتی 👋</h1>
          <p className="text-sm text-text-secondary mb-6">
            برای ادامه یادگیری وارد حساب کاربری‌ات شو
          </p>

          {/* فرم ورود */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="ایمیل"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <Input
              label="رمز عبور"
              type="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            {/* لینک فراموشی رمز */}
            <div className="flex justify-end">
              <Link href="/forgot-password"
                className="text-xs text-primary hover:opacity-80">
                رمز عبور را فراموش کردی؟
              </Link>
            </div>

            <Button type="submit" variant="primary" fullWidth>
              ورود به مرورک
            </Button>
          </form>

          {/* لینک ثبت نام */}
          <p className="text-center text-xs text-text-muted mt-5">
            حساب کاربری نداری؟{" "}
            <Link href="/signup" className="text-primary font-semibold">
              ثبت نام کن
            </Link>
          </p>
        </div>

        {/* ─── ستون چپ — تصویر و پیام ─── */}
        {/* hidden در موبایل، block در دسکتاپ */}
        <div className="hidden lg:flex w-72 bg-background border-r border-border
                        flex-col items-center justify-center gap-4 p-8">
          <div className="w-20 h-20 bg-primary/8 border-2 border-dashed border-primary/25
                          rounded-2xl flex items-center justify-center text-4xl">
            📖
          </div>
          <p className="text-sm font-bold text-center">یادگیری ماندگار</p>
          <p className="text-xs text-text-muted text-center leading-relaxed">
            با مرورک هر روز یک قدم جلوتر — از حفظ‌کردن خداحافظی کن
          </p>
        </div>

      </div>
    </div>
  );
}