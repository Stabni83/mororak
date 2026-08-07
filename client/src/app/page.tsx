"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { SUBJECT_LABELS, type Subject } from "@/types";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { LogOut, ClipboardCheck, FileText, ArrowLeft } from "lucide-react";
import {
  Brain,
  NotebookPen,
  Zap,
  Sigma,
  Binary,
  Cpu,
  Network,
  Mail,
} from "lucide-react";
import Logo from "@/components/ui/Logo";

const features = [
  {
    icon: Brain,
    title: "Active Recall",
    description: "با حل سوال یاد بگیر — روشی که علم اعصاب تأیید کرده",
    color: "bg-primary/8 text-primary",
  },
  {
    icon: NotebookPen,
    title: "پاسخ تشریحی",
    description: "هر سوال با توضیح کامل، کد نمونه، و مثال کاربردی",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: Zap,
    title: "مرور سریع",
    description: "دروس سازماندهی‌شده برای مرور هدفمند قبل از امتحان",
    color: "bg-accent/10 text-accent",
  },
] as const;

const popularSubjects: { subject: Subject; icon: typeof Sigma; count: number }[] = [
  { subject: "algorithm", icon: Sigma, count: 48 },
  { subject: "data-structure", icon: Binary, count: 52 },
  { subject: "os", icon: Cpu, count: 34 },
  { subject: "network", icon: Network, count: 28 },
];

function Navbar() {
  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-border
                    sticky top-0 z-50 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">

        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" />
          <span className="text-base font-bold text-primary">مرورک</span>
        </Link>

        {/* لینک‌های میانی */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard/notes"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            جزوات
          </Link>
          <Link href="/dashboard/questions"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            سوالات
          </Link>
          <Link href="/about"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            درباره ما
          </Link>
        </div>

        {/* دکمه‌های ورود و ثبت‌نام */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Link href="/login">ورود</Link>
          </Button>
          <Button variant="primary" size="sm">
            <Link href="/signup">شروع رایگان</Link>
          </Button>
        </div>

      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="px-6 lg:px-12 py-20 lg:py-28 overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row
                      items-center gap-12">

        {/* متن Hero */}
        <Reveal className="flex-1 text-center lg:text-right">

          {/* Badge بالای عنوان */}
          <div className="inline-flex mb-4">
            <Badge variant="primary">✦ پلتفرم Active Recall فارسی</Badge>
          </div>

          {/* عنوان اصلی */}
          <h1 className="text-3xl lg:text-5xl font-extrabold leading-tight
                         text-text mb-4">
            یه مرور کوچولو<br />
            <span className="text-primary">برای تسلط بیشتر</span><br />
            قبل امتحان
          </h1>

          {/* توضیح کوتاه */}
          <p className="text-base text-text-secondary leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
            اگر جزوه‌هات رو خوندی، حالا وقتشه مفاهیم رو با حل سوال، پاسخ تشریحی
            و مرور هوشمند ماندگار کنی.
          </p>

          {/* دکمه‌های CTA */}
          <div className="flex gap-3 justify-center lg:justify-start flex-row-reverse">
            <Button variant="primary" size="lg">
              <Link href="/signup">شروع رایگان</Link>
            </Button>
            <Button variant="ghost" size="lg">
              <Link href="/dashboard/questions">نمونه سوال</Link>
            </Button>
          </div>
        </Reveal>

        {/* تصویر کاراکتر — بدون قاب، بدون پس‌زمینه متفاوت */}
        <Reveal delay={150} className="flex-shrink-0 w-80 lg:w-[30rem]">
          <Image
            src="/svg/student-character.svg"
            alt="کاراکتر درسخون مرورک"
            width={640}
            height={640}
            priority
            className="w-full h-auto select-none pointer-events-none
                       drop-shadow-[0_18px_30px_rgba(30,89,241,0.18)]
                       animate-[float_5s_ease-in-out_infinite]"
          />
        </Reveal>

      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="px-6 lg:px-12 py-16 bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto">

        <Reveal>
          <h2 className="text-xl font-bold text-center mb-10 text-text">
            چرا مرورک؟
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={i * 120}>
                <div className="p-6 rounded-lg border border-border bg-background h-full">
                  {/* آیکون */}
                  <div className={`w-10 h-10 ${feature.color} rounded-lg
                                  flex items-center justify-center mb-4`}>
                    <Icon size={20} strokeWidth={2.2} />
                  </div>

                  <h3 className="text-base font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CoursesSection() {
  return (
    <section className="px-6 lg:px-12 py-16">
      <div className="max-w-6xl mx-auto">

        <Reveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold">دروس محبوب</h2>
            <Link href="/dashboard/notes"
              className="text-sm text-primary font-semibold hover:opacity-80">
              مشاهده همه ←
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularSubjects.map(({ subject, icon: Icon, count }, i) => (
            <Reveal key={subject} delay={i * 100}>
              <Link
                href={`/dashboard/notes?subject=${subject}`}
                className="flex items-center gap-3 p-4 bg-surface border border-border
                           rounded-md hover:border-primary/30 hover:shadow-hover
                           transition-all duration-150 group"
              >
                <div className="w-9 h-9 bg-primary/8 rounded-lg flex items-center
                                justify-center text-primary flex-shrink-0">
                  <Icon size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div className="text-sm font-semibold group-hover:text-primary
                                  transition-colors">
                    {SUBJECT_LABELS[subject]}
                  </div>
                  <div className="text-xs text-text-muted">{count} سوال</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function SampleQuestion() {
  return (
    <section className="px-6 lg:px-12 py-16 bg-surface border-y border-border">
      <div className="max-w-2xl mx-auto">

        <Reveal>
          <h2 className="text-xl font-bold text-center mb-8">یه سوال نمونه ببین</h2>
        </Reveal>

        <Reveal delay={100}>
          <div className="border border-border rounded-lg p-6 bg-background">
            <Badge variant="primary" className="mb-4">الگوریتم · متوسط</Badge>

            <p className="text-base font-semibold mb-5 leading-relaxed">
              پیچیدگی زمانی الگوریتم BFS روی گرافی با V راس و E یال چقدر است؟
            </p>

            <div className="flex flex-col gap-2.5">
              {["O(V²)", "O(V + E)", "O(E log V)", "O(V log E)"].map(
                (option, i) => {
                  const letters = ["الف", "ب", "ج", "د"];
                  const isCorrect = i === 1;
                  return (
                    <div
                      key={option}
                      className={`flex items-center gap-3 p-3 rounded-md border
                        ${isCorrect
                          ? "border-success bg-green-50"
                          : "border-border bg-surface"
                        }`}
                    >
                      <span className={`w-6 h-6 rounded flex items-center justify-center
                                      text-xs font-bold flex-shrink-0
                                      ${isCorrect ? "bg-success text-white" : "border border-border text-text-muted"}`}>
                        {letters[i]}
                      </span>
                      <span className="text-sm">{option}</span>
                      {isCorrect && (
                        <span className="mr-auto text-xs text-success font-semibold">
                          ✓ درست
                        </span>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="text-center mt-8">
            <Button variant="primary" size="lg">
              <Link href="/signup">شروع با سوالات بیشتر</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 lg:px-12 py-20">
      <Reveal className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-extrabold mb-3">
          آماده‌ای امتحانت رو با اعتماد بدی؟
        </h2>
        <p className="text-text-secondary mb-8">
          بیش از ۵۰۰ سوال تشریحی در دروس مختلف مهندسی کامپیوتر منتظرته.
        </p>
        <Button variant="primary" size="lg">
          <Link href="/signup">ثبت نام رایگان — همین الان</Link>
        </Button>
      </Reveal>
    </section>
  );
}

function AuthenticatedHome({ user, onLogout }: { user: any; onLogout: () => void }) {
  const firstName = String(user?.name || "دانشجو").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-surface/80 backdrop-blur-md border-b border-border sticky top-0 z-50 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="text-base font-bold text-primary">مرورک</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-text-secondary hover:text-primary transition-colors">داشبورد</Link>
            <Link href="/dashboard/exams" className="text-sm text-text-secondary hover:text-primary transition-colors">آزمون‌ها</Link>
            <Link href="/dashboard/notes" className="text-sm text-text-secondary hover:text-primary transition-colors">جزوات</Link>
            <Link href="/dashboard/questions" className="text-sm text-text-secondary hover:text-primary transition-colors">سوالات</Link>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-text-secondary max-w-32 truncate">{user?.name || user?.email}</span>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={15} />
              خروج
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="px-6 lg:px-12 py-16 lg:py-20">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-2xl border border-border bg-surface p-7 lg:p-10 shadow-card">
              <Badge variant="primary" className="mb-4">فضای یادگیری شخصی شما</Badge>
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
                <div className="max-w-2xl">
                  <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight mb-4">
                    خوش برگشتی، {firstName}
                  </h1>
                  <p className="text-sm lg:text-base text-text-secondary leading-8">
                    اینجا نقطه شروع مرور امروزته. به‌جای جست‌وجوی پراکنده، مستقیم وارد تمرین، آزمون یا جزوه‌ای شو که می‌خواهی روی آن کار کنی.
                  </p>
                </div>
                <Link href="/dashboard/exams" className="inline-flex items-center justify-center gap-2 bg-primary text-white rounded-xl px-5 py-3 text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
                  شروع یک آزمون
                  <ArrowLeft size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 pb-16">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-bold mb-6">ادامه یادگیری</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Link href="/dashboard/exams" className="group rounded-xl border border-border bg-surface p-6 hover:border-primary/30 hover:shadow-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4"><ClipboardCheck size={20} /></div>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">آزمون‌ها</h3>
                <p className="text-xs text-text-secondary leading-6">آزمون تمرینی یا زمان‌دار انتخاب کن و نتیجه‌ات را ثبت کن.</p>
              </Link>
              <Link href="/dashboard/notes" className="group rounded-xl border border-border bg-surface p-6 hover:border-primary/30 hover:shadow-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center mb-4"><FileText size={20} /></div>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">جزوات</h3>
                <p className="text-xs text-text-secondary leading-6">مطالب را مرور کن و موارد مهم را برای دسترسی سریع ذخیره کن.</p>
              </Link>
              <Link href="/dashboard/questions" className="group rounded-xl border border-border bg-surface p-6 hover:border-primary/30 hover:shadow-hover transition-all">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4"><Brain size={20} /></div>
                <h3 className="font-bold mb-2 group-hover:text-primary transition-colors">سوالات</h3>
                <p className="text-xs text-text-secondary leading-6">با Active Recall نقاط ضعف خودت را پیدا کن و پاسخ تشریحی را ببین.</p>
              </Link>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 py-16 bg-surface border-y border-border">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-xl font-bold mb-3">مرور مؤثر، نه مرور بیشتر</h2>
            <p className="text-sm text-text-secondary leading-7">
              ابتدا مفهوم را از جزوه مرور کن، بعد بدون نگاه‌کردن پاسخ بده، و در پایان پاسخ تشریحی را بررسی کن. نتیجه آزمون‌ها هم برای سنجش پیشرفتت ثبت می‌شود.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("access_token")) {
      setCheckedAuth(true);
      return;
    }
    api.auth.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("access_token"))
      .finally(() => setCheckedAuth(true));
  }, []);

  if (!checkedAuth) {
    return <div className="min-h-screen bg-background" />;
  }

  if (user) {
    return <AuthenticatedHome user={user} onLogout={() => { api.auth.logout(); setUser(null); }} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <CoursesSection />
      <SampleQuestion />
      <CTASection />
    </div>
  );
}
