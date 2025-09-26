import React, { useEffect, useState } from "react";

export default function ReportCard({ studentId }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetch(`/api/student/report-card?student_id=${studentId}`)
      .then(res => res.json())
      .then(data => {
        setCards(data.cards || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [studentId]);

  if (loading) return <div>در حال بارگذاری کارنامه...</div>;
  if (!cards.length) return <div>کارنامه‌ای برای شما ثبت نشده است.</div>;

  return (
    <div>
      <h3 className="text-lg font-bold text-green-700 mb-4">کارنامه دانش‌آموز</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl shadow border border-green-200">
          <thead>
            <tr className="bg-green-100 text-green-700">
              <th className="py-2 px-4">سال تحصیلی</th>
              <th className="py-2 px-4">نیم‌سال</th>
              <th className="py-2 px-4">درس</th>
              <th className="py-2 px-4">ارزشیابی توصیفی</th>
              <th className="py-2 px-4">توضیح معلم</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 px-4">{card.academic_year}</td>
                <td className="py-2 px-4">{card.semester}</td>
                <td className="py-2 px-4">{card.subject}</td>
                <td className="py-2 px-4">{card.grade || "-"}</td>
                <td className="py-2 px-4">{card.teacher_feedback || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
