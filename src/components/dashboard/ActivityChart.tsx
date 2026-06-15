"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { day: "شن", minutes: 0 },
  { day: "یک", minutes: 25 },
  { day: "دو", minutes: 45 },
  { day: "سه", minutes: 20 },
  { day: "چه", minutes: 60 },
  { day: "پن", minutes: 35 },
  { day: "جم", minutes: 50 },
];

export default function ActivityChart() {
  return (
    <div className="bg-surface border border-border rounded-md p-4 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold">فعالیت هفته</h2>
        <span className="text-xs text-text-muted">دقیقه مطالعه</span>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce8fd" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#999" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: "#fff",
              border: "1px solid #dce8fd",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value) => [`${value} دقیقه`, "مطالعه"]}
          />
          <Line
            type="monotone"
            dataKey="minutes"
            stroke="#1e59f1"
            strokeWidth={2}
            dot={{ fill: "#1e59f1", r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}