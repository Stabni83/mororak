"use client";

/**
 * Simple study-time chart for the dashboard home: one bar per day, stacked by
 * subject (درس), so the user sees at a glance which day they studied how long
 * and what. Switch between the last 7 and 30 days.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { api } from "@/lib/api";
import { getSubjectHex } from "@/lib/utils";
import type { StudyStats } from "@/types";

const fa = (n: number) => n.toLocaleString("fa-IR");

function formatMinutes(totalMinutes: number): string {
  const rounded = Math.round(totalMinutes);
  if (rounded <= 0) return "۰ دقیقه";
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  if (h && m) return `${fa(h)} ساعت و ${fa(m)} دقیقه`;
  if (h) return `${fa(h)} ساعت`;
  return `${fa(m)} دقیقه`;
}

const weekdayFmt = new Intl.DateTimeFormat("fa-IR", { weekday: "short" });
const dayFmt = new Intl.DateTimeFormat("fa-IR", { day: "numeric" });
const fullFmt = new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" });

export default function StudyTimeChart() {
  const [range, setRange] = useState<7 | 30>(7);
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setError(false);
    api.users.getStudyStats(range)
      .then((data) => { if (active) setStats(data); })
      .catch(() => { if (active) setError(true); });
    return () => { active = false; };
  }, [range]);

  const subjects = stats?.subjects ?? [];
  const chartData = (stats?.days ?? []).map((day) => {
    const date = new Date(`${day.date}T12:00:00`);
    const row: Record<string, number | string> = {
      date: day.date,
      label: range === 7 ? weekdayFmt.format(date) : dayFmt.format(date),
      full: fullFmt.format(date),
      total: Math.round(day.total_seconds / 60),
    };
    for (const subject of subjects) row[subject.slug] = Math.round((day.subjects[subject.slug] || 0) / 60);
    return row;
  });

  const totalMinutes = Math.round((stats?.total_seconds ?? 0) / 60);
  const activeDays = stats?.active_days ?? 0;
  const bestDay = chartData.reduce<(typeof chartData)[number] | null>(
    (best, row) => (!best || (row.total as number) > (best.total as number) ? row : best),
    null
  );

  return (
    <div className="bg-surface border border-border rounded-md p-6 mb-5 shadow-card">
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-text">زمان مطالعه‌ی من</h2>
          <p className="text-xs text-text-muted mt-1">هر ستون یک روزه؛ رنگ‌ها نشون می‌دن چه درسی خوندی</p>
        </div>
        <div className="flex items-center gap-2">
          {([7, 30] as const).map((value) => (
            <button
              key={value}
              onClick={() => setRange(value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                range === value ? "bg-primary text-white" : "bg-background border border-border text-text-secondary hover:border-primary/40"
              }`}
            >
              {value === 7 ? "۷ روز اخیر" : "۳۰ روز اخیر"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <p className="text-xs text-danger text-center py-8">دریافت آمار مطالعه انجام نشد.</p>
      ) : !stats ? (
        <div className="h-48 bg-background/60 rounded-lg animate-pulse" />
      ) : totalMinutes === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm font-semibold mb-1">هنوز زمان مطالعه‌ای ثبت نشده</p>
          <p className="text-xs text-text-muted mb-3">یه فایل رو از کتابخانه یا یه جزوه رو باز کن؛ تایمر خودکار شروع می‌شه.</p>
          <Link href="/dashboard/library" className="text-xs font-semibold text-primary">رفتن به کتابخانه‌ی من ←</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-[11px] text-text-muted mb-1">مجموع</p>
              <p className="text-sm font-bold">{formatMinutes(totalMinutes)}</p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-[11px] text-text-muted mb-1">میانگین روزهای فعال</p>
              <p className="text-sm font-bold">{formatMinutes(activeDays ? totalMinutes / activeDays : 0)}</p>
            </div>
            <div className="rounded-lg bg-background border border-border p-3">
              <p className="text-[11px] text-text-muted mb-1">بهترین روز</p>
              <p className="text-sm font-bold">{bestDay ? formatMinutes(bestDay.total as number) : "-"}</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="label"
                reversed
                tick={{ fontSize: 11, fill: "#999999" }}
                axisLine={false}
                tickLine={false}
                interval={range === 30 ? 2 : 0}
              />
              <YAxis
                orientation="right"
                width={46}
                tick={{ fontSize: 11, fill: "#999999" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(m: number) => (m >= 60 ? `${fa(Math.round((m / 60) * 10) / 10)} س` : `${fa(m)} د`)}
              />
              <Tooltip
                cursor={{ fill: "rgba(0,0,0,0.04)" }}
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const row = payload[0].payload as Record<string, number | string>;
                  const items = subjects.filter((s) => (row[s.slug] as number) > 0);
                  return (
                    <div className="bg-white border border-border rounded-lg p-3 text-xs shadow-md" style={{ direction: "rtl" }}>
                      <p className="font-bold mb-1.5">{row.full}</p>
                      {items.length === 0 && <p className="text-text-muted">مطالعه‌ای ثبت نشده</p>}
                      {items.map((s) => (
                        <p key={s.slug} className="flex items-center gap-1.5 mb-0.5">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: getSubjectHex(s.slug) }} />
                          {s.name}: {formatMinutes(row[s.slug] as number)}
                        </p>
                      ))}
                      {items.length > 1 && (
                        <p className="font-bold mt-1.5 pt-1.5 border-t border-border">جمع: {formatMinutes(row.total as number)}</p>
                      )}
                    </div>
                  );
                }}
              />
              {subjects.map((s) => (
                <Bar key={s.slug} dataKey={s.slug} stackId="day" fill={getSubjectHex(s.slug)} radius={[2, 2, 0, 0]} maxBarSize={36} />
              ))}
            </BarChart>
          </ResponsiveContainer>

          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
            {subjects.map((s) => (
              <span key={s.slug} className="flex items-center gap-1.5 text-xs text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: getSubjectHex(s.slug) }} />
                {s.name} · {formatMinutes(s.total_seconds / 60)}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
