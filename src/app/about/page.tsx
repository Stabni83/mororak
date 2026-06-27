// صفحه درباره ما
"use client";

import Link from "next/link";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import { Target, Brain, BookOpen, Flag, Mail } from "lucide-react";

const aboutBlocks = [
  { icon: Target,    title: "هدف ما",            text: "یادگیری عمیق‌تر با روش‌های علمی به جای حفظ‌کردن مطالب" },
  { icon: Brain,     title: "Active Recall",     text: "ثابت‌شده‌ترین روش یادگیری در علوم اعصاب شناختی" },
  { icon: BookOpen,  title: "محتوای کیفی",       text: "سوالات، جزوات و پاسخ تشریحی برای دانشجویان مهندسی" },
  { icon: Flag,      title: "فارسی، برای ایران", text: "اولین پلتفرم Active Recall فارسی برای مهندسی کامپیوتر" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-xl mx-auto">

        {/* لوگو و عنوان */}
        <Reveal className="text-center mb-10">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center
                          justify-center text-white text-2xl font-extrabold
                          mx-auto mb-4">
            م
          </div>
          <h1 className="text-2xl font-extrabold mb-2">درباره مرورک</h1>
          <p className="text-sm text-text-secondary leading-relaxed">
            پلتفرم فارسی یادگیری مهندسی کامپیوتر بر پایه Active Recall
          </p>
        </Reveal>

        {/* بلوک‌های معرفی */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {aboutBlocks.map((block, i) => {
            const Icon = block.icon;
            return (
              <Reveal key={block.title} delay={i * 100}>
                <div className="bg-surface border border-border rounded-md p-4 h-full">
                  <div className="w-9 h-9 bg-primary/8 text-primary rounded-lg
                                  flex items-center justify-center mb-2">
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{block.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{block.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* تماس */}
        <Reveal delay={150}>
          <div className="bg-surface border border-border rounded-md p-4 flex
                          items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-primary/8 text-primary rounded-lg
                            flex items-center justify-center flex-shrink-0">
              <Mail size={18} strokeWidth={2.2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold mb-0.5">تماس با ما</p>
              <p className="text-xs text-text-secondary">سوال، پیشنهاد یا همکاری؟</p>
            </div>
            <a href="mailto:contact@moroorak.ir"
              className="text-xs text-primary font-semibold hover:opacity-80">
              contact@moroorak.ir
            </a>
          </div>
        </Reveal>

        {/* دکمه شروع */}
        <Reveal delay={250} className="text-center">
          <Button variant="primary" size="lg">
            <Link href="/signup">همین الان شروع کن</Link>
          </Button>
        </Reveal>

      </div>
    </div>
  );
}