'use client';

import React, { useEffect, useState } from 'react';
import { 
  CalendarDays, Clock, BookOpen, Users, GraduationCap, 
  Sparkles, Coffee, AlertCircle, RefreshCw
} from 'lucide-react';

export default function TeacherSchedulePage() {
  const [teacherId, setTeacherId] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [specialClasses, setSpecialClasses] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // بررسی احراز هویت و دریافت اطلاعات معلم
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        if (userObj.role !== 'teacher') {
          window.location.href = '/';
          return;
        }
        setTeacher(userObj);
        setTeacherId(userObj.id);
        
        // شروع دریافت داده‌ها
        fetchInitialData(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    if (teacherId) {
      fetchSchedule();
    }
  }, [selectedGrade, teacherId]);

  const fetchInitialData = async (teacherId) => {
    try {
      setLoading(true);
      setError(null);
      
      // دریافت پایه‌ها
      await fetchGrades();
      
      // دریافت کلاس‌های فوق‌العاده معلم
      if (teacherId) {
        const specialRes = await fetch(`/api/special-classes?teacher_id=${teacherId}`);
        if (specialRes.ok) {
          const specialData = await specialRes.json();
          if (specialData.success) {
            setSpecialClasses(specialData.items || []);
          }
        }
      }
      
      // دریافت برنامه هفتگی
      await fetchSchedule();
      
    } catch (err) {
      console.error('خطا در دریافت داده‌های اولیه:', err);
      setError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

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
      console.error('خطا در دریافت پایه‌ها:', error);
      setGrades([]);
    }
  };

  // دریافت برنامه هفتگی بر اساس پایه
  const fetchSchedule = async () => {
    if (!teacherId) return;
    
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
      console.error('خطا در دریافت برنامه:', error);
      setSchedule([]);
      setMessage('خطا در ارتباط با سرور');
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const timePart = timeString.split('T')[1] || timeString;
    const [hours, minutes] = timePart.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال دریافت برنامه هفتگی...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header خطا */}
        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">خطا در بارگذاری</h1>
                <p className="text-red-100 text-xs md:text-base">{error}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <button
            onClick={() => {
              setError(null);
              if (teacherId) fetchInitialData(teacherId);
            }}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
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
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <CalendarDays className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                {getGreeting()}، برنامه هفتگی شما 📅
              </h1>
              <p className="text-green-100 text-xs md:text-base">
                {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'} - مشاهده برنامه کلاس‌ها
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <CalendarDays className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{schedule.length}</p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">جلسه عادی</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Users className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{grades.length}</p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">پایه تحصیلی</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">
              {Object.keys(groupedSchedule).length + 
               [...new Set(specialClasses.map(c => c.day_of_week))].length}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">روز فعال</p>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          برنامه هفتگی مدرسه
        </h3>

        {/* فیلتر پایه تحصیلی */}
        <div className="mb-4 md:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 inline ml-1" />
            انتخاب پایه تحصیلی ({grades.length} پایه موجود)
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm md:text-base"
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
            <p className="text-gray-500 mb-2">{message || 'برنامه هفتگی یافت نشد'}</p>
            <p className="text-sm text-gray-400">
              ممکن است برای این پایه برنامه‌ای تنظیم نشده باشد.
            </p>
            <button
              onClick={() => fetchSchedule()}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {daysOrder.map((dayKey) => {
              const daySchedule = groupedSchedule[dayKey] || [];
              const specialDay = specialClasses.filter(cls => cls.day_of_week === dayKey);

              if (daySchedule.length === 0 && specialDay.length === 0) return null;

              return (
                <div key={dayKey} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {dayNames[dayKey]}
                      <span className="bg-green-200 px-2 py-1 rounded-full text-xs">
                        {daySchedule.length + specialDay.length} جلسه
                      </span>
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* کلاس‌های معمولی */}
                    {daySchedule.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 md:gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 text-sm md:text-base truncate">{item.subject}</h5>
                          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{item.time || `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{item.className || item.classes?.class_name || 'کلاس'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* کلاس‌های فوق‌العاده */}
                    {specialDay.map(cls => (
                      <div key={cls.id} className="flex items-center gap-3 md:gap-4 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-green-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-green-800 text-sm md:text-base truncate">{cls.title}</h5>
                          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-green-700 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{cls.class_name || 'کلاس فوق‌العاده'}</span>
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