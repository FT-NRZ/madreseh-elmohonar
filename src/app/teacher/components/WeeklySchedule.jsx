'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Users, GraduationCap } from 'lucide-react';

export default function WeeklySchedule({ teacherId }) {
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    fetchTeacherSchedule();
  }, [teacherId, selectedGrade]);

  const fetchGrades = async () => {
    try {
      const res = await fetch(`/api/teacher/schedule?teacherId=${teacherId}`);
      const data = await res.json();

      if (data.success) {
        setGrades(data.grades || []);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchTeacherSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/teacher/schedule?teacherId=${teacherId}&gradeId=${selectedGrade}`);
      const data = await res.json();

      if (data.success) {
        setSchedule(data.schedules || []);
        setMessage('');
      } else {
        setSchedule([]);
        setMessage(data.message || 'خطا در دریافت برنامه هفتگی');
      }
    } catch (error) {
      console.error('Error fetching teacher schedule:', error);
      setSchedule([]);
      setMessage('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
    if (!acc[item.day_of_week]) {
      acc[item.day_of_week] = [];
    }
    acc[item.day_of_week].push(item);
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
          برنامه هفتگی
        </h3>

        {/* فیلتر پایه تحصیلی */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 inline ml-1" />
            انتخاب پایه تحصیلی
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

        {schedule.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{message || 'برنامه هفتگی یافت نشد'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {daysOrder.map((dayKey) => {
              const daySchedule = groupedSchedule[dayKey];
              if (!daySchedule || daySchedule.length === 0) return null;

              return (
                <div key={dayKey} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {dayNames[dayKey]}
                      <span className="bg-green-200 px-2 py-1 rounded text-xs">
                        {daySchedule.length} جلسه
                      </span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
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
                              <span>{formatTime(item.start_time)} - {formatTime(item.end_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{item.classes.class_name}</span>
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