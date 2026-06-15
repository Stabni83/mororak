"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false); // آیا ایمیل ارسال شده؟

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("@")) {
      // TODO: فراخوانی API
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-surface border border-border
                      rounded-xl shadow-card p-8 text-center">

        {/* آیکون */}
        <div className="w-12 h-12 bg-primary/8 rounded-xl flex items-center
                        justify-center text-2xl mx-auto mb-5">
          🔑
        </div>

        {/* دو حالت: فرم یا تأییدیه */}
        {sent ? (
          // ─── حالت بعد از ارسال ───
          <>
            <h1 className="text-lg font-extrabold mb-2">ایمیل ارسال شد ✅</h1>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              لینک بازیابی رمز به <strong>{email}</strong> فرستاده شد.
              اینباکست رو چک کن.
            </p>
            <Button variant="ghost" fullWidth>
              <Link href="/login">بازگشت به ورود</Link>
            </Button>
          </>
        ) : (
          // ─── حالت فرم ───
          <>
            <h1 className="text-lg font-extrabold mb-2">فراموشی رمز عبور</h1>
            <p className="text-sm text-text-secondary mb-6">
              ایمیلت رو بنویس تا لینک بازیابی بفرستیم
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-right">
              <Input
                label="آدرس ایمیل"
                type="email"
                name="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" fullWidth>
                ارسال لینک بازیابی
              </Button>
            </form>
            <Link href="/login"
              className="block mt-4 text-xs text-primary hover:opacity-80">
              ← بازگشت به ورود
            </Link>
          </>
        )}
      </div>
    </div>
  );
}