// Landing Page — صفحه اصلی سایت
// این صفحه Server Component است (بدون "use client")
// یعنی در سرور رندر می‌شود که برای SEO بهتر است

import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { SUBJECT_LABELS, type Subject } from "@/types";

// ─── داده‌های استاتیک ─────────────────────────
// این‌ها بعداً از API یا دیتابیس می‌آیند
// فعلاً hardcode کردیم

const features = [
  {
    icon: "🧠",
    title: "Active Recall",
    description: "با حل سوال یاد بگیر — روشی که علم اعصاب تأیید کرده",
    color: "bg-primary/8",
  },
  {
    icon: "📝",
    title: "پاسخ تشریحی",
    description: "هر سوال با توضیح کامل، کد نمونه، و مثال کاربردی",
    color: "bg-secondary/10",
  },
  {
    icon: "⚡",
    title: "مرور سریع",
    description: "دروس سازماندهی‌شده برای مرور هدفمند قبل از امتحان",
    color: "bg-accent/10",
  },
] as const;

const popularSubjects: { subject: Subject; icon: string; count: number }[] = [
  { subject: "algorithm",       icon: "⚙️", count: 48 },
  { subject: "data-structure",  icon: "🔢", count: 52 },
  { subject: "os",              icon: "🖥️", count: 34 },
  { subject: "network",         icon: "🌐", count: 28 },
];

// ─── Navbar ───────────────────────────────────
function Navbar() {
  return (
    // bg-surface/80 — کمی شفاف
    // backdrop-blur — blur پشت navbar
    // sticky top-0 — چسبیده به بالا هنگام اسکرول
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
          <Link href="/notes"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            جزوات
          </Link>
          <Link href="/questions"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            سوالات
          </Link>
          <Link href="/about"
            className="text-sm text-text-secondary hover:text-primary transition-colors">
            درباره ما
          </Link>
        </div>

        {/* دکمه‌های ورود و ثبت‌نام
            ─────────────────────────────────────
            مشکل قبلی: navbar سفید بود و دکمه primary هم سفید می‌شد
            راه‌حل: دکمه ورود را به variant="ghost" تغییر دادیم
            ghost = border آبی + متن آبی + بدون پس‌زمینه → همیشه روی هر رنگی دیده می‌شود
            ─────────────────────────────────────── */}
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
    <section className="px-6 lg:px-12 py-20 lg:py-28">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row
                      items-center gap-12">

        {/* متن Hero */}
        <div className="flex-1 text-center lg:text-right">

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
              <Link href="/questions">نمونه سوال</Link>
            </Button>
          </div>
        </div>

        {/* تصویر Illustration */}
        <div className="flex-shrink-0 w-72 h-64 lg:w-96 lg:h-80
                        bg-primary/6 border-2 border-dashed border-primary/20
                        rounded-2xl flex flex-col items-center justify-center gap-3">
          <div className="text-6xl">📚</div>
          <p className="text-sm text-text-muted font-medium">
            Illustration آموزشی
          </p>
          {/* یادداشت برای خودت: اینجا یک SVG یا تصویر واقعی می‌گذاری */}
        </div>

      </div>
    </section>
  );
}

// ─── Features Section ─────────────────────────
function FeaturesSection() {
  return (
    <section className="px-6 lg:px-12 py-16 bg-surface border-y border-border">
      <div className="max-w-6xl mx-auto">

        <h2 className="text-xl font-bold text-center mb-10 text-text">
          چرا مرورک؟
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border border-border bg-background"
            >
              {/* آیکون */}
              <div className={`w-10 h-10 ${feature.color} rounded-lg
                              flex items-center justify-center text-xl mb-4`}>
                {feature.icon}
              </div>

              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
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

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold">دروس محبوب</h2>
          <Link href="/notes"
            className="text-sm text-primary font-semibold hover:opacity-80">
            مشاهده همه ←
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularSubjects.map(({ subject, icon, count }) => (
            <Link
              key={subject}
              href={`/notes?subject=${subject}`}
              className="flex items-center gap-3 p-4 bg-surface border border-border
                         rounded-md hover:border-primary/30 hover:shadow-hover
                         transition-all duration-150 group"
            >
              <div className="w-9 h-9 bg-primary/8 rounded-lg flex items-center
                              justify-center text-lg flex-shrink-0">
                {icon}
              </div>
              <div>
                <div className="text-sm font-semibold group-hover:text-primary
                                transition-colors">
                  {SUBJECT_LABELS[subject]}
                </div>
                <div className="text-xs text-text-muted">{count} سوال</div>
              </div>
            </Link>
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

        <h2 className="text-xl font-bold text-center mb-8">یه سوال نمونه ببین</h2>

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

        <div className="text-center mt-8">
          <Button variant="primary" size="lg">
            <Link href="/signup">شروع با سوالات بیشتر</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ──────────────────────────────
function CTASection() {
  return (
    <section className="px-6 lg:px-12 py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-extrabold mb-3">
          آماده‌ای امتحانت رو با اعتماد بدی؟
        </h2>
        <p className="text-text-secondary mb-8">
          بیش از ۵۰۰ سوال تشریحی در دروس مختلف مهندسی کامپیوتر منتظرته.
        </p>
        <Button variant="primary" size="lg">
          <Link href="/signup">ثبت نام رایگان — همین الان</Link>
        </Button>
      </div>
    </section>
  );
}

// ─── صفحه اصلی ────────────────────────────────
// همه بخش‌ها را کنار هم می‌گذاریم
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