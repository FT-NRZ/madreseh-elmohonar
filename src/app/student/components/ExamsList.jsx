'use client'
import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';

export default function ExamsList({ studentId }) {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function fetchExams() {
      try {
        const res = await fetch(`/api/student/${studentId}/exams`);
        const data = await res.json();
        setExams(data.exams || []);
      } catch {
        setExams([]);
      }
    }
    fetchExams();
  }, [studentId]);

  if (!exams.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        آزمون‌های من
      </h2>
      <ul className="space-y-2">
        {exams.map((exam, idx) => (
          <li key={idx} className="border-b last:border-b-0 py-2">
            <div className="font-bold text-gray-700">{exam.title}</div>
            <div className="text-xs text-gray-500">{exam.date} | {exam.teacher}</div>
            <div className="text-xs text-green-600">{exam.status === 'done' ? 'انجام شده' : 'در انتظار'}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}