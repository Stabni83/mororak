// صفحه درباره ما — Server Component
import type { Metadata } from "next";
import Link from "next/link";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "درباره ما" };

const aboutBlocks = [
  { icon: "🎯", title: "هدف ما",           text: "یادگیری عمیق‌تر با روش‌های علمی به جای حفظ‌کردن مطالب" },
  { icon: "🧠", title: "Active Recall",    text: "ثابت‌شده‌ترین روش یادگیری در علوم اعصاب شناختی" },
  { icon: "📚", title: "محتوای کیفی",     text: "سوالات، جزوات و پاسخ تشریحی برای دانشجویان مهندسی" },
  { icon: "🇮🇷", title: "فارسی، برای ایران", text: "اولین پلتفرم Active Recall فارسی برای مهندسی کامپیوتر" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* لوگو و عنوان */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center
                          justify-center text-white text-2xl font-extrabold
                          mx-auto mb-4">
            م
          </div>
          <h1 className="text-2xl font-extrabold mb-2">درباره مرورک</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            پلتفرم فارسی یادگیری مهندسی کامپیوتر بر پایه Active Recall
          </p>
        </div>

        {/* بلوک‌های معرفی */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {aboutBlocks.map((block) => (
            <div key={block.title}
              className="bg-surface border border-border rounded-md p-4">
              <div className="text-xl mb-2">{block.icon}</div>
              <h3 className="text-sm font-bold mb-1">{block.title}</h3>
              <p className="text-xs text-text-secondary leading-relaxed">{block.text}</p>
            </div>
          ))}
        </div>

        {/* تماس */}
        <div className="bg-surface border border-border rounded-md p-4 flex
                        items-center gap-4 mb-6">
          <div className="text-2xl">✉️</div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-0.5">تماس با ما</p>
            <p className="text-xs text-text-secondary">سوال، پیشنهاد یا همکاری؟</p>
          </div>
          <a href="mailto:contact@moroorak.ir"
            className="text-xs text-primary font-semibold hover:opacity-80">
            contact@moroorak.ir
          </a>
        </div>

        {/* دکمه شروع */}
        <div className="text-center">
          <Button variant="primary" size="lg">
            <Link href="/signup">همین الان شروع کن</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}