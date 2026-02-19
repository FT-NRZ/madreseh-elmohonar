'use client';

import React, { useEffect, useState } from 'react';
import { 
  GraduationCap, Users, BookOpen, Calendar, Clock, 
  MapPin, Star, AlertCircle, Sparkles, Crown,
  School, UserCheck, Award
} from 'lucide-react';

export default function TeacherClassesPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [classes, setClasses] = useState([]);
  const [specialClasses, setSpecialClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teacher, setTeacher] = useState(null);

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
        
        // فوراً شروع به دریافت داده‌ها کنیم
        fetchAllData(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

const fetchAllData = async (teacherId) => {
  if (!teacherId) {
    setLoading(false);
    setError('شناسه معلم در دسترس نیست');
    return;
  }

  try {
    setLoading(true);
    setError(null);

    console.log('🔍 شروع دریافت کلاس‌های معلم:', teacherId);

    // واکشی کلاس‌های معمولی
    const classesRes = await fetch(`/api/teacher/${teacherId}/classes`);
    console.log('📡 Status کلاس‌ها:', classesRes.status);
    
    if (classesRes.ok) {
      const classesData = await classesRes.json();
      console.log('📊 داده‌های کلاس:', classesData);
      
      if (classesData.success) {
        setClasses(classesData.classes || []);
        console.log('✅ کلاس‌ها تنظیم شد:', classesData.classes?.length);
        
        // دریافت دانش‌آموزان کلاس‌های معلم
        if (classesData.classes && classesData.classes.length > 0) {
          await fetchStudentsForClasses(classesData.classes);
        }
      } else {
        console.error('❌ خطا در دریافت کلاس‌ها:', classesData.message);
        setError(classesData.message || 'خطا در دریافت کلاس‌ها');
      }
    } else {
      const errorData = await classesRes.json().catch(() => ({}));
      console.error('❌ خطای HTTP در دریافت کلاس‌ها:', classesRes.status, errorData);
      setError(`خطای ${classesRes.status}: ${errorData.message || 'خطا در سرور'}`);
    }

    // واکشی کلاس‌های فوق‌العاده
    try {
      const specialRes = await fetch(`/api/special-classes?teacher_id=${teacherId}`);
      if (specialRes.ok) {
        const specialData = await specialRes.json();
        if (specialData.success) {
          setSpecialClasses(specialData.items || []);
          console.log('✅ کلاس‌های ویژه:', specialData.items?.length);
        }
      }
    } catch (specialError) {
      console.error('⚠️ خطا در دریافت کلاس‌های ویژه:', specialError);
      // این خطا فقط کلاس‌های ویژه را تحت تأثیر قرار می‌دهد
    }

  } catch (err) {
    console.error('💥 خطا در دریافت داده‌ها:', err);
    setError(`خطا در اتصال به سرور: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

const fetchStudentsForClasses = async (classes) => {
  try {
    const allStudents = [];
    
    for (const cls of classes) {
      const studentsRes = await fetch(`/api/teacher/classes/${cls.id}/students`);
      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        if (studentsData.students) {
          const studentsWithClass = studentsData.students.map(student => ({
            ...student,
            class_name: cls.class_name,
            grade_name: cls.grade_name,
            grade_level: cls.grade_level
          }));
          allStudents.push(...studentsWithClass);
        }
      }
    }
    
    setStudents(allStudents);
    console.log('✅ دانش‌آموزان تنظیم شد:', allStudents.length);
  } catch (error) {
    console.error('⚠️ خطا در دریافت دانش‌آموزان:', error);
  }
};

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    const timePart = timeString.split('T')[1] || timeString;
    const [hours, minutes] = timePart.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال دریافت کلاس‌ها...</p>
          {teacherId && <p className="text-xs text-gray-500 mt-2">شناسه معلم: {teacherId}</p>}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">خطا در بارگذاری</h1>
                <p className="text-red-100 text-xs md:text-base">{error}</p>
                {teacherId && <p className="text-red-200 text-xs mt-1">شناسه معلم: {teacherId}</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <button
            onClick={() => fetchAllData(teacherId)}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (classes.length === 0 && specialClasses.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">کلاس‌های من</h1>
                <p className="text-green-100 text-xs md:text-base">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'}
                </p>
                {teacherId && <p className="text-green-200 text-xs mt-1">شناسه: {teacherId}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-6 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">هیچ کلاسی یافت نشد</h3>
          <p className="text-gray-600">کلاسی برای شما ثبت نشده است.</p>
          <button
            onClick={() => fetchAllData(teacherId)}
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
          >
            بروزرسانی
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold mb-2">کلاس‌های من</h1>
              <p className="text-green-100 text-xs md:text-base">
                {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl md:rounded-2xl p-2 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <div className="w-7 h-7 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <School className="w-4 h-4 md:w-7 md:h-7 text-white" />
            </div>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-base md:text-4xl font-bold text-gray-800 mb-0.5 md:mb-2">{classes.length}</p>
            <p className="text-xs md:text-base text-gray-600 font-medium">کلاس‌های عادی</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl md:rounded-2xl p-2 md:p-6 border border-yellow-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <div className="w-7 h-7 md:w-14 md:h-14 bg-gradient-to-r from-yellow-600 to-yellow-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <Star className="w-4 h-4 md:w-7 md:h-7 text-white" />
            </div>
            <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-base md:text-4xl font-bold text-gray-800 mb-0.5 md:mb-2">{specialClasses.length}</p>
            <p className="text-xs md:text-base text-gray-600 font-medium">کلاس‌های ویژه</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl p-2 md:p-6 border border-blue-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-2 md:mb-6">
            <div className="w-7 h-7 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-4 h-4 md:w-7 md:h-7 text-white" />
            </div>
            <UserCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-base md:text-4xl font-bold text-gray-800 mb-0.5 md:mb-2">{students.length}</p>
            <p className="text-xs md:text-base text-gray-600 font-medium">دانش‌آموزان</p>
          </div>
        </div>
      </div>

      {/* کلاس‌های عادی */}
      {classes.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <School className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            کلاس‌های عادی
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-green-800 text-sm md:text-base">{cls.class_name}</h4>
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700">{cls.grade_name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* کلاس‌های فوق‌العاده */}
      {specialClasses.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
            کلاس‌های فوق‌العاده
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {specialClasses.map(cls => (
              <div key={cls.id} className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-yellow-800 text-sm md:text-base">{cls.title}</h4>
                  <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <Crown className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-700">{cls.day_of_week}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-700">
                      {formatTime(cls.start_time)} - {formatTime(cls.end_time)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-yellow-600" />
                    <span className="text-xs text-yellow-700">{cls.class_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* دانش‌آموزان پایه‌های معلم */}
      {students.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
          <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            دانش‌آموزان پایه‌های شما
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {students.map(stu => (
              <div key={stu.id} className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-blue-800 text-sm md:text-base">{stu.name}</h4>
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Award className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700">{stu.grade_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <School className="w-3 h-3 text-blue-600" />
                    <span className="text-xs text-blue-700">{stu.class_name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}