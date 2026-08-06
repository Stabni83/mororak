"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor } from "lucide-react";

export default function AdminHeader() {
  const [userName, setUserName] = useState<string>("کاربر");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:8000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.name) {
            setUserName(data.name);
          }
        })
        .catch(() => {});
    }
  }, []);

  const firstLetter = userName.charAt(0);

  return (
    <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-text-primary">داشبورد مدیریت</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background text-text-secondary hover:text-primary hover:bg-primary/10 text-sm font-medium transition-colors"
        >
          <Monitor size={18} />
          <span>مشاهده پنل کاربری</span>
        </Link>

        <div className="flex items-center gap-3 pr-4 border-r border-border">
          <div className="text-left">
            <span className="block text-sm font-bold text-text-primary">{userName}</span>
            <span className="block text-xs text-text-secondary">مدیر سیستم</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base shadow-inner">
            {firstLetter}
          </div>
        </div>
      </div>
    </header>
  );
}