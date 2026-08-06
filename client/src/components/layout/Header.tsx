"use client";

import { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { Menu, LogOut, Shield } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  const { toggle } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.auth.me().then((user: any) => {
      if (user?.name) {
        setUserName(user.name);
      }
      if (user?.is_admin) {
        setIsAdmin(true);
      }
    }).catch(() => {
      const cachedName = localStorage.getItem("userName");
      if (cachedName) setUserName(cachedName);
    });

    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const firstLetter = userName ? userName.charAt(0) : "ک";
  const isMainDashboard = pathname === "/dashboard";
  const displaySubtitle = isMainDashboard && userName
    ? `${userName}، خوش آمدید`
    : subtitle;

  const handleLogout = async () => {
    await api.auth.logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="h-14 bg-bg border-b border-border px-4 flex items-center justify-between sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="lg:hidden w-8 h-8 flex items-center justify-center text-text-secondary hover:text-primary transition-colors"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-text">{title}</h1>
          </div>
          {displaySubtitle && (
            <p className="text-xs text-text-muted">{displaySubtitle}</p>
          )}
        </div>
      </div>

      <div className="relative" ref={dropdownRef}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors"
          title={userName || "کاربر"}
        >
          {firstLetter}
        </div>

        {dropdownOpen && (
          <div className="absolute left-0 mt-2 w-48 bg-surface border border-border rounded-xl shadow-card py-1.5 z-50 text-right">
            <div className="px-4 py-2 border-b border-border mb-1">
              <p className="text-xs text-text-muted">وارد شده با نام:</p>
              <p className="text-xs font-bold text-text truncate">{userName || "کاربر"}</p>
            </div>

            {isAdmin && (
              <Link
                href="/admin/dashboard"
                className="w-full px-4 py-2 text-xs text-text-secondary hover:bg-primary/5 hover:text-primary flex items-center gap-2 transition-colors font-medium"
              >
                <Shield size={14} />
                پنل مدیریت سیستم
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut size={14} />
              خروج از حساب کاربری
            </button>
          </div>
        )}
      </div>
    </header>
  );
}