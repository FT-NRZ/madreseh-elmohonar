'use client'
import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function ExamsList({ studentId }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  // دریافت کلاس‌ها از API
  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        const data = await res.json();
        if (data.success) setClasses(data.classes);
        else setClasses([]);
      } catch (err) {
        console.error('💥 Error fetching classes:', err);
        setClasses([]);
      }
    }
    fetchClasses();
  }, []);

  // دریافت آزمون‌ها بر اساس کلاس انتخاب‌شده
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    async function fetchExams() {
      try {
        const res = await fetch(`/api/exams/all?class_id=${selectedClassId}`);
        const data = await res.json();
        setExams(data.exams || []);
      } catch {
        setExams([]);
      }
      setLoading(false);
    }
    fetchExams();
  }, [selectedClassId]);

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
        <ClipboardList className="w-6 h-6" />
        آزمون‌های من
      </h2>
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">پایه (کلاس) خود را انتخاب کنید:</label>
        <select
          className="w-full border border-gray-300 rounded-lg p-2"
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
        >
          <option value="">انتخاب پایه...</option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.class_name} {cls.grades ? `(${cls.grades.grade_name})` : ""}
            </option>
          ))}
        </select>
      </div>
      {loading && <p className="text-center text-green-600">در حال دریافت آزمون‌ها...</p>}
      {!loading && selectedClassId && (
        exams.length === 0 ? (
          <p className="text-center text-red-600">آزمونی برای این پایه ثبت نشده است.</p>
        ) : (
          <ul className="space-y-4">
            {exams.map(exam => (
              <li key={exam.id} className="border border-gray-300 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-gray-800">{exam.title}</h3>
                  <p className="text-sm text-gray-600">{exam.type === 'pdf' ? 'PDF' : exam.type === 'image' ? 'تصویری' : 'تستی'}</p>
                </div>
                <Link
                  href={`/student/exams/${exam.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg"
                >
                  شرکت در آزمون
                </Link>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  );
}