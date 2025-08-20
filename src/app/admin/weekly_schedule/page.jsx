'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Users, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Trash2, Edit, Calendar, Clock, Plus, ChevronDown, Menu, Image, Home, X
} from 'lucide-react';

export default function AdminSchedule() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [editModal, setEditModal] = useState({ open: false, schedule: null });
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    class_id: '',
    day: '',
    subject: '',
    start_time: '',
    end_time: ''
  });
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');

  const menuItems = [
    { id: 'overview', label: 'داشبورد', icon: Home, href: '/admin/dashboard' },
    { id: 'users', label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
    { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
    { id: 'gallery', label: 'گالری تصاویر', icon: Image, href: '/admin/gallery' },
    { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, href: '/admin/reports' },
    { id: 'settings', label: 'تنظیمات', icon: Settings, href: '/admin/settings' }
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
      fetchGrades();
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
          end_time: ''
        });
        fetchSchedules();
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
      // فقط فیلدهای مجاز را ارسال کن
      const { id, class_id, day_of_week, subject, start_time, end_time } = editModal.schedule;
      const body = {
        class_id,
        day_of_week,
        subject,
        start_time,
        end_time
      };
      const response = await fetch(`/api/schedule?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
  items: schedules.filter(s => {
    const matchesDay = s.day_of_week === day.key;
    
    if (!selectedGradeLevel) return matchesDay;
    
    // پیدا کردن کلاس مربوط به جلسه
    const scheduleClass = classes.find(c => c.id === s.class_id);
    if (!scheduleClass) return false;
    
    // بررسی اینکه آیا مقطع کلاس با مقطع انتخابی یکسان است
    return matchesDay && scheduleClass.grade_id === selectedGradeLevel;
  })
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
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
    <div className="flex">
      {/* Sidebar - Fixed on right like dashboard */}
      <aside className="right-0 top-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-200">
        <div className="p-6 bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">برنامه هفتگی</h2>
                <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
              </div>
            </div>
            {/* Quick Stats in Sidebar */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{classes.length}</p>
                <p className="text-xs text-white/80">کلاس</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-white">{grades.length}</p>
                <p className="text-xs text-white/80">مقطع</p>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
            <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
          </div>
        </div>
        
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.href;
            return (
              <button
                key={item.id}
                onClick={() => window.location.href = item.href}
                className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl scale-[1.02] transform'
                    : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-green-100'}`}>
                  <IconComponent size={18} />
                </div>
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
          
          {/* Logout Button */}
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
        {/* Title */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  مدیریت برنامه هفتگی
                </h2>
                <p className="text-white/90 mb-6 text-lg">ایجاد، ویرایش و حذف جلسات درسی</p>
                <div className="flex items-center space-x-6 text-white/80">
                  <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
              <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                <Calendar className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* فرم ایجاد جلسه */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-2 flex items-center">
              <Plus className="w-6 h-6 ml-2" />
              ایجاد برنامه درسی جدید
            </h2>
            <p className="text-green-600">فرم زیر را برای افزودن یک جلسه درسی جدید تکمیل کنید</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-green-700 mb-3">
                  <GraduationCap className="w-4 h-4 inline ml-2" />
                  کلاس درسی
                </label>
                <select
                  name="class_id"
                  value={formData.class_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                  required
                >
                  <option value="">انتخاب کلاس</option>
                  {classes.map((cls) => {
                    // پیدا کردن پایه مربوط به کلاس
                    const grade = grades.find(g => g.id === cls.grade_id);
                    return (
                    <option key={cls.id} value={cls.id}>
                      {cls.class_name} {grade ? `- ${grade.grade_name}` : ''}
                    </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-green-700 mb-3">
                  <Calendar className="w-4 h-4 inline ml-2" />
                  روز هفته
                </label>
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
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
              <label className="block text-sm font-bold text-green-700 mb-3">
                <BookOpen className="w-4 h-4 inline ml-2" />
                نام درس
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="مثال: ریاضی، فارسی، علوم"
                className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-green-700 mb-3">
                  <Clock className="w-4 h-4 inline ml-2" />
                  زمان شروع
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-green-700 mb-3">
                  <Clock className="w-4 h-4 inline ml-2" />
                  زمان پایان
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/30"
                  required
                />
              </div>
            </div>
            <div className="pt-6 border-t border-green-200">
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
                    grade_level: ''
                  })}
                  className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  disabled={loading}
                >
                  پاک کردن فرم
                </button>
                <button
                  type="submit"
                  className="flex items-center px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
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
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
          <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
            <Calendar className="w-6 h-6 ml-2" />
            برنامه‌های ثبت‌شده
          </h2>
          <div className="mb-6">
            <button
              onClick={() => setSelectedGradeLevel('')}
              className={`px-4 py-2 rounded-xl mx-2 transition-all ${selectedGradeLevel === '' ? 'bg-green-500 text-white shadow-lg' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
            >
              همه مقاطع
            </button>
            {grades.map(grade => (
              <button
                key={grade.id}
                onClick={() => setSelectedGradeLevel(grade.id)} // استفاده از grade.id به جای grade.grade_level
                className={`px-4 py-2 rounded-xl mx-2 transition-all ${selectedGradeLevel === grade.id ? 'bg-green-500 text-white shadow-lg' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {grade.grade_name}
              </button>
            ))}
          </div>
          {groupedSchedules.map(day => (
            <div key={day.key} className="mb-8">
              <h3 className="text-lg font-bold text-green-700 mb-4 flex items-center">
                <Calendar className="w-5 h-5 ml-2" />
                {day.label}
              </h3>
              {day.items.length === 0 ? (
                <div className="text-gray-400 mb-4 bg-green-50 rounded-xl p-6 text-center">
                  هیچ جلسه‌ای ثبت نشده
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {day.items.map(schedule => (
                    <div key={schedule.id} className="bg-green-50 rounded-xl shadow border border-green-100 p-6 hover:shadow-md transition-all">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-green-700">{schedule.subject}</span>
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded-xl hover:bg-green-100 text-green-700 transition-colors"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            className="p-2 rounded-xl hover:bg-red-100 text-red-600 transition-colors"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-600 mb-1">
                        <span className="font-semibold">کلاس:</span> {classes.find(c => c.id === schedule.class_id)?.class_name || 'نامشخص'}
                      </div>
                      <div className="text-gray-600 mb-1">
                        <span className="font-semibold">زمان:</span> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
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
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center">
            <form
              onSubmit={handleEditSubmit}
              className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-md w-full border border-green-200"
            >
            <h2 className="text-xl font-bold text-green-800 mb-6 flex items-center">
              <Edit className="w-6 h-6 ml-2" />
              ویرایش جلسه
            </h2>
            <div className="space-y-4">
              <select
                value={editModal.schedule.class_id}
                onChange={e => setEditModal(modal => ({
                  ...modal,
                  schedule: { ...modal.schedule, class_id: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-green-200 rounded-xl bg-green-50/30"
                required
              >
                <option value="">انتخاب کلاس</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                ))}
              </select>
              <select
                value={editModal.schedule.day_of_week}
                onChange={e => setEditModal(modal => ({
                  ...modal,
                  schedule: { ...modal.schedule, day_of_week: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-green-200 rounded-xl bg-green-50/30"
                required
              >
                <option value="">انتخاب روز</option>
                {days.map(day => (
                  <option key={day.key} value={day.key}>{day.label}</option>
                ))}
              </select>
              <input
                type="text"
                value={editModal.schedule.subject}
                onChange={e => setEditModal(modal => ({
                  ...modal,
                  schedule: { ...modal.schedule, subject: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-green-200 rounded-xl bg-green-50/30"
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
                className="w-full px-4 py-3 border border-green-200 rounded-xl bg-green-50/30"
                required
              />
              <input
                type="time"
                value={extractTime(editModal.schedule.end_time)}
                onChange={e => setEditModal(modal => ({
                  ...modal,
                  schedule: { ...modal.schedule, end_time: e.target.value }
                }))}
                className="w-full px-4 py-3 border border-green-200 rounded-xl bg-green-50/30"
                required
              />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => setEditModal({ open: false, schedule: null })}
                className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                انصراف
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg disabled:opacity-50 font-medium"
                disabled={loading}
              >
                {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </button>
            </div>
          </form>
        </div>
      )}
      </main>
    </div>
    <Toaster position="bottom-center" />
  </div>
  );
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  // استفاده از getUTCHours و getUTCMinutes برای جلوگیری از مشکل timezone
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function extractTime(dateString) {
  if (!dateString) return '';
  // اگر رشته ISO باشد، مقدار ساعت UTC را استخراج کن
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString)) {
    const date = new Date(dateString);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  // اگر رشته ساعت باشد، همان را برگردان
  if (/^\d{2}:\d{2}$/.test(dateString)) return dateString;
  return '';
}