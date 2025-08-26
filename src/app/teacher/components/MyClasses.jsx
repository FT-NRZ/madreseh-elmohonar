import React, { useEffect, useState } from 'react';

export default function MyClasses({ teacherId }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) return;
    fetch(`/api/teacher/${teacherId}/classes`)
      .then(res => res.json())
      .then(data => {
        setClasses(data.classes || []);
        setLoading(false);
      });
  }, [teacherId]);

  if (loading) return <div>در حال دریافت کلاس‌ها...</div>;
  if (classes.length === 0) return <div>کلاسی برای شما ثبت نشده است.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">کلاس‌های من</h3>
      <ul className="space-y-3">
        {classes.map(cls => (
          <li key={cls.id} className="border-b pb-2 flex justify-between items-center">
            <span className="font-bold text-green-700">{cls.class_name}</span>
            <span className="text-xs text-gray-500">{cls.grade}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}