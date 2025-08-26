'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, Calendar, BookOpen, BarChart3,
  Settings, LogOut, Image, LayoutGrid, NewspaperIcon,
  Edit, Trash2, RefreshCw, X, Plus, Eye, Target,
  ArrowLeft, ChevronLeft, ChevronRight,
  GalleryHorizontal,
  GalleryHorizontalEnd,
  CalendarCheck,
} from 'lucide-react';
import moment from 'jalali-moment';

export default function NewsAdminPage() {
  const [user, setUser] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    is_published: false,
    publish_date: '',
  });

  // سایدبار مشابه داشبورد مدیریت
  const sidebarMenu = [
    { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
    { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
    { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
    { label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
    { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
    { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
    { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
    { label: 'گزارش‌ ها', icon: BarChart3, href: '/admin/reports' },
    { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
    { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news', active: true }
  ];

  useEffect(() => {
    const token = localStorage?.getItem?.('token');
    const userData = localStorage?.getItem?.('user');
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }
      setUser(parsedUser);
      fetchNews();
    } catch {
      window.location.href = '/login';
    }
  }, []);

  // تبدیل تاریخ انتخاب‌شده به میلادی برای ذخیره
  useEffect(() => {
    if (selectedDate) {
      try {
        const { year, month, day } = selectedDate;
        const gregorianDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
        setForm(prev => ({ ...prev, publish_date: gregorianDate }));
      } catch (error) {
        console.error('Error converting date:', error);
      }
    }
  }, [selectedDate]);

  // هنگام ویرایش، تاریخ میلادی را به شمسی تبدیل کن
  useEffect(() => {
    if (showModal && form.publish_date && !selectedDate) {
      try {
        const persianMoment = moment(form.publish_date);
        setSelectedDate({
          year: persianMoment.jYear(),
          month: persianMoment.jMonth() + 1,
          day: persianMoment.jDate()
        });
      } catch (error) {
        console.error('Error converting date:', error);
      }
    } else if (!showModal) {
      setSelectedDate(null);
    }
  }, [showModal, form.publish_date]);

  // دریافت اخبار
  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      if (data.success) {
        setNews(data.news || []);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  // ارسال فرم (ایجاد یا ویرایش خبر)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = form.id ? 'PUT' : 'POST';
      const res = await fetch('/api/news', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setForm({ id: null, title: '', content: '', is_published: false, publish_date: '' });
        setSelectedDate(null);
        setShowModal(false);
        fetchNews();
      } else {
        alert(data.error || 'خطا در ذخیره خبر');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };

  // ویرایش خبر
  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      is_published: item.is_published,
      publish_date: item.publish_date ? item.publish_date.split('T')[0] : '',
    });
    setShowModal(true);
  };

  // نمایش مودال حذف
  const handleDeleteClick = (id) => {
    setSelectedNewsId(id);
    setShowDeleteModal(true);
  };

  // حذف خبر
  const confirmDelete = async () => {
    try {
      const res = await fetch(`/api/news?id=${selectedNewsId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchNews();
      } else {
        alert(data.error || 'خطا در حذف خبر');
      }
    } catch (error) {
      alert('خطا در حذف خبر');
    } finally {
      setShowDeleteModal(false);
      setSelectedNewsId(null);
    }
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  // تابع تبدیل تاریخ میلادی به شمسی برای نمایش
  const formatPersianDate = (dateString) => {
    if (!dateString) return 'تعیین نشده';
    try {
      return moment(dateString).format('jYYYY/jMM/jDD');
    } catch {
      return 'تاریخ نامعتبر';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white/90 rounded-2xl shadow-xl border border-green-200">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
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
                <p className="text-xl font-bold text-green-700">{news.length}</p>
                <p className="text-xs text-green-600">اخبار</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{news.filter(n => n.is_published).length}</p>
                <p className="text-xs text-green-600">منتشر شده</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.active || (typeof window !== 'undefined' && window.location.pathname === item.href);
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
              onClick={logout}
              className="w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 text-red-600 hover:bg-red-50 hover:shadow-lg hover:scale-[1.01] mt-6"
            >
              <div className="p-2 rounded-xl bg-red-100">
                <LogOut size={18} />
              </div>
              <span className="text-sm">خروج از سیستم</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت اخبار و اطلاعیه‌ها
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">ایجاد، ویرایش و انتشار اخبار مدرسه</p>
                  <div className="flex items-center space-x-6 text-white/80">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                  <NewspaperIcon className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="max-w-4xl mx-auto px-4 py-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">لیست اخبار ({news.length})</h2>
            <div className="flex gap-2">
              <button
                onClick={fetchNews}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl border border-green-200 hover:bg-green-200 transition"
              >
                <RefreshCw className="w-4 h-4" />
                بروزرسانی
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
              >
                <Plus className="w-4 h-4" />
                ایجاد خبر جدید
              </button>
            </div>
          </div>

          {/* News Table */}
          <div className="max-w-4xl mx-auto px-4 pb-10">
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 overflow-hidden">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : news.length === 0 ? (
                <div className="text-center py-12">
                  <NewspaperIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">خبری یافت نشد</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50 border-b border-green-100">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-700">عنوان</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-700">تاریخ انتشار</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-700">وضعیت</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-700">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {news.map((item, index) => (
                        <tr key={item.id} className={`border-b border-green-50 ${index % 2 === 0 ? 'bg-white' : 'bg-green-25'}`}>
                          <td className="px-6 py-4">
                            <div className="font-bold text-gray-800">{item.title}</div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{item.content.substring(0, 100)}...</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {formatPersianDate(item.publish_date)}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs rounded-full ${item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                              {item.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full shadow hover:bg-blue-100 transition"
                                title="ویرایش"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(item.id)}
                                className="p-2 bg-red-50 text-red-600 rounded-full shadow hover:bg-red-100 transition"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Modal for Create/Edit News */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-green-100 p-0 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
                  <div className="flex items-center gap-2">
                    <NewspaperIcon className="w-6 h-6 text-green-600" />
                    <h2 className="text-lg font-bold text-green-700">
                      {form.id ? 'ویرایش خبر' : 'ایجاد خبر جدید'}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedDate(null);
                    }}
                    className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
                    title="بستن"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                    placeholder="عنوان خبر"
                    required
                  />
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition h-32 resize-none"
                    placeholder="متن خبر"
                    required
                  />
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">تاریخ انتشار (شمسی)</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-right flex items-center justify-between"
                      >
                        <span>
                          {selectedDate 
                            ? `${selectedDate.year}/${selectedDate.month.toString().padStart(2, '0')}/${selectedDate.day.toString().padStart(2, '0')}`
                            : 'انتخاب تاریخ'
                          }
                        </span>
                        <Calendar className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {/* Persian Date Picker */}
                      {showDatePicker && (
                        <PersianDatePicker
                          selectedDate={selectedDate}
                          onDateSelect={(date) => {
                            setSelectedDate(date);
                            setShowDatePicker(false);
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      id="is_published"
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_published" className="text-gray-700 font-bold">منتشر شود</label>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedDate(null);
                      }}
                      className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition"
                    >
                      {form.id ? 'ویرایش' : 'ثبت خبر'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100 p-0 overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-red-100 to-red-50 border-b border-red-100">
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-6 h-6 text-red-600" />
                    <h2 className="text-lg font-bold text-red-700">حذف خبر</h2>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="p-2 rounded-full bg-red-50 hover:bg-red-200 transition"
                    title="بستن"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                {/* Content */}
                <div className="px-6 py-6 space-y-4">
                  <p className="text-gray-700">آیا مطمئن هستید می‌خواهید این خبر را حذف کنید؟</p>
                  <p className="text-sm text-red-600">این عمل غیرقابل بازگشت است.</p>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-bold shadow hover:scale-105 transition"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Persian Date Picker Component
// Persian Date Picker Component - کامپوننت بهبود یافته
function PersianDatePicker({ selectedDate, onDateSelect, onClose }) {
  const [currentYear, setCurrentYear] = useState(selectedDate?.year || moment().jYear());
  const [currentMonth, setCurrentMonth] = useState(selectedDate?.month || moment().jMonth() + 1);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  const getDaysInMonth = (year, month) => {
    return moment.jDaysInMonth(year, month - 1);
  };

  const getFirstDayOfWeek = (year, month) => {
    return moment(`${year}/${month}/1`, 'jYYYY/jMM/jDD').day();
  };

  // تولید لیست سال‌ها
  const generateYears = () => {
    const years = [];
    const currentJalaliYear = moment().jYear();
    // 10 سال قبل تا 10 سال بعد
    for (let i = currentJalaliYear - 10; i <= currentJalaliYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const days = [];
    
    // خانه‌های خالی برای شروع ماه
    for (let i = 0; i < (firstDayOfWeek + 1) % 7; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // روزهای ماه
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.year === currentYear && 
        selectedDate.month === currentMonth && 
        selectedDate.day === day;
      
      const isToday = moment().jYear() === currentYear && 
        moment().jMonth() + 1 === currentMonth && 
        moment().jDate() === day;
      
      days.push(
        <button
          key={day}
          type="button"
          onClick={() => onDateSelect({ year: currentYear, month: currentMonth, day })}
          className={`h-8 w-8 text-sm rounded-lg transition-all duration-200 ${
            isSelected
              ? 'bg-green-600 text-white shadow-lg'
              : isToday
              ? 'bg-green-100 text-green-700 font-bold'
              : 'hover:bg-green-50 text-gray-700'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl border border-green-200 p-4 z-[9999] w-72 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 12) {
                setCurrentYear(currentYear + 1);
                setCurrentMonth(1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <div className="text-center flex items-center space-x-2 rtl:space-x-reverse">
            <button 
              onClick={() => {
                setShowMonthPicker(!showMonthPicker);
                setShowYearPicker(false);
              }}
              className="font-bold text-gray-800 hover:bg-green-100 px-2 py-1 rounded transition-all"
            >
              {persianMonths[currentMonth - 1]}
            </button>
            <button 
              onClick={() => {
                setShowYearPicker(!showYearPicker);
                setShowMonthPicker(false);
              }}
              className="font-bold text-gray-800 hover:bg-green-100 px-2 py-1 rounded transition-all"
            >
              {currentYear}
            </button>
          </div>
          
          <button
            type="button"
            onClick={() => {
              if (currentMonth === 1) {
                setCurrentYear(currentYear - 1);
                setCurrentMonth(12);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Month Picker */}
        {showMonthPicker && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-green-100 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-2 z-[9999]">
            {persianMonths.map((month, index) => (
              <button
                key={month}
                onClick={() => {
                  setCurrentMonth(index + 1);
                  setShowMonthPicker(false);
                }}
                className={`py-2 px-1 rounded-lg text-sm transition-all ${
                  currentMonth === index + 1 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-green-100 text-gray-700'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        )}

        {/* Year Picker */}
        {showYearPicker && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-green-100 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-2 z-[9999] max-h-48 overflow-y-auto">
            {generateYears().map(year => (
              <button
                key={year}
                onClick={() => {
                  setCurrentYear(year);
                  setShowYearPicker(false);
                }}
                className={`py-2 px-1 rounded-lg text-sm transition-all ${
                  currentYear === year 
                    ? 'bg-green-500 text-white' 
                    : 'hover:bg-green-100 text-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        )}
        
        {!showMonthPicker && !showYearPicker && (
          <>
            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                <div key={index} className="h-8 flex items-center justify-center text-xs font-bold text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>
          </>
        )}
        
        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t">
          <button
            type="button"
            onClick={() => {
              const today = moment();
              onDateSelect({
                year: today.jYear(),
                month: today.jMonth() + 1,
                day: today.jDate()
              });
            }}
            className="text-xs text-green-600 hover:text-green-700"
          >
            امروز
          </button>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
}