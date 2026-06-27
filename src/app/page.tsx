// Landing Page — صفحه اصلی سایت
// این صفحه Server Component نبود چون انیمیشن اسکرول نیاز به "use client" دارد
"use client";

import Link from "next/link";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Reveal from "@/components/ui/Reveal";
import { SUBJECT_LABELS, type Subject } from "@/types";
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

// ─── داده‌های استاتیک ─────────────────────────
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

// ─── Navbar ───────────────────────────────────
function Navbar() {
  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-border
                    sticky top-0 z-50 px-6 lg:px-12">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14">

        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center
                          justify-center text-white text-sm font-bold">
            م
          </div>
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

// ─── Hero Section ─────────────────────────────
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

// ─── Features Section ─────────────────────────
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

// ─── Courses Section ──────────────────────────
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

// ─── نمونه سوال ───────────────────────────────
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

// ─── CTA Section ──────────────────────────────
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

// ─── صفحه اصلی ────────────────────────────────
export default function HomePage() {
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