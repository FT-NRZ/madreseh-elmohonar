'use client';
import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  Users, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Trash2, Edit, Calendar, Clock, Plus, Menu, Image, LayoutGrid,
  Target, Sparkles, TrendingUp, Zap, Crown, Activity, RefreshCw,
  ChevronLeft, X, AlertCircle,
  NewspaperIcon,
  GalleryHorizontal,
  CalendarCheck,
  GalleryHorizontalEnd,
  FileText,
  Shield,
  Calendar1Icon,
  UserPlus
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
  const [selectedGradeLevel, setSelectedGradeLevel] = useState('');
  const [specialClasses, setSpecialClasses] = useState([]);

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
    } catch (error) {
      window.location.href = '/login';
    }
  }, []);

  // دریافت لیست کلاس‌ها، مقاطع و جلسات
  useEffect(() => {
    if (user) {
      fetchClasses();
      fetchGrades();
      fetchSchedules();
      fetchSpecialClasses();
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

  // دریافت لیست کلاس‌های فوق‌العاده
  const fetchSpecialClasses = async () => {
    try {
      const res = await fetch('/api/special-classes');
      const data = await res.json();
      if (data.success) setSpecialClasses(data.items);
      else setSpecialClasses([]);
    } catch {
      setSpecialClasses([]);
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

  // ثبت کلاس فوق‌العاده
const handleSpecialClassSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const formData = new FormData(e.target);
    const body = {
      title: formData.get('title')?.trim(),
      description: formData.get('description')?.trim(),
      class_id: formData.get('class_id') || null,
      day_of_week: formData.get('day_of_week'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time')
      // room_number حذف شد
    };

    // اعتبارسنجی سمت کلاینت
    if (!body.title || !body.day_of_week || !body.start_time || !body.end_time) {
      toast.error('لطفاً همه فیلدهای الزامی را پر کنید');
      return;
    }

    console.log('Sending special class data:', body);

    const res = await fetch('/api/special-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    
    const data = await res.json();
    console.log('Response:', data);
    
    if (data.success) {
      toast.success(data.message || 'کلاس فوق‌العاده ثبت شد');
      e.target.reset();
      await fetchSpecialClasses();
    } else {
      toast.error(data.message || 'خطا در ثبت کلاس فوق‌العاده');
    }
  } catch (error) {
    console.error('Error submitting special class:', error);
    toast.error('خطا در ارتباط با سرور');
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

  // حذف کلاس فوق‌العاده
  const handleDeleteSpecialClass = async (id) => {
    if (!confirm('آیا از حذف این کلاس فوق‌العاده اطمینان دارید؟')) return;
    try {
      const response = await fetch(`/api/special-classes?id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        toast.success('کلاس فوق‌العاده حذف شد');
        fetchSpecialClasses();
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

 if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gradient-to-br mb-10 from-green-50 to-white">
      <Toaster position="bottom-center" />
      <div className="flex flex-col md:flex-row">

        {/* Main Content - with margin for sidebar */}
        <main className="flex-1 p-3 md:p-6 space-y-6 md:space-y-8">
          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت برنامه هفتگی
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">ایجاد، ویرایش و حذف جلسات درسی</p>
                  <div className="flex items-center space-x-3 text-white/80">
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
                <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl md:flex hidden items-center justify-center shadow-2xl">
                  <Calendar className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6">
            <ActionCard
              title="افزودن برنامه جدید"
              description="ثبت برنامه درسی جدید"
              icon={Plus}
              gradient="from-green-600 to-green-500"
              onClick={() => window.scrollTo({ top: document.getElementById('add-schedule-form').offsetTop - 100, behavior: 'smooth' })}
            />
          </div>

          {/* فرم ایجاد جلسه */}
          <div id="add-schedule-form" className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">ایجاد برنامه درسی جدید</h1>
              <button
                onClick={fetchSchedules}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بروزرسانی
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">کلاس درسی</label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">روز هفته</label>
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">نام درس</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="مثال: ریاضی، فارسی، علوم"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زمان شروع</label>
                  <input
                    type="time"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زمان پایان</label>
                  <input
                    type="time"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setFormData({
                    class_id: '',
                    day: '',
                    subject: '',
                    start_time: '',
                    end_time: ''
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  پاک کردن فرم
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'در حال ذخیره...' : 'ایجاد برنامه درسی'}
                </button>
              </div>
            </form>
          </div>

          {/* فرم ثبت کلاس فوق‌العاده */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">ثبت کلاس فوق‌العاده</h2>
            <form onSubmit={handleSpecialClassSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان کلاس</label>
                  <input type="text" name="title" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">کلاس</label>
                  <select name="class_id" className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    <option value="">انتخاب کلاس (اختیاری)</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
                <textarea name="description" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">روز هفته</label>
                  <select name="day_of_week" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required>
                    <option value="">انتخاب روز</option>
                    {days.map(day => (
                      <option key={day.key} value={day.key}>{day.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زمان شروع</label>
                  <input type="time" name="start_time" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">زمان پایان</label>
                  <input type="time" name="end_time" className="w-full px-4 py-2 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t">
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" disabled={loading}>
                  {loading ? 'در حال ثبت...' : 'ثبت کلاس فوق‌العاده'}
                </button>
              </div>
            </form>
          </div>

          {/* نمایش لیست کلاس‌های فوق‌العاده ثبت‌شده */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8 mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">کلاس‌های فوق‌العاده ثبت‌شده</h2>
            {specialClasses.length === 0 ? (
              <div className="text-gray-400">هیچ کلاس فوق‌العاده‌ای ثبت نشده</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {specialClasses.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold text-gray-800">{item.title}</div>
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs hover:bg-red-200"
                        onClick={() => handleDeleteSpecialClass(item.id)}
                      >
                        حذف
                      </button>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <span className="font-medium">کلاس:</span> {classes.find(c => c.id === item.class_id)?.class_name || 'نامشخص'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      <span className="font-medium">روز:</span> {days.find(d => d.key === item.day_of_week)?.label || item.day_of_week}
                    </div>
                    <div className="text-gray-600 text-sm">
                      <span className="font-medium">زمان:</span> {item.start_time} - {item.end_time}
                    </div>
                    {item.description && (
                      <div className="text-gray-500 text-xs mt-2">{item.description}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* نمایش جلسات ثبت‌شده */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-4 md:p-8">
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">برنامه‌های ثبت‌شده</h1>
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGradeLevel('')}
                className={`px-3 py-1 rounded-lg ${selectedGradeLevel === '' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} text-xs`}
              >
                همه مقاطع
              </button>
              {grades.map(grade => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGradeLevel(grade.id)}
                  className={`px-3 py-1 rounded-lg ${selectedGradeLevel === grade.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'} text-xs`}
                >
                  {grade.grade_name}
                </button>
              ))}
            </div>
            {groupedSchedules.map(day => (
              <div key={day.key} className="mb-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-4">{day.label}</h3>
                {day.items.length === 0 ? (
                  <div className="text-gray-400 mb-2 md:mb-4 text-xs">هیچ جلسه‌ای ثبت نشده</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
                    {day.items.map(schedule => (
                      <div key={schedule.id} className="bg-gray-50 rounded-xl p-2 md:p-4 border border-gray-200 flex flex-col gap-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800 text-xs md:text-base">{schedule.subject}</span>
                          <div className="flex gap-1">
                            <button
                              className="p-1 text-gray-500 hover:text-green-700"
                              onClick={() => handleEdit(schedule)}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              className="p-1 text-gray-500 hover:text-red-600"
                              onClick={() => handleDelete(schedule.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm">
                          <span className="font-medium">کلاس:</span> {classes.find(c => c.id === schedule.class_id)?.class_name || 'نامشخص'}
                        </div>
                        <div className="text-gray-600 text-xs md:text-sm">
                          <span className="font-medium">زمان:</span> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* مودال ویرایش */}
      {editModal.open && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
            <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-500 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white">ویرایش جلسه</h2>
                <button onClick={() => setEditModal({ open: false, schedule: null })} className="text-white hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">کلاس درسی</label>
                <select
                  value={editModal.schedule.class_id}
                  onChange={e => setEditModal(modal => ({
                    ...modal,
                    schedule: { ...modal.schedule, class_id: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">انتخاب کلاس</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.class_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">روز هفته</label>
                <select
                  value={editModal.schedule.day_of_week}
                  onChange={e => setEditModal(modal => ({
                    ...modal,
                    schedule: { ...modal.schedule, day_of_week: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">انتخاب روز</option>
                  {days.map(day => (
                    <option key={day.key} value={day.key}>{day.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام درس</label>
                <input
                  type="text"
                  value={editModal.schedule.subject}
                  onChange={e => setEditModal(modal => ({
                    ...modal,
                    schedule: { ...modal.schedule, subject: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="نام درس"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">زمان شروع</label>
                <input
                  type="time"
                  value={extractTime(editModal.schedule.start_time)}
                  onChange={e => setEditModal(modal => ({
                    ...modal,
                    schedule: { ...modal.schedule, start_time: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">زمان پایان</label>
                <input
                  type="time"
                  value={extractTime(editModal.schedule.end_time)}
                  onChange={e => setEditModal(modal => ({
                    ...modal,
                    schedule: { ...modal.schedule, end_time: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditModal({ open: false, schedule: null })}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


// Action Card Component
function ActionCard({ title, description, icon: Icon, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r ${gradient} text-white rounded-3xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-100 text-right relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
            <Icon className="w-7 h-7 text-white" />
          </div>
          <Sparkles className="w-5 h-5 text-white/70" />
        </div>
        <h4 className="text-xl font-bold mb-3">{title}</h4>
        <p className="text-white/90">{description}</p>
      </div>
    </button>
  );
}

// Activity Item Component
function ActivityItem({ text, time }) {
  return (
    <div className="flex items-center space-x-4 p-4 rounded-2xl hover:bg-green-50 transition-all duration-300 backdrop-blur-lg">
      <div className="w-3 h-3 bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-lg"></div>
      <div className="flex-1">
        <p className="text-gray-700 font-medium">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
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