"use client";

import { useState } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Logo from "@/components/ui/Logo";
import { KeyRound, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.includes("@")) {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-surface border border-border
                      rounded-xl shadow-card p-10 lg:p-14
                      flex flex-col items-center text-center">

        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Logo size="sm" />
          <span className="font-bold text-primary">مرورک</span>
        </Link>

        {sent ? (
          <>
            <MailCheck size={40} className="text-success mb-4" strokeWidth={1.6} />
            <h1 className="text-2xl font-extrabold mb-2">ایمیل ارسال شد</h1>
            <p className="text-sm text-text-secondary mb-8 leading-relaxed max-w-xs">
              لینک بازیابی رمز به <strong>{email}</strong> فرستاده شد.
              اینباکست رو چک کن.
            </p>
            <div className="w-full max-w-sm">
              <Button variant="ghost" fullWidth>
                <Link href="/login">بازگشت به ورود</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <KeyRound size={40} className="text-primary mb-4" strokeWidth={1.6} />
            <h1 className="text-2xl font-extrabold mb-1">فراموشی رمز عبور</h1>
            <p className="text-sm text-text-secondary mb-8">
              ایمیلت رو بنویس تا لینک بازیابی بفرستیم
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm text-right">
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
              className="block mt-5 text-xs text-primary hover:opacity-80">
              ← بازگشت به ورود
            </Link>
          </>
        )}
      </div>
    </div>
  );
}