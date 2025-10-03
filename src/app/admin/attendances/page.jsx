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
  Shield, Menu,
  UserPlus,
  BookOpen,
  GalleryHorizontal
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
  { label: 'مدیریت گالری', icon: GalleryHorizontal, href: '/admin/gallery' },
  { label: 'مدیریت کارنامه ها', icon: BookOpen, href: '/admin/report_cards' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
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
  const [tempStatuses, setTempStatuses] = useState({});
  const [tempDelays, setTempDelays] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [delayForm, setDelayForm] = useState({
    studentId: null,
    minutes: '',
    reason: ''
  });

    useEffect(() => {
      if (date && selectedClass) {
        fetchPreviousAttendances();
      }
    }, [date, selectedClass]);

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

  // دریافت وضعیت‌های قبلی
  const fetchPreviousAttendances = async () => {
    try {
      const miladiDate = jalaliToGregorian(date);
      const res = await fetch(`/api/attendances/byDate?date=${miladiDate}&classId=${selectedClass}`);
      const data = await res.json();
      
      if (data.success) {
        const newStatuses = {};
        const newDelays = {};
        
        data.attendances.forEach(att => {
          newStatuses[att.student_id] = att.status;
          if (att.delay_minutes) {
            newDelays[att.student_id] = {
              minutes: att.delay_minutes,
              reason: att.delay_reason
            };
          }
        });
        
        setTempStatuses(newStatuses);
        setTempDelays(newDelays);
      }
    } catch (error) {
      console.error('Error fetching previous attendances:', error);
      toast.error('خطا در دریافت اطلاعات قبلی');
    }
  };

  // فیلتر دانش‌آموزان بر اساس کلاس انتخاب شده
  const filteredStudents = selectedClass
    ? students.filter(s => String(s.class_id) === String(selectedClass))
    : students;

  // ثبت حضور/غیاب یک دانش‌آموز
  const handleAttendance = (studentId, status) => {
    setTempStatuses(prev => ({ ...prev, [studentId]: status }));
    if (status !== 'late') {
      setTempDelays(prev => {
        const newDelays = { ...prev };
        delete newDelays[studentId];
        return newDelays;
      });
    }
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
  const saveDelay = () => {
    if (!delayForm.minutes || delayForm.minutes <= 0) {
      toast.error('لطفاً مقدار تاخیر را وارد کنید!');
      return;
    }

    setTempStatuses(prev => ({ ...prev, [delayForm.studentId]: 'late' }));
    setTempDelays(prev => ({
      ...prev,
      [delayForm.studentId]: {
        minutes: parseInt(delayForm.minutes),
        reason: delayForm.reason
      }
    }));
    
    setShowDelayModal(false);
    setDelayForm({ studentId: null, minutes: '', reason: '' });
  };

  // حذف وضعیت
  const clearStatus = (studentId) => {
    setStatuses(prev => ({ ...prev, [studentId]: undefined }));
    setDelays(prev => ({ ...prev, [studentId]: undefined }));
  };


  const handleFinalSubmit = async () => {
    if (!date || !selectedClass) {
      toast.error('لطفاً تاریخ و کلاس را انتخاب کنید!');
      return;
    }

    setIsSaving(true);
    const miladiDate = jalaliToGregorian(date);
    
    try {
      const attendances = Object.entries(tempStatuses).map(([studentId, status]) => ({
        student_id: parseInt(studentId),
        class_id: parseInt(selectedClass),
        date: miladiDate,
        status,
        delay_minutes: status === 'late' ? tempDelays[studentId]?.minutes || null : null,
        delay_reason: status === 'late' ? tempDelays[studentId]?.reason || null : null
      }));

      console.log('Sending attendances:', attendances);

      const res = await fetch('/api/attendances/bulk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ attendances })
      });

      const result = await res.json();
      
      if (result.success) {
        toast.success('حضور و غیاب با موفقیت ثبت شد');
        setStatuses(tempStatuses);
        setDelays(tempDelays);
        setTempStatuses({});
        setTempDelays({});
      } else {
        console.error('API Error:', result);
        toast.error(result.message || 'خطا در ثبت حضور و غیاب');
      }
    } catch (error) {
      console.error('Error saving attendances:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setIsSaving(false);
    }
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
                const isActive = currentPath === item.href;
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
      <div className="flex-1 pb-20 sm:pb-4">
        <div className="max-w-5xl mx-auto p-3 sm:p-6">
          <h1 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 text-center text-green-800">ثبت حضور و غیاب</h1>
          
          <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-6 mb-4">
            {/* فیلترها */}
            <div className="flex flex-col gap-3 mb-4">
              <select
                className="border border-green-200 rounded-xl p-3 w-full bg-green-50 focus:ring-2 focus:ring-green-400 outline-none text-sm sm:text-base"
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
                calendarPosition="bottom-center"
                inputClass="w-full px-3 py-3 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none text-sm sm:text-base"
                placeholder="تاریخ شمسی را انتخاب کنید"
                format="YYYY/MM/DD"
                required
              />
            </div>

            {/* نمایش دسکتاپ - جدول */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm bg-white rounded-xl">
                <thead>
                  <tr className="bg-green-50 border-b border-green-200">
                    <th className="p-3 text-right font-bold text-green-800">نام و نام خانوادگی</th>
                    <th className="p-3 text-right font-bold text-green-800">شماره تلفن</th>
                    <th className="p-3 text-right font-bold text-green-800">کد ملی</th>
                    <th className="p-3 text-center font-bold text-green-800">وضعیت</th>
                    <th className="p-3 text-center font-bold text-green-800">تاخیر</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-gray-400 py-8">دانش‌آموزی یافت نشد.</td>
                    </tr>
                  )}
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-green-50 transition border-b border-green-100">
                      <td className="p-3">
                        {s.users ? `${s.users.firstName || s.users.first_name || ''} ${s.users.lastName || s.users.last_name || ''}` : 'نامشخص'}
                      </td>
                      <td className="p-3">{s.users?.phone || s.users?.phoneNumber || '-'}</td>
                      <td className="p-3">{s.users?.nationalId || s.users?.national_id || '-'}</td>

                      <td className="p-3">
                        {tempStatuses[s.id] ? (
                          <div className="flex gap-2 items-center justify-center flex-wrap">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              tempStatuses[s.id] === 'present' 
                                ? 'bg-green-600 text-white' 
                                : tempStatuses[s.id] === 'late'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-red-600 text-white'
                            }`}>
                              {tempStatuses[s.id] === 'present' 
                                ? 'حاضر' 
                                : tempStatuses[s.id] === 'late' 
                                  ? 'تاخیر' 
                                  : 'غایب'}
                            </span>
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-700 border hover:bg-gray-300 transition"
                              onClick={() => {
                                setTempStatuses(prev => {
                                  const newStatuses = { ...prev };
                                  delete newStatuses[s.id];
                                  return newStatuses;
                                });
                                setTempDelays(prev => {
                                  const newDelays = { ...prev };
                                  delete newDelays[s.id];
                                  return newDelays;
                                });
                              }}
                            >
                              لغو
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center flex-wrap">
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'present')}
                            >
                              حاضر
                            </button>
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                              disabled={loading}
                              onClick={() => handleAttendance(s.id, 'absent')}
                            >
                              غایب
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-3">
                        {tempDelays[s.id] ? (
                          <div className="flex gap-2 items-center justify-center flex-wrap">
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300">
                              {minutesToTime(tempDelays[s.id].minutes)}
                            </span>
                            <button
                              className="p-1 rounded-lg bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition"
                              onClick={() => handleDelay(s.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                              onClick={() => setTempDelays(prev => {
                                const newDelays = { ...prev };
                                delete newDelays[s.id];
                                return newDelays;
                              })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <button
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 transition flex items-center gap-1"
                              disabled={loading}
                              onClick={() => handleDelay(s.id)}
                            >
                              <Clock className="w-3 h-3" />
                              تاخیر
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* نمایش موبایل - کارت‌ها */}
            <div className="sm:hidden space-y-3">
              {filteredStudents.length === 0 && (
                <div className="text-center text-gray-400 py-8">دانش‌آموزی یافت نشد.</div>
              )}
              {filteredStudents.map(s => (
                <div key={s.id} className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-3 shadow-sm">
                  {/* اطلاعات دانش‌آموز */}
                  <div className="mb-3 pb-3 border-b border-green-200">
                    <h3 className="font-bold text-green-800 mb-1 text-sm">
                      {s.users ? `${s.users.firstName || s.users.first_name || ''} ${s.users.lastName || s.users.last_name || ''}` : 'نامشخص'}
                    </h3>
                    <div className="flex flex-col gap-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">تلفن:</span>
                        <span className="font-semibold">{s.users?.phone || s.users?.phoneNumber || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">کد ملی:</span>
                        <span className="font-semibold">{s.users?.nationalId || s.users?.national_id || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* دکمه‌های وضعیت */}
                  <div className="mb-2">
                    <p className="text-xs font-bold text-gray-700 mb-2">وضعیت حضور:</p>
                    {tempStatuses[s.id] ? (
                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-2 rounded-lg text-xs font-bold flex-1 text-center ${
                          tempStatuses[s.id] === 'present' 
                            ? 'bg-green-600 text-white' 
                            : tempStatuses[s.id] === 'late'
                              ? 'bg-orange-600 text-white'
                              : 'bg-red-600 text-white'
                        }`}>
                          {tempStatuses[s.id] === 'present' 
                            ? 'حاضر' 
                            : tempStatuses[s.id] === 'late' 
                              ? 'تاخیر' 
                              : 'غایب'}
                        </span>
                        <button
                          className="px-3 py-2 rounded-lg text-xs font-bold bg-gray-200 text-gray-700 border hover:bg-gray-300 transition"
                          onClick={() => {
                            setTempStatuses(prev => {
                              const newStatuses = { ...prev };
                              delete newStatuses[s.id];
                              return newStatuses;
                            });
                            setTempDelays(prev => {
                              const newDelays = { ...prev };
                              delete newDelays[s.id];
                              return newDelays;
                            });
                          }}
                        >
                          لغو
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition"
                          disabled={loading}
                          onClick={() => handleAttendance(s.id, 'present')}
                        >
                          حاضر
                        </button>
                        <button
                          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                          disabled={loading}
                          onClick={() => handleAttendance(s.id, 'absent')}
                        >
                          غایب
                        </button>
                      </div>
                    )}
                  </div>

                  {/* دکمه تاخیر */}
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">تاخیر:</p>
                    {tempDelays[s.id] ? (
                      <div className="flex gap-2 items-center">
                        <span className="flex-1 px-3 py-2 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 text-center">
                          {minutesToTime(tempDelays[s.id].minutes)}
                        </span>
                        <button
                          className="p-2 rounded-lg bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 transition"
                          onClick={() => handleDelay(s.id)}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition"
                          onClick={() => setTempDelays(prev => {
                            const newDelays = { ...prev };
                            delete newDelays[s.id];
                            return newDelays;
                          })}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="w-full px-3 py-2 rounded-lg text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 hover:bg-orange-200 transition flex items-center justify-center gap-2"
                        disabled={loading}
                        onClick={() => handleDelay(s.id)}
                      >
                        <Clock className="w-4 h-4" />
                        ثبت تاخیر
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* دکمه ثبت نهایی */}
          <div className="fixed bottom-20 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <button
              onClick={handleFinalSubmit}
              disabled={isSaving || Object.keys(tempStatuses).length === 0}
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base font-bold"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ثبت...
                </>
              ) : (
                <>
                  <CalendarCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  ثبت نهایی حضور و غیاب
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* مودال تاخیر */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-orange-100 to-orange-50 border-b border-orange-100">
              <h2 className="text-base sm:text-lg font-bold text-orange-700 flex items-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                ثبت تاخیر
              </h2>
              <button 
                onClick={() => setShowDelayModal(false)} 
                className="p-1 rounded-full bg-orange-50 hover:bg-orange-200 transition"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            
            <div className="px-4 sm:px-6 py-4 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  مدت تاخیر (دقیقه)
                </label>
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={delayForm.minutes}
                  onChange={(e) => setDelayForm(prev => ({ ...prev, minutes: e.target.value }))}
                  className="w-full px-3 py-2 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 outline-none text-sm"
                  placeholder="مثال: 15"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {delayForm.minutes && minutesToTime(parseInt(delayForm.minutes))}
                </p>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                  دلیل تاخیر (اختیاری)
                </label>
                <textarea
                  value={delayForm.reason}
                  onChange={(e) => setDelayForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 outline-none h-20 resize-none text-sm"
                  placeholder="دلیل تاخیر را بنویسید..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDelayModal(false)}
                  className="px-3 sm:px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition text-xs sm:text-sm font-bold"
                >
                  انصراف
                </button>
                <button
                  onClick={saveDelay}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50 text-xs sm:text-sm font-bold"
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