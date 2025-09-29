'use client';
import { useState, useEffect } from 'react';
import { Users, BookOpen, TrendingUp, User } from 'lucide-react';

export default function StudentsList({ teacherId }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [teacherId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/teacher/${teacherId}/students`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStudents(data.students || []);
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

  // گروه‌بندی دانش‌آموزان بر اساس کلاس
  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class_name || 'کلاس نامشخص';
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {});

  // محاسبه آمار
  const totalStudents = students.length;
  const totalClasses = Object.keys(studentsByClass).length;
  const averagePerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">در حال دریافت اطلاعات دانش‌آموزان...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="bg-red-100 border border-red-300 rounded-xl p-6 max-w-md mx-auto">
              <Users className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-red-800 font-bold text-lg mb-2">خطا در دریافت اطلاعات</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchStudents}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                تلاش مجدد
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* هدر صفحه */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10 text-emerald-600" />
            دانش‌آموزان کلاس‌های من
          </h1>
          <p className="text-gray-600 text-lg">
            مدیریت و مشاهده اطلاعات دانش‌آموزان تحت نظارت شما
          </p>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">کل دانش‌آموزان</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalStudents}</p>
              </div>
              <div className="bg-emerald-100 rounded-xl p-3">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide">کلاس‌ها</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{totalClasses}</p>
              </div>
              <div className="bg-blue-100 rounded-xl p-3">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-semibold text-sm uppercase tracking-wide">میانگین در کلاس</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{averagePerClass}</p>
              </div>
              <div className="bg-purple-100 rounded-xl p-3">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* لیست دانش‌آموزان */}
        {totalStudents === 0 ? (
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-12 shadow-lg text-center border border-gray-100">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">هیچ دانش‌آموزی یافت نشد</h3>
            <p className="text-gray-500">
              دانش‌آموزی در کلاس‌های شما ثبت نشده است یا هنوز به کلاس‌هایتان اختصاص داده نشده‌اند.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(studentsByClass).map(([className, classStudents]) => (
              <div key={className} className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* هدر کلاس */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-6 h-6" />
                      {className}
                    </h2>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {classStudents.length} دانش‌آموز
                    </span>
                  </div>
                </div>

                {/* لیست دانش‌آموزان کلاس */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classStudents.map((student) => (
                      <div 
                        key={student.id} 
                        className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-emerald-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-emerald-100 rounded-full p-2 flex-shrink-0">
                            <User className="w-5 h-5 text-emerald-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-lg mb-2 truncate">
                              {student.full_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'نام نامشخص'}
                            </h3>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">پایه:</span>
                                <span className="font-medium text-gray-700">{student.grade_name || 'نامشخص'}</span>
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