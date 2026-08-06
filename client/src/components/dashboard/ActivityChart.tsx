"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface ActivityItem {
  day: string;
  questions: number;         // تعداد سوالات
  study_minutes: number;   // زمان مطالعه به دقیقه
}

interface ActivityChartProps {
  data?: ActivityItem[];
}

export default function ActivityChart({ data }: ActivityChartProps) {
  const [showMinutes, setShowMinutes] = useState(true);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showAverage, setShowAverage] = useState(true);

  const rawData = data && data.length > 0 ? data : [
    { day: "شنبه", questions: 0, study_minutes: 0 },
    { day: "یک‌شنبه", questions: 0, study_minutes: 0 },
    { day: "دوشنبه", questions: 0, study_minutes: 0 },
    { day: "سه‌شنبه", questions: 0, study_minutes: 0 },
    { day: "چهارشنبه", questions: 0, study_minutes: 0 },
    { day: "پنج‌شنبه", questions: 0, study_minutes: 0 },
    { day: "جمعه", questions: 0, study_minutes: 0 },
  ];

  // محاسبه امتیاز دقیق: هر 5 دقیقه مطالعه = 1 امتیاز، هر 10 سوال = 1 امتیاز
  const chartData = rawData.map(item => {
    const mins = Number(item.study_minutes) || 0;
    const quests = Number(item.questions) || 0;
    
    const studyScore = mins / 5;
    const questionScore = quests / 10;
    const totalScore = Math.round(studyScore + questionScore);

    return {
      day: item.day,
      study_minutes: mins,
      questions: quests,
      average: totalScore, // امتیاز کل تلاش روزانه
      isExcellent: totalScore >= 100, // بررسی اینکه آیا به ۱۰۰ امتیاز رسیده یا خیر
    };
  });

  return (
    <div className="bg-surface border border-border rounded-md p-6 mb-5 shadow-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div>
          <h2 className="text-sm font-bold text-text">فعالیت هفته</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs select-none">
          <button
            type="button"
            onClick={() => setShowMinutes(!showMinutes)}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer bg-transparent border-none p-0 ${
              showMinutes ? "opacity-100 font-bold text-text" : "opacity-40 text-text-3"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block"></span>
            <span>زمان مطالعه</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuestions(!showQuestions)}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer bg-transparent border-none p-0 ${
              showQuestions ? "opacity-100 font-bold text-text" : "opacity-40 text-text-3"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-danger inline-block"></span>
            <span>تعداد سوالات</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAverage(!showAverage)}
            className={`flex items-center gap-1.5 transition-opacity cursor-pointer bg-transparent border-none p-0 ${
              showAverage ? "opacity-100 font-bold text-text" : "opacity-40 text-text-3"
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block"></span>
            <span>امتیاز تلاش روزانه</span>
          </button>
        </div>
      </div>

      <div className="px-2 pt-2 pb-1">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dce8fd" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#999999" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md" style={{ direction: "rtl" }}>
                      <p className="font-bold text-text mb-1">{data.day}</p>
                      <p className="text-primary">زمان مطالعه: {data.study_minutes} دقیقه</p>
                      <p className="text-danger">تعداد سوالات: {data.questions} عدد</p>
                      <hr className="my-1.5 border-border" />
                      <p className="text-secondary font-bold">امتیاز کل تلاش: {data.average} امتیاز</p>
                      {data.isExcellent && (
                        <p className="text-success font-bold mt-1.5 bg-success/10 p-1 rounded text-center">
                          🎉 فوق‌العاده‌ای! کسب ۱۰۰ امتیاز یا بیشتر رو بهت تبریک میگم! 🚀
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            {showMinutes && (
              <Line
                type="monotone"
                dataKey="study_minutes"
                stroke="#1e59f1"
                strokeWidth={2}
                dot={{ fill: "#1e59f1", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
            {showQuestions && (
              <Line
                type="monotone"
                dataKey="questions"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
            {showAverage && (
              <Line
                type="monotone"
                dataKey="average"
                stroke="#c182f7"
                strokeWidth={2}
                dot={{ fill: "#c182f7", r: 3 }}
                activeDot={{ r: 5 }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}