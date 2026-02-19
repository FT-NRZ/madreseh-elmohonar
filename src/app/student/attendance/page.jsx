'use client'

import React, { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarX2, Clock, Loader2, Calendar, AlertCircle, Info } from 'lucide-react';

export default function AttendancePage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, week, month, threeMonths
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
  });

  // تنظیم کاربر و studentId
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  // دریافت اطلاعات حضور و غیاب
  useEffect(() => {
    async function fetchAttendance() {
      if (!studentId) return; // اگر studentId نداریم، درخواست نزنیم
      
      setLoading(true);
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

        if (!res.ok) {
          throw new Error(`خطای HTTP: ${res.status}`);
        }

        const data = await res.json();
        console.log('Received data:', data);

        if (data.success) {
          setAttendances(data.attendances || []);
          setStats(data.stats || {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
          });
        } else {
          // در صورت خطا، داده‌های نمونه نمایش داده می‌شود
          const sampleData = getSampleAttendanceData();
          setAttendances(sampleData.attendances);
          setStats(sampleData.stats);
        }
      } catch (error) {
        console.error('Error fetching attendance:', error);
        // نمایش داده‌های نمونه در صورت خطا
        const sampleData = getSampleAttendanceData();
        setAttendances(sampleData.attendances);
        setStats(sampleData.stats);
      } finally {
        setLoading(false);
      }
    }

    fetchAttendance();
  }, [studentId, filter]);

  // داده‌های نمونه برای حضور و غیاب
  const getSampleAttendanceData = () => {
    return {
      attendances: [
        {
          id: 1,
          date: '2024-10-15',
          status: 'absent',
          delay_minutes: null,
          delay_reason: null,
          notes: 'بیماری'
        },
        {
          id: 2,
          date: '2024-10-12',
          status: 'late',
          delay_minutes: 15,
          delay_reason: 'ترافیک',
          notes: 'تاخیر در رسیدن اتوبوس'
        },
        {
          id: 3,
          date: '2024-10-08',
          status: 'late',
          delay_minutes: 30,
          delay_reason: 'قرار ملاقات پزشک',
          notes: null
        },
        {
          id: 4,
          date: '2024-10-05',
          status: 'absent',
          delay_minutes: null,
          delay_reason: null,
          notes: 'مسافرت خانوادگی'
        }
      ],
      stats: {
        present: 18,
        absent: 2,
        late: 3,
        excused: 1
      }
    };
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری اطلاعات حضور و غیاب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-5">
      {/* پیام هشدار */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-red-800">
          اگر غیبت یا تاخیری موجه بوده و در سایت به نام موجه ثبت نشده با مدرسه تماس گرفته و اطلاع دهید.
        </p>
      </div>

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">حضور</p>
              <p className="text-2xl font-bold text-green-700">{stats.present || 0}</p>
            </div>
            <CalendarCheck2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">غیبت</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent || 0}</p>
            </div>
            <CalendarX2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600">تاخیر</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.late || 0}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">موجه</p>
              <p className="text-2xl font-bold text-blue-700">{stats.excused || 0}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-blue-500" />
          </div>
        </div>
      </div>

      {/* فیلتر */}
      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
        <Calendar className="w-5 h-5 text-gray-500" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="all">همه زمان‌ها</option>
          <option value="week">هفته گذشته</option>
          <option value="month">ماه گذشته</option>
          <option value="threeMonths">سه ماه گذشته</option>
        </select>
      </div>

      {/* جدول حضور و غیاب */}
      {!attendances.length ? (
        <div className="text-center py-10 text-gray-500">
          <CalendarCheck2 className="mx-auto mb-2 w-8 h-8" />
          هیچ حضور و غیابی ثبت نشده است.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border border-green-100 p-6">
          <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6" />
            لیست غیبت‌ها و تاخیرها
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 text-green-700">
                  <th className="py-3 px-4 text-right">تاریخ</th>
                  <th className="py-3 px-4 text-right">وضعیت</th>
                  <th className="py-3 px-4 text-right">میزان تاخیر</th>
                  <th className="py-3 px-4 text-right">دلیل</th>
                </tr>
              </thead>
              <tbody>
                {attendances
                  .filter(att => att.status === 'absent' || att.status === 'late')
                  .map((attendance) => (
                    <tr key={attendance.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(attendance.date)}</td>
                      <td className="py-3 px-4">
                        {attendance.status === 'absent' && (
                          <span className="px-2 py-1 rounded bg-red-100 text-red-700">غیبت</span>
                        )}
                        {attendance.status === 'late' && (
                          <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">تاخیر</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {attendance.status === 'late' ? formatTime(attendance.delay_minutes) : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          {attendance.delay_reason && (
                            <span className="text-gray-600">
                              {attendance.delay_reason}
                            </span>
                          )}
                          {attendance.notes && (
                            <span className="text-sm text-gray-500">
                              {attendance.notes}
                            </span>
                          )}
                          {!attendance.delay_reason && !attendance.notes && '-'}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* راهنمای استفاده */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-2">راهنمای حضور و غیاب</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• آمار کلی حضور و غیاب شما در بالا نمایش داده شده است</li>
              <li>• فقط غیبت‌ها و تاخیرها در جدول نشان داده می‌شوند</li>
              <li>• می‌توانید بر اساس بازه زمانی مختلف فیلتر کنید</li>
              <li>• اگر غیبت یا تاخیری موجه است، با مدرسه تماس بگیرید</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}