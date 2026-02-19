'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, BookOpen, TrendingUp, User, GraduationCap, 
  AlertCircle, RefreshCw, Sparkles, Filter, X
} from 'lucide-react';

export default function TeacherStudentsPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [allStudents, setAllStudents] = useState([]); // همه دانش‌آموزان
  const [filteredStudents, setFilteredStudents] = useState([]); // دانش‌آموزان فیلتر شده
  const [grades, setGrades] = useState([]); // لیست پایه‌ها
  const [selectedGrade, setSelectedGrade] = useState(''); // پایه انتخاب شده برای فیلتر
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        
        // شروع دریافت دانش‌آموزان
        fetchStudents();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  // فیلتر کردن دانش‌آموزان بر اساس پایه انتخابی
  useEffect(() => {
    if (selectedGrade === '') {
      setFilteredStudents(allStudents);
    } else {
      const filtered = allStudents.filter(student => 
        student.grade_id === parseInt(selectedGrade)
      );
      setFilteredStudents(filtered);
    }
  }, [selectedGrade, allStudents]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('شروع دریافت همه دانش‌آموزان...');

      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/teacher/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('وضعیت پاسخ:', response.status);
      const data = await response.json();
      console.log('داده‌های دریافتی:', data);

      if (response.ok && data.success) {
        setAllStudents(data.students || []);
        setFilteredStudents(data.students || []);
        setGrades(data.grades || []);
        console.log('دانش‌آموزان تنظیم شده:', data.students?.length);
        console.log('پایه‌ها تنظیم شده:', data.grades?.length);
      } else {
        setError(data.message || 'خطا در دریافت دانش‌آموزان');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // گروه‌بندی دانش‌آموزان بر اساس پایه
  const studentsByGrade = filteredStudents.reduce((acc, student) => {
    const gradeName = student.grade_name || 'بدون پایه';
    const gradeKey = `پایه ${gradeName}`;
    if (!acc[gradeKey]) {
      acc[gradeKey] = [];
    }
    acc[gradeKey].push(student);
    return acc;
  }, {});

  // محاسبه آمار
  const totalStudents = filteredStudents.length;
  const totalGrades = Object.keys(studentsByGrade).length;
  const averagePerGrade = totalGrades > 0 ? Math.round(totalStudents / totalGrades) : 0;

  // پاک کردن فیلتر
  const clearFilter = () => {
    setSelectedGrade('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال دریافت اطلاعات دانش‌آموزان...</p>
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
            onClick={fetchStudents}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
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
            <Users className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold mb-2">همه دانش‌آموزان 👥</h1>
              <p className="text-green-100 text-xs md:text-base">
                {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'} - مشاهده و فیلتر دانش‌آموزان
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* فیلتر پایه */}
      <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-900">فیلتر بر اساس پایه</h3>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 min-w-0 md:min-w-[200px]"
            >
              <option value="">همه پایه‌ها</option>
              {grades.map(grade => (
                <option key={grade.id} value={grade.id}>
                  پایه {grade.grade_name}
                </option>
              ))}
            </select>
            
            {selectedGrade && (
              <button
                onClick={clearFilter}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition flex items-center gap-2 justify-center"
              >
                <X className="w-4 h-4" />
                پاک کردن فیلتر
              </button>
            )}
          </div>
        </div>

        {selectedGrade && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm">
              <strong>فیلتر فعال:</strong> {grades.find(g => g.id === parseInt(selectedGrade))?.grade_name || 'نامشخص'}
              <span className="ml-2">({totalStudents} دانش‌آموز)</span>
            </p>
          </div>
        )}
      </div>

      {/* کارت‌های آماری */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">{totalStudents}</p>
            <p className="text-green-600 font-semibold text-xs md:text-base uppercase tracking-wide">
              {selectedGrade ? 'دانش‌آموزان فیلتر شده' : 'کل دانش‌آموزان'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">{totalGrades}</p>
            <p className="text-green-600 font-semibold text-xs md:text-base uppercase tracking-wide">پایه‌ها</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 md:w-7 md:h-7 text-white" />
            </div>
            <Users className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">{averagePerGrade}</p>
            <p className="text-green-600 font-semibold text-xs md:text-base uppercase tracking-wide">میانگین در پایه</p>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          لیست دانش‌آموزان
        </h3>

        {/* لیست دانش‌آموزان */}
        {totalStudents === 0 ? (
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              {selectedGrade ? 'هیچ دانش‌آموزی در این پایه یافت نشد' : 'هیچ دانش‌آموزی یافت نشد'}
            </h3>
            <p className="text-gray-500 mb-4">
              {selectedGrade 
                ? 'در پایه انتخاب شده دانش‌آموزی وجود ندارد.'
                : 'هیچ دانش‌آموزی در سیستم ثبت نشده است.'
              }
            </p>
            <button
              onClick={fetchStudents}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(studentsByGrade).map(([gradeName, gradeStudents]) => (
              <div key={gradeName} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
                {/* هدر پایه */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 md:px-6 py-3 md:py-4 border-b border-green-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg md:text-xl font-bold text-green-700 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                      {gradeName}
                    </h2>
                    <span className="bg-green-200 text-green-800 px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                      {gradeStudents.length} دانش‌آموز
                    </span>
                  </div>
                </div>

                {/* لیست دانش‌آموزان پایه */}
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {gradeStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="bg-gray-50 rounded-xl p-4 md:p-5 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-green-300"
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <div className="bg-green-100 rounded-full p-2 flex-shrink-0">
                            <User className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm md:text-lg mb-2 truncate">
                              {student.full_name || 'نام نامشخص'}
                            </h3>
                            
                            <div className="space-y-1 md:space-y-2 text-xs md:text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">کلاس:</span>
                                <span className="font-medium text-gray-700">{student.class_name}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">شماره دانش‌آموزی:</span>
                                <span className="font-medium text-gray-700">{student.student_number || 'ندارد'}</span>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">وضعیت:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  student.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {student.status === 'active' ? 'فعال' : 'غیرفعال'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}