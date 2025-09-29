import React, { useEffect, useState } from 'react';

export default function MyClasses({ teacherId }) {
  const [classes, setClasses] = useState([]);
  const [specialClasses, setSpecialClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) {
      console.log('teacherId not provided');
      setLoading(false);
      return;
    }

    console.log('Fetching classes for teacherId:', teacherId);

    // واکشی کلاس‌های معمولی
    fetch(`/api/teacher/${teacherId}/classes`)
      .then(res => {
        console.log('Classes response status:', res.status);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Classes data:', data);
        setClasses(data.classes || []);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching classes:', error);
        setClasses([]);
        setLoading(false);
      });

    // واکشی کلاس‌های فوق‌العاده
    fetch(`/api/special-classes?teacher_id=${teacherId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Special classes data:', data);
        setSpecialClasses(data.items || []);
      })
      .catch(error => {
        console.error('Error fetching special classes:', error);
        setSpecialClasses([]);
      });
  }, [teacherId]);

  if (loading) return <div>در حال دریافت کلاس‌ها...</div>;
  if (classes.length === 0 && specialClasses.length === 0) {
    return <div>کلاسی برای شما ثبت نشده است.</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-900 mb-4">کلاس‌های من</h3>
      <ul className="space-y-3">
        {classes.map(cls => (
          <li key={cls.id} className="border-b pb-2 flex justify-between items-center">
            <span className="font-bold text-green-700">{cls.class_name}</span>
            <span className="text-xs text-gray-500">{cls.grade_name}</span>
          </li>
        ))}
        {specialClasses.length > 0 && (
          <li className="pt-4">
            <h4 className="text-lg font-bold text-yellow-700 mb-2">کلاس‌های فوق‌العاده</h4>
            <ul className="space-y-2">
              {specialClasses.map(cls => (
                <li key={cls.id} className="bg-yellow-50 rounded p-2 flex flex-col">
                  <span className="font-bold text-yellow-700">{cls.title}</span>
                  <span className="text-xs text-yellow-700">
                    {cls.day_of_week} | {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                  </span>
                  <span className="text-xs text-gray-600">{cls.class_name}</span>
                </li>
              ))}
            </ul>
          </li>
        )}
      </ul>
    </div>
  );
}

function formatTime(timeString) {
  if (!timeString) return '--:--';
  const timePart = timeString.split('T')[1] || timeString;
  const [hours, minutes] = timePart.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}