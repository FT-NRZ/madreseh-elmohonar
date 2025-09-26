'use client'
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, AlertCircle, Loader2, X,
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut,
  Eye, EyeOff, Menu, Bell, Calendar, Clock, TrendingUp, Zap, Crown, Target,
  RefreshCw, ChevronLeft, Activity, Sparkles, LayoutGrid, Image,
  NewspaperIcon,
  GalleryHorizontal,
  GalleryHorizontalEnd,
  CalendarCheck,
  FileText,
  Shield
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes', active: true },
  { label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
  { label: 'گزارش ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
];

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    } catch {
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('خطا در دریافت کلاس‌ها');
      const data = await response.json();
      if (data.success) setClasses(data.classes);
      else throw new Error(data.message || 'خطا در دریافت کلاس‌ها');
    } catch (err) {
      setError('خطا در بارگذاری کلاس‌ها');
    } finally {
      setLoading(false);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedClass(null);
  };

  const handleEdit = (classItem) => {
    setSelectedClass(classItem);
    setEditMode(true);
    openModal();
  };

  const handleDelete = async (classId) => {
    if (!confirm('آیا از حذف این کلاس اطمینان دارید؟')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: classId })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('کلاس با موفقیت حذف شد');
        fetchClasses();
      } else {
        toast.error(data.message || 'خطا در حذف کلاس');
      }
    } catch {
      toast.error('خطا در برقراری ارتباط با سرور');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // لیست کلاس‌ها - ریسپانسیو
  const ClassesList = () => {
    if (loading) {
      return (
        <div className="text-center py-10">
          <Loader2 className="w-10 h-10 animate-spin text-green-500 mx-auto mb-4" />
          <p>در حال بارگذاری کلاس‌ها...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-10">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      );
    }
    return (
      <>
        {/* موبایل: کارت ساده و جمع‌وجور */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {classes.map(classItem => (
            <div key={classItem.id} className="bg-white rounded-xl shadow p-3 border border-gray-100 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-green-700">{classItem.class_name}</h3>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{classItem.class_number}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>پایه: {classItem.grade_name || '-'}</span>
                <span>ظرفیت: {classItem.capacity || '-'}</span>
              </div>
              <div className="flex gap-2 justify-end pt-1 border-t border-green-50 mt-2">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="p-1 text-green-600 bg-green-50 rounded hover:bg-green-100 transition"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="p-1 text-red-600 bg-red-50 rounded hover:bg-red-100 transition"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* دسکتاپ: حالت قبلی */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map(classItem => (
            <div key={classItem.id} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{classItem.class_name}</h3>
              <p className="text-gray-600 mb-4">شماره کلاس: {classItem.class_number}</p>
              <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => handleEdit(classItem)}
                  className="p-2 text-gray-500 hover:text-green-700 transition-colors"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(classItem.id)}
                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </>
    );
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <Toaster position="bottom-center" />

      {/* موبایل: هدر و دکمه منو */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 border-b border-green-100 shadow">
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
        <div className="md:hidden fixed inset-0 z-50">
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
              <button
                onClick={openModal}
                className="w-full flex items-center gap-2 px-3 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-600 transition shadow"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">افزودن کلاس جدید</span>
              </button>
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
                  logout();
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

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block right-0 top-0 w-72 bg-white shadow-lg border-l border-green-100">
          <div className="p-6 bg-green-50 text-green-900 border-b border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">پنل مدیریت</h2>
                <p className="text-green-600 text-xs">مدرسه علم و هنر</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{classes.length}</p>
                <p className="text-xs text-green-600">کلاس فعال</p>
              </div>
              <div className="bg-green-100 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{user?.firstName?.length || 1}</p>
                <p className="text-xs text-green-600">مدیر فعال</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button
              onClick={openModal}
              className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium flex-1 text-right">افزودن کلاس جدید</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = item.active;
              return (
                <button
                  key={item.label}
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
        <main className="flex-1 p-3 md:p-6 space-y-6 md:space-y-8">
          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-10 md:-translate-y-32 translate-x-10 md:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row justify-between gap-2 md:gap-4">
                <div>
                  <h2 className="text-lg md:text-4xl font-bold mb-1 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت کلاس‌های مدرسه
                  </h2>
                  <p className="text-white/90 mb-2 md:mb-6 text-xs md:text-lg">افزودن، ویرایش و حذف کلاس‌ها</p>
                  <div className="flex mt-5 items-center gap-1 md:gap-6 text-white/80">
                    <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-lg rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs md:text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-lg rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs md:text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 hidden h-14 md:w-32 md:h-32 bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl md:flex items-center justify-center shadow-2xl">
                  <GraduationCap className="w-8 h-8 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* لیست کلاس‌ها */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-xl border border-green-200 p-3 md:p-8">
            <div className="flex flex-row justify-between items-center mb-4 md:mb-8 gap-2">
              <h1 className="text-base md:text-2xl font-bold text-gray-800">لیست کلاس‌ها ({classes.length})</h1>
              <button
                onClick={fetchClasses}
                className="flex items-center px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl md:rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-base"
              >
                <RefreshCw className="w-4 h-4 ml-2" />
                بروزرسانی
              </button>
            </div>
            <ClassesList />
          </div>

          {/* مودال افزودن/ویرایش کلاس */}
          {showModal && (
            <ClassModal
              onClose={closeModal}
              onSubmit={fetchClasses}
              editMode={editMode}
              selectedClass={selectedClass}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// کامپوننت مودال برای ایجاد و ویرایش کلاس
function ClassModal({ onClose, onSubmit, editMode, selectedClass }) {
  const [formData, setFormData] = useState({
    class_name: '',
    class_number: '',
    grade_id: '',
    teacher_id: '',
    capacity: '',
    description: '',
    academic_year: ''
  });
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (!response.ok) throw new Error('خطا در دریافت پایه‌ها');
      const data = await response.json();
      if (data.success) setGrades(data.grades);
      else throw new Error(data.message || 'خطا در دریافت پایه‌ها');
    } catch {}
  };

  useEffect(() => {
    if (editMode && selectedClass) {
      setFormData({
        class_name: selectedClass.class_name || '',
        class_number: selectedClass.class_number || '',
        grade_id: selectedClass.grade_id?.toString() || '',
        teacher_id: selectedClass.teacher_id?.toString() || '',
        capacity: selectedClass.capacity?.toString() || '',
        description: selectedClass.description || '',
        academic_year: selectedClass.academic_year || ''
      });
    } else {
      setFormData({
        class_name: '',
        class_number: '',
        grade_id: '',
        teacher_id: '',
        capacity: '',
        description: '',
        academic_year: ''
      });
    }
  }, [editMode, selectedClass]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = '/api/classes';
      const method = editMode ? 'PUT' : 'POST';
      if (!formData.class_name || !formData.class_number || !formData.grade_id || !formData.capacity || !formData.academic_year) {
        setError('لطفاً همه فیلدهای اجباری را پر کنید');
        setLoading(false);
        return;
      }
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          id: selectedClass?.id
        })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || `کلاس با موفقیت ${editMode ? 'ویرایش' : 'ایجاد'} شد`);
        onSubmit();
        onClose();
      } else {
        setError(data.message || 'خطا در ثبت اطلاعات');
      }
    } catch {
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-500 rounded-t-3xl">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">{editMode ? 'ویرایش کلاس' : 'افزودن کلاس جدید'}</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نام کلاس</label>
            <input
              type="text"
              name="class_name"
              value={formData.class_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شماره کلاس</label>
            <input
              type="text"
              name="class_number"
              value={formData.class_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">پایه تحصیلی</label>
            <select
              name="grade_id"
              value={formData.grade_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">انتخاب پایه</option>
              {grades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.grade_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ظرفیت</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">سال تحصیلی</label>
            <input
              type="text"
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">توضیحات</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 h-32"
            />
          </div>
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
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
              {loading ? 'در حال ذخیره...' : (editMode ? 'ویرایش کلاس' : 'افزودن کلاس')}
            </button>
          </div>
          </form>
      </div>
    </div>
  );
}