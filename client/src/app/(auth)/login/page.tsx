// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { BookOpen, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email.includes("@")) newErrors.email = "آدرس ایمیل نامعتبر است";
    if (password.length < 8) newErrors.password = "رمز عبور باید حداقل ۸ کاراکتر باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      // ۱. ورود
      const loginRes = await api.auth.login(email, password);
      console.log("Login Response:", loginRes);

      // ۲. گرفتن اطلاعات کاربر
      const user = await api.auth.me();
      console.log("User Info:", user);

      // ۳. بررسی ادمین بودن
      if (user && (user as any).is_admin === true) {
        console.log("Redirecting to Admin Dashboard...");
        router.push("/admin/dashboard");
      } else {
        console.log("Redirecting to User Dashboard...");
        router.push("/dashboard");
      }
      
      router.refresh();
    } catch (err: any) {
      console.error("Login Error:", err);
      setErrors({ general: err.message || "ایمیل یا رمز عبور اشتباه است." });
    } finally {
      setLoading(false);
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
          <p className="text-sm text-text-secondary mb-6">
            برای ادامه یادگیری وارد حساب کاربری‌ات شو
          </p>

          {errors.general && (
            <div className="w-full max-w-sm mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-right">
              {errors.general}
            </div>
          )}

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
            <div className="flex justify-center">
              <Link href="/forgot-password"
                className="text-xs text-primary hover:opacity-80">
                رمز عبور را فراموش کردی؟
              </Link>
            </div>
            <Button type="submit" variant="primary" fullWidth disabled={loading} className="flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ورود به مرورک"}
            </Button>
          </form>

          <p className="text-center text-xs text-text-muted mt-6">
            حساب کاربری نداری؟{" "}
            <Link href="/signup" className="text-primary font-semibold">
              ثبت نام کن
            </Link>
          </p>
        </div>

        {/* ─── ستون چپ ─── */}
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