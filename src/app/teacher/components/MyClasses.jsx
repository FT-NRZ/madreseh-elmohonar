import React, { useEffect, useState } from 'react';

export default function MyClasses({ teacherId }) {
  const [classes, setClasses] = useState([]);
  const [specialClasses, setSpecialClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!teacherId) {
      setLoading(false);
      setError('اطلاعات معلم در دسترس نیست');
      return;
    }

    // واکشی کلاس‌های معمولی و دانش‌آموزان پایه معلم
    const fetchClassesAndStudents = async () => {
      try {
        setLoading(true);
        // دریافت کلاس‌ها
        const res = await fetch(`/api/teacher/${teacherId}/classes`);
        if (!res.ok) throw new Error('خطای دریافت داده');
        const data = await res.json();
        if (data.success) {
          setClasses(data.classes || []);
        } else {
          setError(data.message || 'خطا در دریافت کلاس‌ها');
        }

        // دریافت دانش‌آموزان پایه‌های معلم
        if (data.classes && data.classes.length > 0) {
          // استخراج grade_name ها
          const gradeNames = data.classes.map(cls => cls.grade_name).filter(Boolean);
          // واکشی دانش‌آموزان هر پایه
          const studentsRes = await fetch('/api/users/list?role=students');
          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            if (studentsData.success && studentsData.users) {
              // فقط دانش‌آموزان پایه‌های معلم را نگه دار
              const filtered = studentsData.users.filter(stu =>
                gradeNames.includes(stu.grade_name)
              );
              setStudents(filtered);
            }
          }
        }
      } catch (err) {
        setError('خطا در اتصال به سرور');
      } finally {
        setLoading(false);
      }
    };

    // واکشی کلاس‌های فوق‌العاده
    const fetchSpecialClasses = async () => {
      try {
        const res = await fetch(`/api/special-classes?teacher_id=${teacherId}`);
        if (!res.ok) throw new Error('خطای دریافت داده');
        const data = await res.json();
        if (data.success) {
          setSpecialClasses(data.items || []);
        }
      } catch (err) {
        // خطای کلاس‌های ویژه نباید مانع نمایش کلاس‌های عادی شود
      }
    };

    fetchClassesAndStudents();
    fetchSpecialClasses();
  }, [teacherId]);

  if (loading) return <div>در حال دریافت کلاس‌ها...</div>;
  
  if (error) {
    return <div className="bg-red-50 p-4 rounded-lg text-red-700">{error}</div>;
  }
  
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
      {/* نمایش دانش‌آموزان پایه معلم */}
      {students.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-bold text-green-700 mb-2">دانش‌آموزان پایه‌های شما</h4>
          <ul className="space-y-2">
            {students.map(stu => (
              <li key={stu.id} className="bg-green-50 rounded p-2 flex flex-col">
                <span className="font-bold text-green-800">{stu.name}</span>
                <span className="text-xs text-gray-600">{stu.grade_name}</span>
                <span className="text-xs text-gray-400">{stu.class_name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatTime(timeString) {
  if (!timeString) return '--:--';
  const timePart = timeString.split('T')[1] || timeString;
  const [hours, minutes] = timePart.split(':');
  return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}