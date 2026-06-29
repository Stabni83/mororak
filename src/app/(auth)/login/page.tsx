"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { BookOpen } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.includes("@")) newErrors.email = "آدرس ایمیل نامعتبر است";
    if (password.length < 8) newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      console.log("ورود با:", email);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-surface border border-border
                      rounded-xl shadow-card overflow-hidden flex">

        {/* ─── ستون راست — فرم ورود ─── */}
        <div className="flex-1 p-10 lg:p-14 flex flex-col items-center text-center">

          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <Logo size="sm" />
            <span className="font-bold text-primary">مرورک</span>
          </Link>

          <h1 className="text-2xl font-extrabold mb-1">خوش برگشتی</h1>
          <p className="text-sm text-text-secondary mb-8">
            برای ادامه یادگیری وارد حساب کاربری‌ات شو
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm text-right">
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

          <p className="text-center text-xs text-text-muted mt-6">
            حساب کاربری نداری؟{" "}
            <Link href="/signup" className="text-primary font-semibold">
              ثبت نام کن
            </Link>
          </p>
        </div>

        {/* ─── ستون چپ — بدون استیکر، بدون قاب رنگی ─── */}
        <div className="hidden lg:flex w-80 bg-background border-r border-border
                        flex-col items-center justify-center gap-4 p-10 text-center">
          <BookOpen size={40} className="text-primary" strokeWidth={1.6} />
          <p className="text-sm font-bold">یادگیری ماندگار</p>
          <p className="text-xs text-text-muted leading-relaxed">
            با مرورک هر روز یک قدم جلوتر — از حفظ‌کردن خداحافظی کن
          </p>
        </div>

      </div>
    </div>
  );
}