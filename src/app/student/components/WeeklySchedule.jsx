'use client'

import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, BookOpen, User, MapPin, AlertCircle, Star, Target, Sparkles } from 'lucide-react';

export default function WeeklySchedule({ studentId }) {
  const [schedule, setSchedule] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (studentId) {
      fetchStudentSchedule();
    }
  }, [studentId]);

  const fetchStudentSchedule = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('لطفاً دوباره وارد شوید');
        setLoading(false);
        return;
      }

      const res = await fetch(`/api/student/${studentId}/schedule`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }

      if (res.status === 403) {
        setError('دسترسی به این اطلاعات مجاز نیست');
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error(`خطای HTTP: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setSchedule(data.schedule || []);
        setClassName(data.className || '');
      } else {
        setError(data.message || 'خطا در دریافت برنامه هفتگی');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.dayKey]) {
      acc[item.dayKey] = [];
    }
    acc[item.dayKey].push(item);
    return acc;
  }, {});

  const daysOrder = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنج‌شنبه',
    'friday': 'جمعه'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 border border-gray-100">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-8 border border-red-200 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <p className="text-gray-700 mb-6 text-lg font-medium">{error}</p>
        <button
          onClick={fetchStudentSchedule}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!schedule.length) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 md:p-10 border border-gray-100 text-center">
        <CalendarDays className="w-16 h-16 md:w-20 md:h-20 text-gray-400 mx-auto mb-6" />
        <h4 className="text-xl md:text-2xl font-bold text-gray-700 mb-3">برنامه هفتگی تعریف نشده</h4>
        <p className="text-gray-500 text-lg">هنوز برنامه درسی برای کلاس شما ثبت نشده است</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-5">
      {/* هدر - ست با داشبورد */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">برنامه هفتگی</h2>
              {className && (
                <p className="text-green-100 text-xs md:text-base">
                  کلاس: {className}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* لیست روزها */}
      <div className="space-y-4">
        {daysOrder.map(dayKey => {
          const daySchedule = groupedSchedule[dayKey];
          if (!daySchedule || daySchedule.length === 0) return null;

          return (
            <div key={dayKey} className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {/* هدر روز */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-3 md:py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center gap-3 text-base md:text-lg">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>{dayNames[dayKey]}</span>
                  </h3>
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-semibold">
                    {daySchedule.length} جلسه
                  </span>
                </div>
              </div>

              {/* لیست کلاس‌ها */}
              <div className="p-3 md:p-4 space-y-2 md:space-y-3">
                {daySchedule.map((item, index) => (
                  <div 
                    key={item.id || index} 
                    className={`
                      group rounded-lg md:rounded-xl p-3 md:p-4 border transition-all duration-300 hover:shadow-md
                      ${item.isSpecial 
                        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 hover:border-yellow-400' 
                        : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:border-green-300'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      {/* شماره/آیکون */}
                      <div className={`
                        w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg
                        ${item.isSpecial 
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                        }
                      `}>
                        {item.isSpecial ? (
                          <Star className="w-5 h-5 md:w-6 md:h-6" />
                        ) : (
                          <span className="text-sm md:text-lg font-bold">{index + 1}</span>
                        )}
                      </div>

                      {/* محتوا */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-gray-800 text-sm md:text-lg flex items-center gap-2">
                            {item.subject}
                            {item.isSpecial && (
                              <span className="px-2 md:px-3 py-0.5 md:py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold border border-yellow-300">
                                ✨ فوق‌العاده
                              </span>
                            )}
                          </h4>
                        </div>
                        
                        {/* اطلاعات اضافی */}
                        <div className="flex items-center gap-3 md:gap-4 text-gray-600">
                          {item.time && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm font-medium">{item.time}</span>
                            </div>
                          )}
                          {item.teacher && item.teacher !== 'کلاس فوق‌العاده' && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm font-medium">{item.teacher}</span>
                            </div>
                          )}
                          {item.room && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm font-medium">{item.room}</span>
                            </div>
                          )}
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
    </div>
  );
}