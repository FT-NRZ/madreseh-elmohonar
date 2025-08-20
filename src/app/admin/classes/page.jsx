'use client'
import React, { useState, useEffect } from 'react';
import {
  Plus, Edit, Trash2, AlertCircle, Loader2, X,
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut,
  Eye, EyeOff, Menu, Bell, Calendar, Clock, TrendingUp, Zap, Crown, Target,
  RefreshCw, ChevronLeft, Activity, Sparkles, LayoutGrid, Image
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// سایدبار منوها مثل داشبورد
const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'گزارش‌ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' }
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
    } catch {
      window.location.href = '/login';
    }
  }, []);

  // دریافت لیست کلاس‌ها
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

  // توابع مدیریت مودال
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedClass(null);
  };

  // توابع ویرایش و حذف
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

  // کامپوننت نمایش لیست کلاس‌ها
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-xl border-b border-green-200/50 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="group flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Menu className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="font-medium">پنل مدیریت</span>
                <Sparkles className="w-4 h-4 opacity-70" />
              </button>
            </div>
            {/* User Profile */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-white rounded-2xl p-4 shadow-lg border border-green-200">
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-green-600 font-medium">مدیر سیستم</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-white via-green-50 to-green-100 shadow-2xl z-50 transform transition-all duration-500 ease-out ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white p-6 pt-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                  <Target className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl">پنل کنترل</h2>
                  <p className="text-white/80 text-sm">مدیریت هوشمند</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{classes.length}</p>
                <p className="text-xs text-white/80">تعداد کلاس‌ها</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg rounded-xl p-4 text-center shadow-lg">
                <Zap className="w-6 h-6 text-white mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{user?.firstName?.length || 1}</p>
                <p className="text-xs text-white/80">مدیر فعال</p>
              </div>
            </div>
          </div>
        </div>
        {/* Menu Items */}
        <div className="p-6 space-y-4 overflow-y-auto" style={{ height: 'calc(100vh - 220px)' }}>
          {/* افزودن کلاس */}
          <button
            onClick={openModal}
            className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium flex-1 text-right">افزودن کلاس جدید</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
          {/* منوهای اصلی مدیریت */}
          <div className="space-y-3 pt-2">
            {sidebarMenu.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => window.location.href = item.href}
                className="w-full flex items-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium flex-1 text-right">{item.label}</span>
              </button>
            ))}
          </div>
          {/* خروج */}
          <div className="pt-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center space-x-3 rtl:space-x-reverse p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">خروج از سیستم</span>
            </button>
          </div>
        </div>
      </div>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title */}
        <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                  مدیریت کلاس‌های مدرسه
                </h2>
                <p className="text-white/90 mb-6 text-lg">افزودن، ویرایش و حذف کلاس‌ها</p>
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
                <GraduationCap className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* لیست کلاس‌ها */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">لیست کلاس‌ها</h1>
            <button
              onClick={openModal}
              className="bg-green-600 text-white rounded-xl py-3 px-6 hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5 inline-block rtl:mr-2" />
              افزودن کلاس جدید
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
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex items-center justify-center p-4">
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