'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Calendar, Clock, Users, User, 
  AlertTriangle, CheckCircle, Eye, FileText, Upload,
  RefreshCw, Filter, Search, Bell, Target, LogOut,
  LayoutGrid,
  GraduationCap,
  CalculatorIcon,
  GalleryHorizontalEnd,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  BarChart3,
  SettingsIcon,
  NewspaperIcon,
  Shield,
  Menu,
  Calendar1Icon,
  UserPlus,
  Settings,
  BookOpen,
  GalleryHorizontal
} from 'lucide-react';
import moment from 'jalali-moment';
import { image } from 'framer-motion/m';


const sidebarMenu = [
    { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
    { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
    { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
    { label: 'برنامه هفتگی', icon: Calendar1Icon, href: '/admin/weekly_schedule' },
    { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
    { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
    { label: 'مدیریت گالری', icon: GalleryHorizontal, href: '/admin/gallery' },
    { label: 'مدیریت کارنامه ها', icon: BookOpen, href: '/admin/report_cards' },
    { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
    { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
    { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations' },
    { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
];

export default function CircularAdminPage() {
  const [user, setUser] = useState(null);
  const [circulars, setCirculars] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCircularId, setSelectedCircularId] = useState(null);
  const [showExpired, setShowExpired] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [currentPath, setCurrentPath] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    image_url: null,
    priority: 'normal',
    target_type: 'all_teachers',
    target_teacher_id: null,
    issue_date: new Date().toISOString().split('T')[0],
    expiry_duration: '1_month',
    is_read_required: false,
    circular_number: '',
    department: '',
  });

  useEffect(() => {
    if (showModal && form.issue_date && !selectedDate) {
      try {
        const persianMoment = moment(form.issue_date);
        setSelectedDate({
          year: persianMoment.jYear(),
          month: persianMoment.jMonth() + 1,
          day: persianMoment.jDate()
        });
      } catch (error) {
        // حذف console.error - خطا را نمایش نده
        if (process.env.NODE_ENV === 'development') {
          console.warn('Date conversion issue');
        }
      }
    } else if (!showModal) {
      setSelectedDate(null);
    }
  }, [showModal, form.issue_date]);

  // دریافت لیست معلمین
  const fetchTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/users/list?role=teachers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTeachers(data.users || []);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      // خطا را نمایش نده - فقط لیست خالی نگه دار
      setTeachers([]);
    }
  };

  // دریافت بخشنامه‌ها
  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(`/api/circulars?role=admin&showExpired=${showExpired}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCirculars(data.circulars || []);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      // خطا را نمایش نده - فقط لیست خالی نگه دار
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };
    
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

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
      fetchCirculars();
      fetchTeachers();
    } catch {
      window.location.href = '/login';
    }
  }, [showExpired]);

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = form.id ? 'PUT' : 'POST';
      const response = await fetch('/api/circulars', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          author_id: user?.id
        }),
      });
      const data = await response.json();
      if (data.success) {
        resetForm();
        fetchCirculars();
      } else {
        alert(data.error || 'خطا در ذخیره بخشنامه');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  // ویرایش بخشنامه
  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      image_url: item.image_url || null,
      priority: item.priority,
      target_type: item.target_type,
      target_teacher_id: item.target_teacher_id || null,
      issue_date: item.issue_date ? item.issue_date.split('T')[0] : '',
      expiry_duration: item.expiry_duration,
      is_read_required: item.is_read_required,
      circular_number: item.circular_number || '',
      department: item.department || '',
    });
    setShowModal(true);
  };

  // حذف بخشنامه
  const handleDeleteClick = (id) => {
    setSelectedCircularId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/circulars?id=${selectedCircularId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchCirculars();
        setShowDeleteModal(false);
      } else {
        alert(data.error || 'خطا در حذف بخشنامه');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  // ریست فرم
  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      content: '',
      image_url: null,
      priority: 'normal',
      target_type: 'all_teachers',
      target_teacher_id: null,
      issue_date: new Date().toISOString().split('T')[0],
      expiry_duration: '1_month',
      is_read_required: false,
      circular_number: '',
      department: '',
    });
    setShowModal(false);
  };

  // آپلود عکس
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setForm({ ...form, image_url: data.url });
      } else {
        alert('خطا در آپلود عکس');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('خطا در آپلود عکس');
    }
  };

  // فیلتر بخشنامه‌ها
  const filteredCirculars = circulars.filter(circular => {
    const matchesSearch = circular.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circular.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || circular.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  // تعیین رنگ اولویت
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-700 border-green-200';
      case 'low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'فوری';
      case 'high': return 'مهم';
      case 'normal': return 'عادی';
      case 'low': return 'کم‌اهمیت';
      default: return 'عادی';
    }
  };

  const getExpiryText = (duration) => {
    switch (duration) {
      case '10_days': return '۱۰ روز';
      case '1_month': return '۱ ماه';
      case '3_months': return '۳ ماه';
      case '6_months': return '۶ ماه';
      default: return '۱ ماه';
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
        <aside className="hidden md:block right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
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
                <p className="text-xl font-bold text-green-700">{circulars.length}</p>
                <p className="text-xs text-green-600">بخشنامه</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{circulars.filter(c => !c.is_expired).length}</p>
                <p className="text-xs text-green-600">فعال</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPath === item.href || item.active;
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
        <main className="flex-1 p-4 md:p-6 space-y-4 md:space-y-8">
          {/* هدر - رنگ‌های سبز مثل داشبورد */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت بخشنامه‌ها
                  </h2>
                  <p className="text-white/90 mb-3 md:mb-6 text-xs md:text-lg">ایجاد، ویرایش و انتشار بخشنامه‌های مدرسه</p>
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 text-white/80">
                    <div className="flex items-center gap-1 md:gap-2 bg-white/20 backdrop-blur-lg rounded-lg md:rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs md:text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-16 h-16 md:w-32 md:h-32 bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl flex items-center justify-center shadow-2xl">
                  <FileText className="w-8 h-8 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* فیلترها و دکمه‌ها */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
                {/* جستجو */}
                <div className="relative w-full md:w-auto">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="جستجو در بخشنامه‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-3 pr-10 py-2 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none w-full md:w-64 bg-green-50"
                  />
                </div>

                {/* فیلتر اولویت */}
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none bg-green-50"
                >
                  <option value="">همه اولویت‌ها</option>
                  <option value="urgent">فوری</option>
                  <option value="high">مهم</option>
                  <option value="normal">عادی</option>
                  <option value="low">کم‌اهمیت</option>
                </select>

                {/* نمایش منقضی‌شده */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExpired}
                    onChange={(e) => setShowExpired(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm font-medium">نمایش منقضی‌شده</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={fetchCirculars}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  بروزرسانی
                </button>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                >
                  <Plus className="w-4 h-4" />
                  بخشنامه جدید
                </button>
              </div>
            </div>
          </div>

          {/* لیست بخشنامه‌ها */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {loading ? (
              <div className="col-span-full flex justify-center py-8 md:py-12">
                <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCirculars.length === 0 ? (
              <div className="col-span-full text-center py-8 md:py-12 bg-white rounded-2xl shadow-lg border border-green-100">
                <FileText className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-xs md:text-base">بخشنامه‌ای یافت نشد</p>
              </div>
            ) : (
              filteredCirculars.map((circular) => (
                <div
                  key={circular.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border overflow-hidden ${
                    circular.is_expired ? 'opacity-60 border-gray-300' : 'border-green-100 hover:scale-[1.02]'
                  }`}
                >
                  {/* عکس یا پس‌زمینه */}
                  <div className="relative h-32 md:h-48 overflow-hidden">
                    {circular.image_url ? (
                      <img
                        src={circular.image_url}
                        alt={circular.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                        <FileText className="w-8 h-8 md:w-16 md:h-16 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* برچسب‌ها */}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-2">
                      {/* اولویت */}
                      <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-semibold border ${getPriorityColor(circular.priority)}`}>
                        {getPriorityText(circular.priority)}
                      </span>
                      
                      {/* وضعیت انقضا */}
                      {circular.is_expired ? (
                        <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          منقضی شده
                        </span>
                      ) : (
                        <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-700 border border-green-200">
                          فعال
                        </span>
                      )}
                    </div>

                    {/* شماره بخشنامه */}
                    {circular.circular_number && (
                      <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-white/90 px-2 md:px-3 py-1 rounded-full text-xs font-bold text-green-900">
                        {circular.circular_number}
                      </div>
                    )}
                  </div>

                  {/* محتوا */}
                  <div className="p-4 md:p-6">
                    <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {circular.title}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-3 leading-relaxed">
                      {circular.content.substring(0, 120)}
                      {circular.content.length > 120 && '...'}
                    </p>

                    {/* اطلاعات اضافی */}
                    <div className="space-y-2 mb-2 md:mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>تاریخ صدور: {moment(circular.issue_date).format('jYYYY/jMM/jDD')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>انقضا: {moment(circular.expiry_date).format('jYYYY/jMM/jDD')} ({getExpiryText(circular.expiry_duration)})</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {circular.target_type === 'all_teachers' ? (
                          <>
                            <Users className="w-4 h-4" />
                            <span>همه معلمین</span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>{circular.target_teacher?.first_name} {circular.target_teacher?.last_name}</span>
                          </>
                        )}
                      </div>
                      {circular.department && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Target className="w-4 h-4" />
                          <span>{circular.department}</span>
                        </div>
                      )}
                    </div>

                    {/* آمار خواندن */}
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-2 md:mb-4">
                      <Eye className="w-4 h-4" />
                      <span>{circular._count?.circular_reads || 0} نفر خوانده‌اند</span>
                      {circular.is_read_required && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>

                    {/* دکمه‌های عملیات */}
                    <div className="flex justify-between items-center pt-2 md:pt-4 border-t border-gray-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(circular)}
                          className="flex items-center gap-1 px-2 md:px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                        >
                          <Edit className="w-4 h-4" />
                          <span>ویرایش</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(circular.id)}
                          className="flex items-center gap-1 px-2 md:px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* مودال ایجاد/ویرایش */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
                  <h2 className="text-lg font-bold text-green-700">
                    {form.id ? 'ویرایش بخشنامه' : 'ایجاد بخشنامه جدید'}
                  </h2>
                  <button onClick={resetForm} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
                  {/* ردیف اول */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">عنوان بخشنامه</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                        placeholder="عنوان بخشنامه"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">شماره بخشنامه</label>
                      <input
                        type="text"
                        value={form.circular_number}
                        onChange={(e) => setForm({ ...form, circular_number: e.target.value })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                        placeholder="شماره بخشنامه (اختیاری)"
                      />
                    </div>
                  </div>

                  {/* ردیف دوم */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">اولویت</label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                      >
                        <option value="low">کم‌اهمیت</option>
                        <option value="normal">عادی</option>
                        <option value="high">مهم</option>
                        <option value="urgent">فوری</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">تاریخ صدور (شمسی)</label>
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
                        {showDatePicker && (
                          <PersianDatePicker
                            selectedDate={selectedDate}
                            onDateSelect={(date) => {
                              setSelectedDate(date);
                              setShowDatePicker(false);
                              // تبدیل به میلادی و ذخیره در فرم
                              const gregorianDate = moment(`${date.year}/${date.month}/${date.day}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
                              setForm(prev => ({ ...prev, issue_date: gregorianDate }));
                            }}
                            onClose={() => setShowDatePicker(false)}
                          />
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">مدت اعتبار</label>
                      <select
                        value={form.expiry_duration}
                        onChange={(e) => setForm({ ...form, expiry_duration: e.target.value })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                      >
                        <option value="10_days">۱۰ روز</option>
                        <option value="1_month">۱ ماه</option>
                        <option value="3_months">۳ ماه</option>
                        <option value="6_months">۶ ماه</option>
                      </select>
                    </div>
                  </div>

                  {/* ردیف سوم */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">مخاطب</label>
                      <select
                        value={form.target_type}
                        onChange={(e) => setForm({ ...form, target_type: e.target.value, target_teacher_id: null })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                      >
                        <option value="all_teachers">همه معلمین</option>
                        <option value="specific_teacher">معلم خاص</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">بخش مربوطه</label>
                      <input
                        type="text"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                        placeholder="بخش مربوطه (اختیاری)"
                      />
                    </div>
                  </div>

                  {/* انتخاب معلم خاص */}
                  {form.target_type === 'specific_teacher' && (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب معلم</label>
                      <select
                        value={form.target_teacher_id || ''}
                        onChange={(e) => setForm({ ...form, target_teacher_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                        required
                      >
                        <option value="">انتخاب کنید...</option>
                        {teachers.map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name} - {teacher.teacher_code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* آپلود عکس */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">عکس بخشنامه (اختیاری)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50"
                    />
                    {form.image_url && (
                      <img src={form.image_url} alt="بخشنامه" className="mt-2 w-32 h-32 object-cover rounded-xl border" />
                    )}
                  </div>

                  {/* متن بخشنامه */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">متن بخشنامه</label>
                    <textarea
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                      className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition h-32 resize-none"
                      placeholder="متن کامل بخشنامه"
                      required
                    />
                  </div>

                  {/* تنظیمات اضافی */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_read_required}
                      onChange={(e) => setForm({ ...form, is_read_required: e.target.checked })}
                      id="is_read_required"
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_read_required" className="text-gray-700 font-bold">
                      خواندن اجباری است
                    </label>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition font-bold"
                    >
                      {form.id ? 'ویرایش بخشنامه' : 'ثبت بخشنامه'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* مودال حذف */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-red-100 to-red-50 border-b border-red-100">
                  <h2 className="text-lg font-bold text-red-700">حذف بخشنامه</h2>
                  <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-full bg-red-50 hover:bg-red-200 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <p className="text-gray-700">آیا مطمئن هستید می‌خواهید این بخشنامه را حذف کنید؟</p>
                  <p className="text-sm text-red-600">این عمل غیرقابل بازگشت است.</p>
                  <div className="flex justify-end gap-3 pt-4">
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
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
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
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
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