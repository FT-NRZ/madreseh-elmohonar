'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Users, GraduationCap } from 'lucide-react';

export default function WeeklySchedule({ teacherId }) {
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [specialClasses, setSpecialClasses] = useState([]);

  useEffect(() => {
    fetchGrades();
    fetchSchedule();
    // واکشی کلاس‌های فوق‌العاده معلم
    if (teacherId) {
      fetch(`/api/special-classes?teacher_id=${teacherId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) setSpecialClasses(data.items || []);
        });
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [selectedGrade]);

  // دریافت پایه‌ها
  const fetchGrades = async () => {
    try {
      const res = await fetch('/api/grades');
      const data = await res.json();
      if (data.success && data.grades) {
        setGrades(data.grades);
      } else {
        setGrades([]);
      }
    } catch (error) {
      setGrades([]);
    }
  };

  // دریافت برنامه هفتگی بر اساس پایه
  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const url = selectedGrade === 'all'
        ? '/api/schedule/all'
        : `/api/schedule/all?gradeId=${selectedGrade}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSchedule(data.schedules || []);
        setMessage(data.message || '');
      } else {
        setSchedule([]);
        setMessage(data.message || 'برنامه هفتگی یافت نشد');
      }
    } catch (error) {
      setSchedule([]);
      setMessage('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  function formatTime(timeString) {
    if (!timeString) return '--:--';
    const timePart = timeString.split('T')[1] || timeString;
    const [hours, minutes] = timePart.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const groupedSchedule = schedule.reduce((acc, item) => {
    const dayKey = item.dayKey || item.day_of_week;
    if (!acc[dayKey]) {
      acc[dayKey] = [];
    }
    acc[dayKey].push(item);
    return acc;
  }, {});

  const daysOrder = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-green-600" />
          برنامه هفتگی مدرسه
        </h3>

        {/* فیلتر پایه تحصیلی */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 inline ml-1" />
            انتخاب پایه تحصیلی ({grades.length} پایه موجود)
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">همه پایه‌ها</option>
            {grades.map((grade) => (
              <option key={grade.id} value={grade.id}>
                {grade.grade_name}
              </option>
            ))}
          </select>
        </div>

        {schedule.length === 0 && specialClasses.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{message || 'برنامه هفتگی یافت نشد'}</p>
            <p className="text-sm text-gray-400 mt-2">
              ممکن است برای این پایه برنامه‌ای تنظیم نشده باشد.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {daysOrder.map((dayKey) => {
              const daySchedule = groupedSchedule[dayKey] || [];
              const specialDay = specialClasses.filter(cls => cls.day_of_week === dayKey);

              if (daySchedule.length === 0 && specialDay.length === 0) return null;

              return (
                <div key={dayKey} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {dayNames[dayKey]}
                      <span className="bg-green-200 px-2 py-1 rounded text-xs">
                        {daySchedule.length + specialDay.length} جلسه
                      </span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* کلاس‌های معمولی */}
                    {daySchedule.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.subject}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.time || `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{item.className || item.classes?.class_name || 'کلاس'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* کلاس‌های فوق‌العاده */}
                    {specialDay.map(cls => (
                      <div key={cls.id} className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-yellow-700" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-yellow-800">{cls.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-yellow-700 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{cls.class_name || 'کلاس فوق‌العاده'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}