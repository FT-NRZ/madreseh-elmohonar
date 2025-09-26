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
  CalendarCheck, NewspaperIcon, Image, Calendar as CalendarIcon, LayoutGrid, GalleryHorizontalEnd, Target,
  FileText, Clock, Edit, Trash2, X,
  Shield, Menu
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

// تبدیل دقیقه به ساعت و دقیقه
function minutesToTime(minutes) {
  if (!minutes) return '';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours} ساعت${mins > 0 ? ` و ${mins} دقیقه` : ''}`;
  }
  return `${mins} دقیقه`;
}

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: CalendarIcon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
  { label: 'گزارش ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
];

export default function AdminAttendancesPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState('');
  const [statuses, setStatuses] = useState({});
  const [delays, setDelays] = useState({});
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ students: 0, teachers: 0 });
  const [currentPath, setCurrentPath] = useState('');
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [delayForm, setDelayForm] = useState({
    studentId: null,
    minutes: '',
    reason: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

useEffect(() => {
  // گرفتن توکن از localStorage
  const token = localStorage.getItem('token');
  
  // گرفتن لیست کلاس‌ها
  fetch('/api/classes')
    .then(res => res.ok ? res.json() : Promise.resolve({ classes: [] }))
    .then(data => setClasses(data.classes || []))
    .catch(() => setClasses([]));

  // گرفتن لیست دانش‌آموزان با توکن
  if (token) {
    fetch('/api/student', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Unauthorized');
      })
      .then(data => setStudents(data.students || []))
      .catch(error => {
        console.error('Error fetching students:', error);
        setStudents([]);
        // اگر توکن نامعتبر است، کاربر را به صفحه لاگین ببر
        if (error.message === 'Unauthorized') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }
      });
  } else {
    // اگر توکن نیست، کاربر را به صفحه لاگین ببر
    window.location.href = '/';
  }

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

  // ثبت تاخیر
  const handleDelay = async (studentId) => {
    if (!date) {
      toast.error('لطفاً تاریخ را انتخاب کنید!');
      return;
    }
    
    if (!selectedClass) {
      toast.error('لطفاً کلاس را انتخاب کنید!');
      return;
    }

    setDelayForm({
      studentId,
      minutes: '',
      reason: ''
    });
    setShowDelayModal(true);
  };

  // ذخیره تاخیر
  const saveDelay = async () => {
    if (!delayForm.minutes || delayForm.minutes <= 0) {
      toast.error('لطفاً مقدار تاخیر را وارد کنید!');
      return;
    }

    setLoading(true);
    const miladiDate = jalaliToGregorian(date);
    
    try {
      const payload = {
        student_id: delayForm.studentId,
        class_id: selectedClass,
        date: miladiDate,
        status: 'late',
        delay_minutes: parseInt(delayForm.minutes),
        delay_reason: delayForm.reason,
        reason: '',
        is_justified: false
      };
      
      const res = await fetch('/api/attendances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setDelays(prev => ({
          ...prev,
          [delayForm.studentId]: {
            minutes: parseInt(delayForm.minutes),
            reason: delayForm.reason
          }
        }));
        setStatuses(prev => ({ ...prev, [delayForm.studentId]: 'late' }));
        setShowDelayModal(false);
        setDelayForm({ studentId: null, minutes: '', reason: '' });
        toast.success('تاخیر ثبت شد');
      } else {
        toast.error(result.error || 'خطا در ثبت تاخیر!');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('ارتباط با سرور برقرار نشد!');
    }
    setLoading(false);
  };

  // حذف وضعیت
  const clearStatus = (studentId) => {
    setStatuses(prev => ({ ...prev, [studentId]: undefined }));
    setDelays(prev => ({ ...prev, [studentId]: undefined }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col sm:flex-row">
      {/* موبایل: هدر و دکمه منو */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/90 border-b border-green-100 shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-7 h-7 text-green-700" />
            <span className="font-bold text-green-700">پنل مدیریت</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

            {/* موبایل: سایدبار drawer */}
      {sidebarOpen && (
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-4 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">پنل مدیریت</h2>
                  <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {sidebarMenu.map((item) => {
                const IconComponent = item.icon;
                const isActive = item.active;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSidebarOpen(false);
                      window.location.href = item.href;
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow scale-[1.02]'
                        : 'text-green-700 hover:bg-green-50 hover:shadow'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-green-50'}`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  localStorage?.removeItem?.('token');
                  localStorage?.removeItem?.('user');
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 mt-4 transition"
              >
                <div className="p-2 rounded-xl bg-red-100">
                  <LogOut size={16} />
                </div>
                <span className="text-sm">خروج از سیستم</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

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
        <div className="max-w-5xl mx-auto p-2 sm:p-4">
          <h1 className="text-xl font-bold mb-4 text-center">ثبت حضور و غیاب</h1>
          <div className="bg-white rounded-2xl shadow p-3 sm:p-6 mb-8 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center mb-4">
              <select
                className="border rounded p-2 min-w-[160px] w-full sm:w-auto"
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
                    <th className="p-2">تاخیر</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-8">دانش‌آموزی یافت نشد.</td>
                    </tr>
                  )}
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-green-50 transition">
                      <td className="p-2">
                        {s.users ? `${s.users.firstName || s.users.first_name || ''} ${s.users.lastName || s.users.last_name || ''}` : 'نامشخص'}
                      </td>
                      <td className="p-2">{s.users?.phone || s.users?.phoneNumber || '-'}</td>
                      <td className="p-2">{s.users?.nationalId || s.users?.national_id || '-'}</td>
                      
                      {/* ستون وضعیت */}
                      <td className="p-2">
                        {statuses[s.id] ? (
                          <div className="flex gap-1 items-center flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs ${
                              statuses[s.id] === 'present' 
                                ? 'bg-green-600 text-white' 
                                : statuses[s.id] === 'late'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-red-600 text-white'
                            }`}>
                              {statuses[s.id] === 'present' 
                                ? 'حاضر' 
                                : statuses[s.id] === 'late' 
                                  ? 'تاخیر' 
                                  : 'غایب'}
                            </span>
                            <button
                              className="px-2 py-1 rounded text-xs bg-gray-200 text-gray-700 border"
                              disabled={loading}
                              onClick={() => clearStatus(s.id)}
                            >
                              لغو
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            <button
                              className="px-2 py-1 rounded text-xs bg-green-50 text-green-700 border"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'present')}
                            >
                              حاضر
                            </button>
                            <button
                              className="px-2 py-1 rounded text-xs bg-red-50 text-red-700 border"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'absent')}
                            >
                              غایب
                            </button>
                          </div>
                        )}
                      </td>

                      {/* ستون تاخیر */}
                      <td className="p-2">
                        {delays[s.id] ? (
                          <div className="flex gap-1 items-center flex-wrap">
                            <span className="px-2 py-1 rounded text-xs bg-orange-100 text-orange-700 border border-orange-200">
                              {minutesToTime(delays[s.id].minutes)}
                            </span>
                            <button
                              className="px-1 py-1 rounded text-xs bg-blue-50 text-blue-700 border"
                              onClick={() => handleDelay(s.id)}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              className="px-1 py-1 rounded text-xs bg-red-50 text-red-700 border"
                              onClick={() => setDelays(prev => ({ ...prev, [s.id]: undefined }))}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="px-2 py-1 rounded text-xs bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1"
                            disabled={loading}
                            onClick={() => handleDelay(s.id)}
                          >
                            <Clock className="w-3 h-3" />
                            تاخیر
                          </button>
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

      {/* مودال تاخیر */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-orange-100 to-orange-50 border-b border-orange-100">
              <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                ثبت تاخیر
              </h2>
              <button 
                onClick={() => setShowDelayModal(false)} 
                className="p-1 rounded-full bg-orange-50 hover:bg-orange-200 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  مدت تاخیر (دقیقه)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={delayForm.minutes}
                  onChange={(e) => setDelayForm(prev => ({ ...prev, minutes: e.target.value }))}
                  className="w-full px-3 py-2 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="مثال: 15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {delayForm.minutes && minutesToTime(parseInt(delayForm.minutes))}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  دلیل تاخیر (اختیاری)
                </label>
                <textarea
                  value={delayForm.reason}
                  onChange={(e) => setDelayForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 outline-none h-20 resize-none"
                  placeholder="دلیل تاخیر را بنویسید..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDelayModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  onClick={saveDelay}
                  disabled={loading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                >
                  {loading ? 'در حال ثبت...' : 'ثبت تاخیر'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}