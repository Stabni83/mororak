"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});

  // تابع کمکی برای update هر فیلد
  // به جای ۴ تابع جداگانه، یک تابع generic داریم
  function handleChange(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function validate(): boolean {
    const newErrors: Partial<typeof form> = {};

    if (form.name.trim().length < 2) newErrors.name = "نام باید حداقل ۲ کاراکتر باشد";
    if (!form.email.includes("@")) newErrors.email = "ایمیل نامعتبر است";
    if (form.password.length < 8) newErrors.password = "حداقل ۸ کاراکتر";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "رمزهای عبور یکسان نیستند";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      console.log("ثبت نام:", form.email);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl
                      shadow-card p-8">

        <Link href="/" className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center
                          justify-center text-white text-sm font-bold">م</div>
          <span className="font-bold text-primary">مرورک</span>
        </Link>

        <h1 className="text-xl font-extrabold mb-1">شروع رایگان 🚀</h1>
        <p className="text-sm text-text-secondary mb-6">
          حساب بساز و یادگیریت رو همین الان شروع کن
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="نام و نام خانوادگی"
            name="name"
            placeholder="علی احمدی"
            value={form.name}
            onChange={handleChange("name")}
            error={errors.name}
          />
          <Input
            label="ایمیل"
            type="email"
            name="email"
            placeholder="example@email.com"
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />
          <Input
            label="رمز عبور"
            type="password"
            name="password"
            placeholder="حداقل ۸ کاراکتر"
            value={form.password}
            onChange={handleChange("password")}
            error={errors.password}
            hint="از حروف بزرگ، کوچک و عدد استفاده کن"
          />
          <Input
            label="تکرار رمز عبور"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            error={errors.confirmPassword}
          />

          <Button type="submit" variant="primary" fullWidth className="mt-1">
            ساخت حساب کاربری
          </Button>
        </form>

        <p className="text-center text-xs text-text-muted mt-5">
          قبلاً ثبت نام کردی؟{" "}
          <Link href="/login" className="text-primary font-semibold">وارد شو</Link>
        </p>
      </div>
    </div>
  );
}