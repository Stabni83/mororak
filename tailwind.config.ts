import type { Config } from "tailwindcss";

const config: Config = {
  // به Tailwind می‌گوییم کجا دنبال کلاس‌ها بگردد
  // این مهم است وگرنه فایل CSS نهایی خیلی بزرگ می‌شود
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      // رنگ‌های سفارشی پروژه
      // حالا می‌توانیم بنویسیم: bg-primary یا text-secondary
      colors: {
        background: "#ecf2fe", // پس‌زمینه کل صفحه
        surface: "#ffffff",    // پس‌زمینه کارت‌ها
        border: "#dce8fd",     // رنگ خطوط جداکننده

        primary: {
          DEFAULT: "#1e59f1",         // رنگ اصلی — دکمه‌ها و لینک‌ها
          light: "rgba(30,89,241,0.08)", // نسخه کم‌رنگ برای hover و badge
        },

        secondary: {
          DEFAULT: "#c182f7",         // رنگ ثانوی — تگ‌ها
          light: "rgba(193,130,247,0.1)",
        },

        accent: {
          DEFAULT: "#de4ef4",         // رنگ تأکیدی
          light: "rgba(222,78,244,0.1)",
        },

        // رنگ‌های متن
        text: {
          primary: "#000000",  // متن اصلی
          secondary: "#666666", // متن فرعی
          muted: "#999999",    // placeholder و راهنما
        },

        // رنگ‌های وضعیت
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
      },

      // فونت فارسی
      // حالا می‌توانیم بنویسیم: font-vazir
      fontFamily: {
        vazir: ["Vazirmatn", "Tahoma", "sans-serif"],
      },

      // شعاع گوشه‌های سفارشی
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },

      // سایه‌های حداقلی — طبق استایل مینیمال پروژه
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04)",
        hover: "0 4px 12px rgba(30,89,241,0.08)",
      },
    },
  },

  plugins: [],
};

export default config;