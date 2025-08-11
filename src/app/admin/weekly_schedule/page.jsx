'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Users, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Trash2, Edit, Calendar, Clock, Plus, ChevronDown, Menu, Image, Home
} from 'lucide-react';

export default function AdminSchedule() {
  const [schedules, setSchedules] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    class_id: '',
    day: '',
    subject: '',
    start_time: '',
    end_time: '',
    teacher_id: '',
    grade_level: '' // اضافه کردن مقطع تحصیلی
  });
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]); // اضافه کردن لیست مقاطع
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState(''); // فیلتر مقطع

  const menuItems = [
    { id: 'overview', label: 'داشبورد', icon: Home, color: 'blue' },
    { id: 'users', label: 'مدیریت کاربران', icon: Users, color: 'green' },
    { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap, color: 'purple' },
    { id: 'gallery', label: 'گالری تصاویر', icon: Image, color: 'pink' },
    { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'orange' },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, color: 'indigo' },
    { id: 'settings', label: 'تنظیمات', icon: Settings, color: 'gray' }
  ];

  // روزهای هفته
  const days = [
    { key: 'saturday', label: 'شنبه' },
    { key: 'sunday', label: 'یکشنبه' },
    { key: 'monday', label: 'دوشنبه' },
    { key: 'tuesday', label: 'سه‌شنبه' },
    { key: 'wednesday', label: 'چهارشنبه' },
    { key: 'thursday', label: 'پنج‌شنبه' },
  ];

  // بررسی احراز هویت
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      window.location.href = '/';
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/';
        return;
      }
      setUser(parsedUser);
    } catch (error) {
      window.location.href = '/';
    }
  }, []);

  // دریافت لیست کلاس‌ها، مقاطع و جلسات
  useEffect(() => {
    if (user) {
      fetchClasses();
      fetchGrades(); // دریافت مقاطع
      fetchSchedules();
    }
  }, [user]);

  // دریافت جلسات برنامه هفتگی
  const fetchSchedules = async () => {
    try {
      const response = await fetch('/api/schedule');
      const data = await response.json();
      if (data.success) setSchedules(data.schedules);
      else setSchedules([]);
    } catch (error) {
      toast.error('خطا در دریافت برنامه هفتگی');
      setSchedules([]);
    }
  };

  // دریافت لیست کلاس‌ها
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      if (data.success) setClasses(data.classes);
      else setClasses([]);
    } catch (error) {
      setClasses([]);
    }
  };

  // دریافت لیست مقاطع
  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      const data = await response.json();
      if (data.success) setGrades(data.grades);
      else setGrades([]);
    } catch (error) {
      setGrades([]);
    }
  };

  // ثبت جلسه جدید
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // بررسی تداخل زمانی
      const hasConflict = schedules.some(schedule =>
        schedule.class_id === parseInt(formData.class_id) &&
        schedule.day_of_week === formData.day &&
        ((formData.start_time >= formatTime(schedule.start_time) && formData.start_time < formatTime(schedule.end_time)) ||
         (formData.end_time > formatTime(schedule.start_time) && formData.end_time <= formatTime(schedule.end_time)) ||
         (formData.start_time <= formatTime(schedule.start_time) && formData.end_time >= formatTime(schedule.end_time)))
      );

      if (hasConflict) {
        toast.error('این کلاس با برنامه دیگری در این ساعت تداخل دارد');
        return;
      }

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(data.message || 'برنامه هفتگی با موفقیت ایجاد شد');
        setFormData({
          class_id: '',
          day: '',
          subject: '',
          start_time: '',
          end_time: '',
          teacher_id: '',
          grade_level: '' // پاک کردن مقطع
        });
        fetchSchedules(); // بروزرسانی لیست جلسات
      } else {
        toast.error(data.message || 'خطا در ایجاد برنامه هفتگی');
      }
    } catch (error) {
      toast.error('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  // حذف جلسه
  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این جلسه اطمینان دارید؟')) return;
    try {
      const response = await fetch(`/api/schedule?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('جلسه با موفقیت حذف شد');
        fetchSchedules();
      } else {
        toast.error(data.message || 'خطا در حذف');
      }
    } catch {
      toast.error('خطا در حذف');
    }
  };

  // باز کردن مودال ویرایش
  const handleEdit = (schedule) => setEditModal({ open: true, schedule });

  // ذخیره ویرایش
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // بررسی تداخل زمانی
      const hasConflict = schedules.some(s =>
        s.id !== editModal.schedule.id &&
        s.class_id === parseInt(editModal.schedule.class_id) &&
        s.day_of_week === editModal.schedule.day_of_week &&
        ((editModal.schedule.start_time >= formatTime(s.start_time) && editModal.schedule.start_time < formatTime(s.end_time)) ||
         (editModal.schedule.end_time > formatTime(s.start_time) && editModal.schedule.end_time <= formatTime(s.end_time)) ||
         (editModal.schedule.start_time <= formatTime(s.start_time) && editModal.schedule.end_time >= formatTime(s.end_time)))
      );

      if (hasConflict) {
        toast.error('این کلاس با برنامه دیگری در این ساعت تداخل دارد');
        return;
      }

      const response = await fetch(`/api/schedule?id=${editModal.schedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editModal.schedule),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('ویرایش با موفقیت انجام شد');
        setEditModal({ open: false, schedule: null });
        fetchSchedules();
      } else {
        toast.error(data.message || 'خطا در ویرایش');
      }
    } catch {
      toast.error('خطا در ویرایش');
    } finally {
      setLoading(false);
    }
  };

  // گروه‌بندی جلسات بر اساس روز هفته
  const groupedSchedules = days.map(day => ({
    ...day,
    items: schedules.filter(s => s.day_of_week === day.key && (!selectedGradeLevel || s.classes.grade_id === parseInt(selectedGradeLevel))) // فیلتر مقطع
  }));

  // هندل تغییرات فرم
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // خروج از سیستم
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // هندل نویگیشن سایدبار
  const handleNavigation = (tab) => {
    if (tab === 'schedule') {
      setActiveTab(tab);
    } else {
      const routes = {
        overview: '/admin/dashboard',
        users: '/admin/users',
        classes: '/admin/classes',
        gallery: '/admin/gallery',
        reports: '/admin/reports',
        settings: '/admin/settings'
      };
      const targetRoute = routes[tab];
      if (targetRoute) window.location.href = targetRoute;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden" dir="rtl">
      <Toaster position="bottom-center" />
      {/* Sidebar - ثابت و بدون اسکرول */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-xl flex flex-col transition-all duration-300 border-l border-gray-200 h-full`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              {sidebarOpen && (
                <div className="mr-3">
                  <h2 className="font-bold text-gray-800 text-lg">مدرسه علم و هنر</h2>
                  <p className="text-sm text-gray-500">پنل مدیریت</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4 overflow-y-auto">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${sidebarOpen ? 'ml-3' : 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="mr-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
        {/* User Profile */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0">
          <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : 'mb-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0] || user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="mr-3 flex-1">
                <p className="font-semibold text-gray-800">
                  {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                </p>
                <p className="text-sm text-gray-500">مدیر سیستم</p>
              </div>
            )}
            {sidebarOpen && (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج از سیستم
            </button>
          )}
        </div>
      </div>

      {/* Main Content - قابل اسکرول */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header - ثابت */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">📅 برنامه هفتگی</h1>
              <p className="text-gray-600 mt-1">
                ایجاد و مدیریت برنامه درسی هفتگی کلاس‌ها
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Calendar className="w-6 h-6 text-gray-600" />
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">خوش آمدید</p>
                <p className="font-semibold text-gray-800">
                  {user?.firstName || user?.first_name} {user?.lastName || user?.last_name}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area - قابل اسکرول */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="max-w-4xl mx-auto">
            {/* فرم ایجاد جلسه */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">ایجاد برنامه درسی جدید</h2>
                <p className="text-gray-600">فرم زیر را برای افزودن یک جلسه درسی جدید تکمیل کنید</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <GraduationCap className="w-4 h-4 inline ml-2" />
                      کلاس درسی
                    </label>
                    <select
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      required
                    >
                      <option value="">انتخاب کلاس</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="w-4 h-4 inline ml-2" />
                      روز هفته
                    </label>
                    <select
                      name="day"
                      value={formData.day}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      required
                    >
                      <option value="">انتخاب روز</option>
                      {days.map(day => (
                        <option key={day.key} value={day.key}>{day.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <BookOpen className="w-4 h-4 inline ml-2" />
                    نام درس
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="مثال: ریاضی، فارسی، علوم"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline ml-2" />
                      زمان شروع
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Clock className="w-4 h-4 inline ml-2" />
                      زمان پایان
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Users className="w-4 h-4 inline ml-2" />
                    معلم درس (اختیاری)
                  </label>
                  <input
                    type="text"
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleChange}
                    placeholder="نام معلم"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      مقطع تحصیلی
                    </label>
                    <select
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                      required
                    >
                      <option value="">انتخاب مقطع</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.grade_level}>
                          {grade.grade_name}
                        </option>
                      ))}
                    </select>
                  </div>
                <div className="pt-6 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setFormData({
                        class_id: '',
                        day: '',
                        subject: '',
                        start_time: '',
                        end_time: '',
                        teacher_id: '',
                        grade_level: '' // پاک کردن مقطع
                      })}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      disabled={loading}
                    >
                      پاک کردن فرم
                    </button>
                    <button
                      type="submit"
                      className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2"></div>
                          در حال ذخیره...
                        </>
                      ) : (
                        <>
                          <Plus className="w-5 h-5 ml-2" />
                          ایجاد برنامه درسی
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* نمایش جلسات ثبت‌شده */}
            <div className="mt-12">
              <h2 className="text-xl font-bold text-gray-800 mb-6">برنامه‌های ثبت‌شده</h2>
              <div>
                <button
                  onClick={() => setSelectedGradeLevel('')}
                  className={`px-4 py-2 rounded-lg mx-2 ${selectedGradeLevel === '' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  همه مقاطع
                </button>
                {grades.map(grade => (
                  <button
                    key={grade.id}
                    onClick={() => setSelectedGradeLevel(grade.id)}
                    className={`px-4 py-2 rounded-lg mx-2 ${selectedGradeLevel === grade.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                  >
                    {grade.grade_name}
                  </button>
                ))}
              </div>
              {groupedSchedules.map(day => (
                <div key={day.key} className="mb-8">
                  <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 ml-2" />
                    {day.label}
                  </h3>
                  {day.items.length === 0 ? (
                    <div className="text-gray-400 mb-4">هیچ جلسه‌ای ثبت نشده</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {day.items.map(schedule => (
                        <div key={schedule.id} className="bg-white rounded-xl shadow border p-6 flex flex-col">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-green-700">{schedule.subject}</span>
                            <div className="flex gap-2">
                              <button
                                className="p-2 rounded hover:bg-green-100 text-green-700"
                                onClick={() => handleEdit(schedule)}
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 rounded hover:bg-red-100 text-red-600"
                                onClick={() => handleDelete(schedule.id)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <div className="text-gray-600 mb-1">
                            <span className="font-semibold">کلاس:</span> {schedule.classes?.class_name}
                          </div>
                          <div className="text-gray-600 mb-1">
                            <span className="font-semibold">زمان:</span> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold">معلم:</span> {schedule.teachers?.users?.first_name} {schedule.teachers?.users?.last_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* مودال ویرایش */}
            {editModal.open && (
              <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                <form
                  onSubmit={handleEditSubmit}
                  className="bg-white rounded-xl p-8 shadow-lg max-w-md w-full"
                >
                  <h2 className="text-xl font-bold mb-6">ویرایش جلسه</h2>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editModal.schedule.subject}
                      onChange={e => setEditModal(modal => ({
                        ...modal,
                        schedule: { ...modal.schedule, subject: e.target.value }
                      }))}
                      className="w-full border rounded px-4 py-2"
                      placeholder="نام درس"
                      required
                    />
                    <input
                      type="time"
                      value={extractTime(editModal.schedule.start_time)}
                      onChange={e => setEditModal(modal => ({
                        ...modal,
                        schedule: { ...modal.schedule, start_time: e.target.value }
                      }))}
                      className="w-full border rounded px-4 py-2"
                      required
                    />
                    <input
                      type="time"
                      value={extractTime(editModal.schedule.end_time)}
                      onChange={e => setEditModal(modal => ({
                        ...modal,
                        schedule: { ...modal.schedule, end_time: e.target.value }
                      }))}
                      className="w-full border rounded px-4 py-2"
                      required
                    />
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setEditModal({ open: false, schedule: null })}
                      className="px-4 py-2 border rounded text-gray-700"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-600 text-white rounded"
                      disabled={loading}
                    >
                      {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function extractTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}