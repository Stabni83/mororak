"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function CreateQuestionPage() {
  const [subject, setSubject] = useState("algorithm");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("لطفا صورت سوال را وارد کنید.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.questions.create({
        text,
        subject,
      });

      setMessage("سوال با موفقیت ثبت شد!");
      setText("");
    } catch (err: any) {
      setMessage(err.message || "خطا در ثبت سوال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">ثبت سوال جدید</h2>

      {message && (
        <div className={`p-3 mb-4 rounded ${message.includes("موفقیت") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">انتخاب درس</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="algorithm">الگوریتم</option>
            <option value="os">سیستم عامل</option>
            <option value="database">پایگاه داده</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">صورت سوال</label>
          <textarea
            rows={5}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="متن سوال را اینجا وارد کنید..."
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? "در حال ذخیره‌سازی..." : "ذخیره سوال"}
        </button>
      </form>
    </div>
  );
}
