'use client'

import React, { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarX2, Clock, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';

export default function AttendancePage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });

  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) {
        window.location.href = '/';
        return;
      }

      const userObj = JSON.parse(userData);
      setUser(userObj);
      
      const sId = userObj.id || userObj.user_id || userObj.studentId;
      if (!sId) {
        setError('شناسه دانش‌آموز یافت نشد');
        return;
      }
      
      setStudentId(sId);
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }, []);

  useEffect(() => {
    async function fetchAttendance() {
      if (!studentId) return;
      
      setLoading(true);
      setError('');
      
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('توکن یافت نشد');
        }

        const res = await fetch(`/api/student/${studentId}/attendance?filter=${filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
          return;
        }

        if (res.status === 403) {
          setError('دسترسی به این اطلاعات مجاز نیست');
          return;
        }

        if (!res.ok) {
          throw new Error(`خطای HTTP: ${res.status}`);
        }

        const data = await res.json();

        if (data.success) {
          setAttendances(data.attendances || []);
          setStats(data.stats || {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          });
        } else {
          setError(data.message || 'خطا در دریافت اطلاعات');
        }
      } catch (err) {
        setError('خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [studentId, filter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatTime = (minutes) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} ساعت و ` : ''}${mins} دقیقه`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  const filteredAttendances = attendances.filter(att => 
    att.status === 'absent' || att.status === 'late'
  );

  return (
    <div className="space-y-6">
      {/* هدر مینیمال مثل داشبورد */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3">
            <CalendarCheck2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h2 className="text-lg md:text-2xl font-bold mb-1">حضور و غیاب</h2>
              <p className="text-green-100 text-xs md:text-sm">آمار حضور و غیاب شما</p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار کلی - مینیمال */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <CalendarCheck2 className="w-8 h-8 md:w-10 md:h-10 text-green-500 mb-2" />
          <p className="text-xl md:text-3xl font-bold text-green-700">{stats.present}</p>
          <p className="text-xs md:text-sm font-medium text-gray-600">حضور</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <CalendarX2 className="w-8 h-8 md:w-10 md:h-10 text-red-500 mb-2" />
          <p className="text-xl md:text-3xl font-bold text-red-700">{stats.absent}</p>
          <p className="text-xs md:text-sm font-medium text-gray-600">غیبت</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <Clock className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 mb-2" />
          <p className="text-xl md:text-3xl font-bold text-yellow-700">{stats.late}</p>
          <p className="text-xs md:text-sm font-medium text-gray-600">تاخیر</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
          <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-blue-500 mb-2" />
          <p className="text-xl md:text-3xl font-bold text-blue-700">{stats.excused}</p>
          <p className="text-xs md:text-sm font-medium text-gray-600">موجه</p>
        </div>
      </div>

      {/* فیلتر - مینیمال */}
      <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 md:gap-4">
          <Calendar className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          >
            <option value="all">همه زمان‌ها</option>
            <option value="week">هفته گذشته</option>
            <option value="month">ماه گذشته</option>
            <option value="threeMonths">سه ماه گذشته</option>
          </select>
        </div>
      </div>

      {/* جدول - مینیمال */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-white p-4 md:p-6 border-b border-gray-100">
          <h2 className="text-base md:text-lg font-bold text-gray-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            لیست غیبت‌ها و تاخیرها
          </h2>
        </div>

        {filteredAttendances.length === 0 ? (
          <div className="text-center py-12 p-6">
            <CalendarCheck2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-bold text-gray-700 mb-2">
              {attendances.length === 0 ? 'هیچ رکوردی یافت نشد' : 'همه حضورها کامل است!'}
            </h3>
            <p className="text-xs md:text-sm text-gray-500">
              {attendances.length === 0 
                ? 'تاکنون هیچ حضور و غیابی ثبت نشده است.'
                : 'شما هیچ غیبت یا تاخیری در این بازه زمانی نداشته‌اید.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-3 md:py-4 px-4 md:px-6 text-right text-xs md:text-sm font-bold text-gray-700">تاریخ</th>
                  <th className="py-3 md:py-4 px-4 md:px-6 text-right text-xs md:text-sm font-bold text-gray-700">وضعیت</th>
                  <th className="py-3 md:py-4 px-4 md:px-6 text-right text-xs md:text-sm font-bold text-gray-700">میزان تاخیر</th>
                  <th className="py-3 md:py-4 px-4 md:px-6 text-right text-xs md:text-sm font-bold text-gray-700">دلیل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAttendances.map((attendance) => (
                  <tr key={attendance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-gray-900">
                      {formatDate(attendance.date)}
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6">
                      {attendance.status === 'absent' && (
                        <span className={`inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full text-xs font-bold ${
                          attendance.is_justified 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          <CalendarX2 className="w-3 h-3" />
                          {attendance.is_justified ? 'غیبت موجه' : 'غیبت'}
                        </span>
                      )}
                      {attendance.status === 'late' && (
                        <span className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
                          <Clock className="w-3 h-3" />
                          تاخیر
                        </span>
                      )}
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600">
                      {attendance.status === 'late' ? formatTime(attendance.delay_minutes) : '-'}
                    </td>
                    <td className="py-3 md:py-4 px-4 md:px-6 text-xs md:text-sm text-gray-600">
                      {attendance.delay_reason || attendance.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}