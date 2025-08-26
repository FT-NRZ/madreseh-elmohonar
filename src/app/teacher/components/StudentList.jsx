import React, { useEffect, useState } from 'react';

export default function StudentsList({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teacher/${teacherId}/students`)
      .then(res => res.json())
      .then(data => {
        setStudents(data.students || []);
        setLoading(false);
      });
  }, [teacherId]);

  if (loading) return <div>در حال دریافت دانش‌آموزان...</div>;
  if (students.length === 0) return <div>دانش‌آموزی برای شما ثبت نشده است.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">دانش‌آموزان کلاس‌های من</h3>
      <ul className="space-y-3">
        {students.map(stu => (
          <li key={stu.id} className="border-b pb-2 flex justify-between items-center">
            <span className="font-bold text-green-700">{stu.full_name}</span>
            <span className="text-xs text-gray-500">{stu.class_name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}