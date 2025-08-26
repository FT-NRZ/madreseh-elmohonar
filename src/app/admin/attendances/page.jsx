'use client';
import React, { useEffect, useState } from 'react';
import moment from 'jalali-moment';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import jalaali from "jalaali-js";
import toast from 'react-hot-toast';
import {
  Users, GraduationCap, BarChart3, Settings, LogOut,
  CalendarCheck, NewspaperIcon, Image, Calendar as CalendarIcon, LayoutGrid, GalleryHorizontalEnd, Target
} from 'lucide-react';

// تبدیل اعداد فارسی به انگلیسی
function persianToEnglishNumbers(str) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
}

// تبدیل تاریخ جلالی به میلادی
function jalaliToGregorian(jalaliDate) {
  if (!jalaliDate) return '';
  try {
    let cleanDate = jalaliDate.toString().replace(/^j/, '');
    cleanDate = persianToEnglishNumbers(cleanDate);
    const [jy, jm, jd] = cleanDate.split('/').map(Number);
    if (!jy || !jm || !jd || jm < 1 || jm > 12 || jd < 1 || jd > 31) return '';
    const gregorianDate = jalaali.toGregorian(jy, jm, jd);
    if (!gregorianDate.gy || !gregorianDate.gm || !gregorianDate.gd) return '';
    return `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

// تبدیل میلادی به شمسی برای جدول
function toJalali(dateStr) {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  return moment(dateOnly, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');
}

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: CalendarIcon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'گزارش ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' }
];

export default function AdminAttendancesPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState('');
  const [statuses, setStatuses] = useState({});
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ students: 0, teachers: 0 });
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    // گرفتن لیست کلاس‌ها
    fetch('/api/classes')
      .then(res => res.ok ? res.json() : Promise.resolve({ classes: [] }))
      .then(data => setClasses(data.classes || []))
      .catch(() => setClasses([]));

    // گرفتن لیست دانش‌آموزان
    fetch('/api/student')
      .then(res => res.ok ? res.json() : Promise.resolve({ students: [] }))
      .then(data => setStudents(data.students || []))
      .catch(() => setStudents([]));

    setUserStats({ students: 1, teachers: 1 });
  }, []);

  // فیلتر دانش‌آموزان بر اساس کلاس انتخاب شده
  const filteredStudents = selectedClass
    ? students.filter(s => String(s.class_id) === String(selectedClass))
    : students;

  // ثبت حضور/غیاب یک دانش‌آموز
  const handleAttendance = async (studentId, status) => {
    if (!date) {
      toast.error('لطفاً تاریخ را انتخاب کنید!');
      return;
    }
    
    if (!selectedClass) {
      toast.error('لطفاً کلاس را انتخاب کنید!');
      return;
    }
    
    setLoading(true);
    const miladiDate = jalaliToGregorian(date);
    
    try {
      const payload = {
        student_id: studentId,
        class_id: selectedClass,
        date: miladiDate,
        status,
        reason: '',
        is_justified: false
      };
      
      console.log('Sending data:', payload);
      
      const res = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setStatuses(prev => ({ ...prev, [studentId]: status }));
        toast.success(result.message || 'ثبت شد');
      } else {
        console.error('Error response:', result);
        toast.error(result.error || 'خطا در ثبت!');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('ارتباط با سرور برقرار نشد!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col sm:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden sm:block sm:w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
        <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold">پنل مدیریت</h2>
              <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-700">{userStats.students}</p>
              <p className="text-xs text-green-600">دانش‌آموز</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-700">{userStats.teachers}</p>
              <p className="text-xs text-green-600">معلم</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarMenu.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.href;
            return (
              <button
                key={item.label}
                onClick={() => (window.location.href = item.href)}
                className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow-xl scale-[1.02] transform'
                    : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-green-50'}`}>
                  <IconComponent size={18} />
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              localStorage?.removeItem?.('token');
              localStorage?.removeItem?.('user');
              window.location.href = '/';
            }}
            className="w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 text-red-600 hover:bg-red-50 hover:shadow-lg hover:scale-[1.01] mt-6"
          >
            <div className="p-2 rounded-xl bg-red-100">
              <LogOut size={18} />
            </div>
            <span className="text-sm">خروج از سیستم</span>
          </button>
        </nav>
      </aside>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed sm:hidden bottom-0 left-0 right-0 z-30 bg-white border-t border-green-200 flex justify-around items-center py-1 shadow-xl">
        {sidebarMenu.slice(0, 5).map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.label}
              onClick={() => (window.location.href = item.href)}
              className={`flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold transition-all ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
            >
              <IconComponent size={20} />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => {
            localStorage?.removeItem?.('token');
            localStorage?.removeItem?.('user');
            window.location.href = '/';
          }}
          className="flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold text-red-500"
        >
          <LogOut size={20} />
          <span className="mt-0.5">خروج</span>
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-3xl mx-auto p-2 sm:p-4">
          <h1 className="text-xl font-bold mb-4 text-center">ثبت حضور و غیاب</h1>
          <div className="bg-white rounded-2xl shadow p-3 sm:p-6 mb-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center mb-4">
              <select
                className="border rounded p-2 min-w-[160px]"
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="">انتخاب کلاس</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
              <DatePicker
                value={date}
                onChange={dateObj => {
                  if (dateObj) {
                    const formattedDate = dateObj.format("YYYY/MM/DD");
                    setDate(formattedDate);
                  } else {
                    setDate('');
                  }
                }}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-2 py-2 border rounded"
                placeholder="تاریخ شمسی"
                format="YYYY/MM/DD"
                required
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl shadow">
                <thead>
                  <tr className="bg-green-50">
                    <th className="p-2">نام و نام خانوادگی</th>
                    <th className="p-2">شماره تلفن</th>
                    <th className="p-2">کد ملی</th>
                    <th className="p-2">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-400 py-8">دانش‌آموزی یافت نشد.</td>
                    </tr>
                  )}
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-green-50 transition">
                      <td className="p-2">
                        {s.users ? `${s.users.firstName || s.users.first_name || ''} ${s.users.lastName || s.users.last_name || ''}` : 'نامشخص'}
                      </td>
                      <td className="p-2">{s.users?.phone || s.users?.phoneNumber || '-'}</td>
                      <td className="p-2">{s.users?.nationalId || s.users?.national_id || '-'}</td>
                      <td className="p-2">
                        {statuses[s.id] ? (
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded text-xs ${statuses[s.id] === 'present' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                              {statuses[s.id] === 'present' ? 'حاضر' : 'غایب'}
                            </span>
                            <button
                              className="px-3 py-1 rounded text-xs bg-gray-200 text-gray-700 border"
                              disabled={loading}
                              onClick={() => setStatuses(prev => ({ ...prev, [s.id]: undefined }))}
                            >
                              لغو
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              className="px-3 py-1 rounded ml-2 text-xs bg-green-50 text-green-700 border"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'present')}
                            >
                              حاضر
                            </button>
                            <button
                              className="px-3 py-1 rounded text-xs bg-red-50 text-red-700 border"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'absent')}
                            >
                              غایب
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}