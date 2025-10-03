'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, Award, AlertTriangle, Plus, Edit, Trash2, X, Calendar,
  LogOut, Shield, Star, LayoutGrid, GraduationCap, CalculatorIcon,
  GalleryHorizontalEnd, CalendarCheck,ChevronLeft, ChevronRight, GalleryHorizontal, BarChart3,
  Settings, NewspaperIcon, FileText, Menu,
  BookOpen,
  Calendar1Icon,
  UserPlus
} from 'lucide-react';
import moment from 'jalali-moment';
import toast from 'react-hot-toast';
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

export default function DisciplinaryManagementPage() {
  const [user, setUser] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedActionId, setSelectedActionId] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);


  const filteredActions = selectedTeacherId
    ? actions.filter(action => action.teacher_id === selectedTeacherId)
    : [];

  const [form, setForm] = useState({
    id: null,
    teacher_id: '',
    type: 'reward',
    severity: 'normal',
    level: 'normal',
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (selectedDate) {
      try {
        const { year, month, day } = selectedDate;
        const gregorianDate = moment(`${year}/${month}/${day}`, 'jYYYY/jMM/jDD').format('YYYY-MM-DD');
        setForm(prev => ({ ...prev, date: gregorianDate }));
      } catch (error) {
        // حذف console.error - امن شده
        if (process.env.NODE_ENV === 'development') {
          console.warn('Date conversion issue');
        }
      }
    }
  }, [selectedDate]);

  useEffect(() => {
    if (showModal && form.date && !selectedDate) {
      try {
        const persianMoment = moment(form.date);
        setSelectedDate({
          year: persianMoment.jYear(),
          month: persianMoment.jMonth() + 1,
          day: persianMoment.jDate()
        });
      } catch (error) {
        // حذف console.error - امن شده
        if (process.env.NODE_ENV === 'development') {
          console.warn('Date conversion issue');
        }
      }
    } else if (!showModal) {
      setSelectedDate(null);
    }
  }, [showModal, form.date]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const token = localStorage?.getItem?.('token');
    const userData = localStorage?.getItem?.('user');
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
      // فقط اطلاعات ضروری را نگه دار
      setUser({
        id: parsedUser.id,
        firstName: parsedUser.firstName,
        role: parsedUser.role
      });
      fetchTeachers();
      fetchActions();
    } catch {
      window.location.href = '/';
    }
  }, []);

  const handleTeacherClick = (teacherId) => {
    if (selectedTeacherId === teacherId) {
      setSelectedTeacherId(null);
    } else {
      setSelectedTeacherId(teacherId);
    }
  };

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
        } else {
          toast.error(data.message || 'خطا در دریافت معلمان');
        }
      } else if (response.status === 401 || response.status === 403) {
        // توکن نامعتبر، کاربر را خارج کن
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        toast.error('خطا در دریافت اطلاعات معلمان');
      }
    } catch (error) {
      // حذف console.error - امن شده
      setTeachers([]);
      if (process.env.NODE_ENV === 'development') {
        toast.error('ارتباط با سرور برقرار نشد');
      }
    }
  };

  const fetchActions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/disciplinary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setActions(data.actions || []);
        } else {
          toast.error(data.message || 'خطا در دریافت اطلاعات');
        }
      } else if (response.status === 401 || response.status === 403) {
        // توکن نامعتبر، کاربر را خارج کن
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        toast.error('خطا در دریافت اطلاعات');
      }
    } catch (error) {
      // حذف console.error - امن شده
      setActions([]);
      if (process.env.NODE_ENV === 'development') {
        toast.error('ارتباط با سرور برقرار نشد');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const method = form.id ? 'PUT' : 'POST';
      const response = await fetch('/api/disciplinary', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          author_id: user?.id
        })
      });

      const data = await response.json();
      if (data.success) {
        resetForm();
        fetchActions();
        toast.success(data.message || 'عملیات با موفقیت انجام شد');
      } else {
        toast.error(data.message || 'خطا در ذخیره اطلاعات');
      }
    } catch (error) {
      // حذف console.error - امن شده
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleEdit = (action) => {
    setForm({
      id: action.id,
      teacher_id: action.teacher_id,
      type: action.type,
      severity: action.severity,
      level: action.level,
      title: action.title,
      description: action.description || '',
      date: action.date ? action.date.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDeleteClick = (id) => {
    setSelectedActionId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(`/api/disciplinary?id=${selectedActionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchActions();
        setShowDeleteModal(false);
        toast.success(data.message || 'حذف با موفقیت انجام شد');
      } else {
        toast.error(data.message || 'خطا در حذف');
      }
    } catch (error) {
      // حذف console.error - امن شده
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      teacher_id: '',
      type: 'reward',
      severity: 'normal',
      level: 'normal',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(false);
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  const getTypeInfo = (action) => {
    if (action.type === 'reward') {
      const levelColors = {
        normal: 'bg-green-100 text-green-700 border-green-200',
        high: 'bg-blue-100 text-blue-700 border-blue-200',
        excellent: 'bg-purple-100 text-purple-700 border-purple-200'
      };
      return {
        color: levelColors[action.level] || levelColors.normal,
        icon: action.level === 'excellent' ? Star : Award,
        text: action.level === 'excellent' ? 'تشویق ویژه' : action.level === 'high' ? 'تشویق بالا' : 'تشویق'
      };
    } else {
      const severityColors = {
        mild: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        normal: 'bg-orange-100 text-orange-700 border-orange-200',
        severe: 'bg-red-100 text-red-700 border-red-200'
      };
      return {
        color: severityColors[action.severity] || severityColors.normal,
        icon: AlertTriangle,
        text: action.severity === 'severe' ? 'توبیخ شدید' : action.severity === 'mild' ? 'هشدار' : 'توبیخ'
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* موبایل: هدر بالا و دکمه منو */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-green-100 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-green-700" />
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
          {/* پس‌زمینه تار */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          
          {/* سایدبار */}
          <aside className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl">
            {/* هدر سایدبار */}
            <div className="p-4 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-700" />
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
              
              {/* آمار */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 rounded-xl p-2 text-center border border-green-100">
                  <p className="text-lg font-bold text-green-700">{actions.filter(a => a.type === 'reward').length}</p>
                  <p className="text-xs text-green-600">تشویقی</p>
                </div>
                <div className="bg-green-50 rounded-xl p-2 text-center border border-green-100">
                  <p className="text-lg font-bold text-green-700">{actions.filter(a => a.type === 'warning').length}</p>
                  <p className="text-xs text-green-600">توبیخی</p>
                </div>
              </div>
            </div>

            {/* منوی سایدبار */}
            <nav className="p-3 space-y-1 h-full overflow-y-auto">
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
              
              {/* دکمه خروج */}
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
        {/* دسکتاپ: سایدبار */}
        <aside className="hidden md:block right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
          <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold">پنل مدیریت</h2>
                <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{actions.filter(a => a.type === 'reward').length}</p>
                <p className="text-xs text-green-600">تشویقی</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{actions.filter(a => a.type === 'warning').length}</p>
                <p className="text-xs text-green-600">توبیخی</p>
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
        <main className="flex-1 p-2 md:p-6 space-y-6 md:space-y-8">
          {/* هدر */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl md:rounded-3xl p-4 md:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/10 rounded-full -translate-y-16 md:-translate-y-32 translate-x-16 md:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-4xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت توبیخی و تشویقی ها
                  </h2>
                  <p className="text-white/90 mb-3 md:mb-6 text-base md:text-lg">ثبت و مدیریت توبیخ و تشویق معلمان</p>
                  <div className="flex items-center space-x-2 md:space-x-6 text-white/80">
                    <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-2 md:px-4 py-1 md:py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-20 h-20 md:w-32 md:h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-10 h-10 md:w-16 md:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* دکمه ثبت جدید */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-3 md:p-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm md:text-base"
              >
                <Plus className="w-4 h-4" />
                ثبت جدید
              </button>
            </div>
          </div>

          {/* جدول معلمان */}
          <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-2 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-2 md:mb-4">لیست معلمان</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="bg-green-50 border-b border-green-100">
                    <th className="text-right p-2 md:p-3 font-bold text-green-800">نام معلم</th>
                    <th className="text-right p-2 md:p-3 font-bold text-green-800">کد معلم</th>
                    <th className="text-center p-2 md:p-3 font-bold text-green-800">تشویقی</th>
                    <th className="text-center p-2 md:p-3 font-bold text-green-800">توبیخی</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        معلمی یافت نشد
                      </td>
                    </tr>
                  ) : (
                    teachers.map(teacher => {
                      const rewardCount = actions.filter(a => a.teacher_id === teacher.id && a.type === 'reward').length;
                      const warningCount = actions.filter(a => a.teacher_id === teacher.id && a.type === 'warning').length;
                      const isSelected = selectedTeacherId === teacher.id;

                      return (
                        <tr
                          key={teacher.id}
                          className={`border-b border-gray-100 hover:bg-green-50 transition cursor-pointer ${
                            isSelected ? 'bg-green-100' : ''
                          }`}
                          onClick={() => handleTeacherClick(teacher.id)}
                        >
                          <td className={`p-2 md:p-3 font-medium ${isSelected ? 'text-green-700' : ''}`}>
                            {teacher.name}
                          </td>
                          <td className="p-2 md:p-3 text-gray-600">{teacher.teacher_code}</td>
                          <td className="text-center p-2 md:p-3">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                              {rewardCount}
                            </span>
                          </td>
                          <td className="text-center p-2 md:p-3">
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                              {warningCount}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* نمایش اعمال معلم انتخاب شده */}
          {selectedTeacherId && (
            <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-2 md:p-6">
              <div className="flex flex-col md:flex-row items-center justify-between mb-2 md:mb-4 gap-2">
                <h3 className="text-base md:text-lg font-bold text-gray-800">
                  تشویقی و توبیخی های {teachers.find(t => t.id === selectedTeacherId)?.name}
                </h3>
                <button
                  onClick={() => setSelectedTeacherId(null)}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {filteredActions.length === 0 ? (
                <div className="text-center py-8 md:py-12">
                  <Shield className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm md:text-base">هیچ تشویقی یا توبیخی برای این معلم ثبت نشده است</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 md:gap-6">
                  {filteredActions.map((action) => {
                    const typeInfo = getTypeInfo(action);
                    const IconComponent = typeInfo.icon;

                    return (
                      <div
                        key={action.id}
                        className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100 hover:scale-[1.02] overflow-hidden"
                      >
                        {/* هدر کارت */}
                        <div className={`p-3 md:p-4 ${action.type === 'reward' ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gradient-to-r from-orange-500 to-red-400'}`}>
                          <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-5 h-5" />
                              <span className="font-bold">{typeInfo.text}</span>
                            </div>
                            <span className="text-xs md:text-sm opacity-90">
                              {moment(action.date).format('jYYYY/jMM/jDD')}
                            </span>
                          </div>
                        </div>

                        {/* محتوا */}
                        <div className="p-3 md:p-6">
                          <div className="mb-2 md:mb-4">
                            <h3 className="text-base md:text-lg font-bold text-gray-800 mb-1 md:mb-2 group-hover:text-green-700 transition-colors">
                              {action.title}
                            </h3>
                            {action.description && (
                              <p className="text-xs md:text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {action.description}
                              </p>
                            )}
                          </div>

                          {/* برچسب نوع */}
                          <div className="mb-2 md:mb-4">
                            <span className={`px-2 py-1 md:px-3 md:py-1 text-xs rounded-full font-semibold border ${typeInfo.color}`}>
                              {typeInfo.text}
                            </span>
                          </div>

                          {/* دکمه‌های عملیات */}
                          <div className="flex justify-between items-center pt-2 md:pt-4 border-t border-gray-100">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(action)}
                                className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                              >
                                <Edit className="w-4 h-4" />
                                <span>ویرایش</span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(action.id)}
                                className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* مودال ثبت/ویرایش */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 md:p-4">
              <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
                  <h2 className="text-base md:text-lg font-bold text-green-700">
                    {form.id ? 'ویرایش' : 'ثبت جدید'}
                  </h2>
                  <button onClick={resetForm} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 px-4 md:px-6 py-4 md:py-6">
                  {/* انتخاب معلم */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">معلم</label>
                    <select
                      value={form.teacher_id}
                      onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-xs md:text-sm"
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

                  {/* نوع */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">نوع</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value })}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-xs md:text-sm"
                    >
                      <option value="reward">تشویقی</option>
                      <option value="warning">توبیخی</option>
                    </select>
                  </div>

                  {/* سطح/شدت */}
                  {form.type === 'reward' ? (
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">سطح تشویق</label>
                      <select
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                        className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-xs md:text-sm"
                      >
                        <option value="normal">عادی</option>
                        <option value="high">بالا</option>
                        <option value="excellent">ویژه</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">شدت توبیخ</label>
                      <select
                        value={form.severity}
                        onChange={(e) => setForm({ ...form, severity: e.target.value })}
                        className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-xs md:text-sm"
                      >
                        <option value="mild">هشدار</option>
                        <option value="normal">عادی</option>
                        <option value="severe">شدید</option>
                      </select>
                    </div>
                  )}

                  {/* عنوان */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">عنوان</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-xs md:text-sm"
                      placeholder="عنوان..."
                      required
                    />
                  </div>

                  {/* تاریخ */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">تاریخ (شمسی)</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowDatePicker(!showDatePicker)}
                        className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition text-right flex items-center justify-between"
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
                          }}
                          onClose={() => setShowDatePicker(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* توضیحات */}
                  <div>
                    <label className="block text-xs md:text-sm font-bold text-gray-700 mb-1 md:mb-2">توضیحات (اختیاری)</label>
                    <textarea
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-2 py-1 md:px-3 md:py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition h-16 md:h-24 resize-none text-xs md:text-sm"
                      placeholder="توضیحات اضافی..."
                    />
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex justify-end gap-2 md:gap-3 pt-2 md:pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-1 md:px-6 md:py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition text-xs md:text-base"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1 md:px-6 md:py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition font-bold text-xs md:text-base"
                    >
                      {form.id ? 'ویرایش' : 'ثبت'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* مودال حذف */}
          {showDeleteModal && (
            <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-2 md:p-4">
              <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
                <div className="flex justify-between items-center px-4 md:px-6 py-4 md:py-5 bg-gradient-to-r from-red-100 to-red-50 border-b border-red-100">
                  <h2 className="text-base md:text-lg font-bold text-red-700">حذف رکورد</h2>
                  <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-full bg-red-50 hover:bg-red-200 transition">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="px-4 md:px-6 py-4 md:py-6 space-y-2 md:space-y-4">
                  <p className="text-gray-700 text-xs md:text-base">آیا مطمئن هستید می‌خواهید این رکورد را حذف کنید؟</p>
                  <p className="text-xs md:text-sm text-red-600">این عمل غیرقابل بازگشت است.</p>
                  <div className="flex justify-end gap-2 md:gap-3 pt-2 md:pt-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="px-3 py-1 md:px-4 md:py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition text-xs md:text-base"
                    >
                      انصراف
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="px-3 py-1 md:px-4 md:py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-bold shadow hover:scale-105 transition text-xs md:text-base"
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

  const getDaysInMonth = (year, month) => moment.jDaysInMonth(year, month - 1);
  const getFirstDayOfWeek = (year, month) => moment(`${year}/${month}/1`, 'jYYYY/jMM/jDD').day();

  const generateYears = () => {
    const years = [];
    const currentJalaliYear = moment().jYear();
    for (let i = currentJalaliYear - 10; i <= currentJalaliYear + 10; i++) years.push(i);
    return years;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfWeek = getFirstDayOfWeek(currentYear, currentMonth);
    const days = [];
    for (let i = 0; i < (firstDayOfWeek + 1) % 7; i++) days.push(<div key={`empty-${i}`} className="h-8"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && selectedDate.year === currentYear && selectedDate.month === currentMonth && selectedDate.day === day;
      const isToday = moment().jYear() === currentYear && moment().jMonth() + 1 === currentMonth && moment().jDate() === day;
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
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={() => {
            if (currentMonth === 12) { setCurrentYear(currentYear + 1); setCurrentMonth(1); }
            else { setCurrentMonth(currentMonth - 1); }
          }} className="p-1 hover:bg-gray-100 rounded">
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="text-center flex items-center space-x-2 rtl:space-x-reverse">
            <button onClick={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
              className="font-bold text-gray-800 hover:bg-green-100 px-2 py-1 rounded transition-all">
              {persianMonths[currentMonth - 1]}
            </button>
            <button onClick={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
              className="font-bold text-gray-800 hover:bg-green-100 px-2 py-1 rounded transition-all">
              {currentYear}
            </button>
          </div>
          <button type="button" onClick={() => {
            if (currentMonth === 1) { setCurrentYear(currentYear - 1); setCurrentMonth(12); }
            else { setCurrentMonth(currentMonth + 1); }
          }} className="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        {showMonthPicker && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-green-100 rounded-lg shadow-lg p-2 grid grid-cols-3 gap-2 z-[9999]">
            {persianMonths.map((month, index) => (
              <button key={month} onClick={() => { setCurrentMonth(index + 1); setShowMonthPicker(false); }}
                className={`py-2 px-1 rounded-lg text-sm transition-all ${
                  currentMonth === index + 1 ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-gray-700'
                }`}>
                {month}
              </button>
            ))}
          </div>
        )}
        {showYearPicker && (
          <div className="absolute top-16 left-4 right-4 bg-white border border-green-100 rounded-lg shadow-lg p-2 grid grid-cols-4 gap-2 z-[9999] max-h-48 overflow-y-auto">
            {generateYears().map(year => (
              <button key={year} onClick={() => { setCurrentYear(year); setShowYearPicker(false); }}
                className={`py-2 px-1 rounded-lg text-sm transition-all ${
                  currentYear === year ? 'bg-green-500 text-white' : 'hover:bg-green-100 text-gray-700'
                }`}>
                {year}
              </button>
            ))}
          </div>
        )}
        {!showMonthPicker && !showYearPicker && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'].map((day, index) => (
                <div key={index} className="h-8 flex items-center justify-center text-xs font-bold text-gray-500">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">{renderCalendar()}</div>
          </>
        )}
        <div className="flex justify-between items-center pt-2 border-t">
          <button type="button" onClick={() => {
            const today = moment();
            onDateSelect({ year: today.jYear(), month: today.jMonth() + 1, day: today.jDate() });
          }} className="text-xs text-green-600 hover:text-green-700">امروز</button>
          <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-700">بستن</button>
        </div>
      </div>
    </div>
  );
}