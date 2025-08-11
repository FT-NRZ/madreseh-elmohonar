'use client'
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, AlertCircle, CheckCircle, Loader2, X,
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Eye, EyeOff, Menu, Bell, Calendar, Clock, TrendingUp, Award, FileText, Home,
  ChevronDown, ChevronRight, Filter, Pencil, Image
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminClasses() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('classes');

  const menuItems = [
    { id: 'overview', label: 'داشبورد', icon: Home, color: 'blue' },
    { id: 'users', label: 'مدیریت کاربران', icon: Users, color: 'green' },
    { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap, color: 'purple' },
    { id: 'gallery', label: 'گالری تصاویر', icon: Image, color: 'pink' },
    { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'orange' },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, color: 'indigo' },
    { id: 'settings', label: 'تنظیمات', icon: Settings, color: 'gray' }
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
      console.error('Error parsing user data:', error);
      window.location.href = '/';
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('خطا در دریافت کلاس‌ها');
      }
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      } else {
        throw new Error(data.message || 'خطا در دریافت کلاس‌ها');
      }
    } catch (err) {
      console.error('Error fetching classes:', err);
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
    if (!confirm('آیا از حذف این کلاس اطمینان دارید؟')) {
      return;
    }
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
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('خطا در برقراری ارتباط با سرور');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const handleNavigation = (tab) => {
    if (tab === 'classes') {
      setActiveTab(tab);
    } else {
      const routes = {
        overview: '/admin/dashboard',
        users: '/admin/users',
        gallery: '/admin/gallery',
        schedule: '/admin/weekly_schedule',
        reports: '/admin/reports',
        settings: '/admin/settings'
      };
      window.location.href = routes[tab] || '/admin/dashboard';
    }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="bottom-center" />

      {/* Sidebar - دقیقاً مثل داشبورد */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-xl flex flex-col transition-all duration-300 border-l border-gray-200`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
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
        <nav className="mt-6 flex-1 px-4">
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
        <div className="p-4 border-t border-gray-100">
          <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : 'mb-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="mr-3 flex-1">
                <p className="font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">🎓 مدیریت کلاس‌ها</h1>
              <p className="text-gray-600 mt-1">
                مدیریت و ویرایش کلاس‌های مدرسه
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">خوش آمدید</p>
                <p className="font-semibold text-gray-800">
                  {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="container mx-auto">
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

            {showModal && (
              <ClassModal
                onClose={closeModal}
                onSubmit={fetchClasses}
                editMode={editMode}
                selectedClass={selectedClass}
              />
            )}
          </div>
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
  const [grades, setGrades] = useState([]); // لیست پایه‌ها
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      const response = await fetch('/api/grades');
      if (!response.ok) {
        throw new Error('خطا در دریافت پایه‌ها');
      }
      const data = await response.json();
      if (data.success) {
        setGrades(data.grades);
      } else {
        throw new Error(data.message || 'خطا در دریافت پایه‌ها');
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
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
      const url = editMode ? `/api/classes` : `/api/classes`;
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          id: selectedClass?.id
        })
      });

      if (!formData.class_name || !formData.class_number || !formData.grade_id || !formData.capacity || !formData.academic_year) {
        setError('لطفاً همه فیلدهای اجباری را پر کنید');
        setLoading(false);
        return;
       }

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || `کلاس با موفقیت ${editMode ? 'ویرایش' : 'ایجاد'} شد`);
        onSubmit();
        onClose();
      } else {
        setError(data.message || 'خطا در ثبت اطلاعات');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-green-700">
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