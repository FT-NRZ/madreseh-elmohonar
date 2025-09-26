'use client'
import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function ExamsList({ studentId }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // دریافت کلاس‌ها از API
  useEffect(() => {
    async function fetchClasses() {
      try {
        // 🔥 اضافه کردن توکن احراز هویت
        const token = localStorage.getItem('token');
        if (!token) {
          setError('لطفاً وارد سیستم شوید');
          return;
        }

        const res = await fetch('/api/classes', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ ارسال توکن
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('جلسه شما منقضی شده. لطفاً مجدداً وارد شوید');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          throw new Error('خطا در دریافت کلاس‌ها');
        }

        const data = await res.json();
        if (data.success) {
          setClasses(data.classes);
        } else {
          setClasses([]);
          setError(data.error || 'خطا در دریافت کلاس‌ها');
        }
      } catch (err) {
        console.error('💥 Error fetching classes:', err);
        setClasses([]);
        setError('خطا در ارتباط با سرور');
      }
    }
    fetchClasses();
  }, []);

  // دریافت آزمون‌ها بر اساس کلاس انتخاب‌شده
  useEffect(() => {
    if (!selectedClassId) return;
    setLoading(true);
    setError('');
    
    async function fetchExams() {
      try {
        // 🔥 اضافه کردن توکن احراز هویت
        const token = localStorage.getItem('token');
        if (!token) {
          setError('لطفاً وارد سیستم شوید');
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/exams/all?class_id=${selectedClassId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // ✅ ارسال توکن
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('جلسه شما منقضی شده. لطفاً مجدداً وارد شوید');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          throw new Error('خطا در دریافت آزمون‌ها');
        }

        const data = await res.json();
        if (data.success) {
          setExams(data.exams || []);
        } else {
          setExams([]);
          setError(data.error || 'خطا در دریافت آزمون‌ها');
        }
      } catch (err) {
        console.error('💥 Error fetching exams:', err);
        setExams([]);
        setError('خطا در ارتباط با سرور');
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

      {/* نمایش خطا */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-700">
            <p>{error}</p>
            {error.includes('جلسه') && (
              <button 
                onClick={() => window.location.href = '/login'}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                ورود مجدد
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          پایه (کلاس) خود را انتخاب کنید:
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
          value={selectedClassId}
          onChange={e => setSelectedClassId(e.target.value)}
          disabled={classes.length === 0}
        >
          <option value="">
            {classes.length === 0 ? 'در حال بارگذاری...' : 'انتخاب پایه...'}
          </option>
          {classes.map(cls => (
            <option key={cls.id} value={cls.id}>
              {cls.class_name} {cls.grades ? `(${cls.grades.grade_name})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-green-600">در حال دریافت آزمون‌ها...</p>
        </div>
      )}

      {/* Exams List */}
      {!loading && selectedClassId && !error && (
        exams.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="text-gray-500 mb-2">📝</div>
            <p className="text-gray-600">آزمونی برای این پایه ثبت نشده است.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              {exams.length} آزمون یافت شد
            </p>
            <ul className="space-y-4">
              {exams.map(exam => (
                <li key={exam.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 mb-1">{exam.title}</h3>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          📝 {exam.type === 'pdf' ? 'PDF' : exam.type === 'image' ? 'تصویری' : 'تستی'}
                        </span>
                        {exam.duration_minutes && (
                          <span className="flex items-center gap-1">
                            ⏱️ {exam.duration_minutes} دقیقه
                          </span>
                        )}
                        {exam.max_marks && (
                          <span className="flex items-center gap-1">
                            📊 {exam.max_marks} نمره
                          </span>
                        )}
                      </div>
                      {exam.description && (
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {exam.description}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/student/exams/${exam.id}`}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium inline-block text-center"
                      >
                        شرکت در آزمون
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}

      {/* No Class Selected */}
      {!selectedClassId && !loading && (
        <div className="text-center py-8 bg-blue-50 rounded-lg">
          <div className="text-blue-500 mb-2">🎯</div>
          <p className="text-blue-700">لطفاً ابتدا پایه (کلاس) خود را انتخاب کنید</p>
        </div>
      )}
    </div>
  );
}
