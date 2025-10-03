'use client';
import { useState, useEffect } from 'react';
import { useLoading } from '../../components/LoadingProvider';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  Edit, Trash2, CalendarCheck, NewspaperIcon, FileText, Shield, Menu, X,
  Image, Calendar as CalendarIcon, LayoutGrid, GalleryHorizontalEnd,
  CheckCircle, XCircle, AlertCircle, Phone, User, Filter, Search,
  GalleryHorizontal
} from 'lucide-react';

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
  { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations', active: true },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
];

export default function AdminPreRegistrations() {
  const { startLoading, stopLoading } = useLoading() || {};
  const [registrations, setRegistrations] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  useEffect(() => {
    fetchPreRegistrations();
    // eslint-disable-next-line
  }, []);

  const fetchPreRegistrations = async () => {
    if (startLoading) startLoading();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/admin/dashboard';
        return;
      }
      const response = await fetch('/api/pre-registration', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setRegistrations(result.preRegistrations);
      } else {
        toast.error(result.error || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Error fetching pre-registrations:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      if (stopLoading) stopLoading();
    }
  };

  const updateStatus = async (id, status) => {
    if (startLoading) startLoading();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/admin/dashboard';
        return;
      }
      const response = await fetch(`/api/pre-registration/${id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(
          status === 'approved' ? 'درخواست تأیید شد! ✅' : 
          status === 'rejected' ? 'درخواست رد شد! ❌' : 
          'وضعیت تغییر یافت'
        );
        await fetchPreRegistrations();
      } else {
        toast.error(result.error || 'خطا در تغییر وضعیت');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      if (stopLoading) stopLoading();
    }
  };

  const deleteRegistration = async (id, name) => {
    let confirmDelete = false;
    await new Promise((resolve) => {
      toast(
        (t) => (
          <div style={{ direction: 'rtl', textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
              آیا مطمئن هستید که می‌خواهید درخواست "<b>{name}</b>" را حذف کنید؟
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  confirmDelete = true;
                  toast.dismiss(t.id);
                  resolve();
                }}
              >
                حذف
              </button>
              <button
                style={{
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '6px 16px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve();
                }}
              >
                انصراف
              </button>
            </div>
          </div>
        ),
        { duration: 10000 }
      );
    });
    if (!confirmDelete) return;

    if (startLoading) startLoading();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('لطفاً ابتدا وارد حساب ادمین شوید.');
        window.location.href = '/admin/dashboard';
        return;
      }
      
      const response = await fetch(`/api/pre-registration/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success('درخواست با موفقیت حذف شد! 🗑️');
        await fetchPreRegistrations();
      } else {
        toast.error(result.error || 'خطا در حذف درخواست');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    } finally {
      if (stopLoading) stopLoading();
    }
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  // فیلتر و جستجو
  const filteredRegistrations = registrations.filter(reg => {
    const matchesFilter = filter === 'all' || reg.status === filter;
    const matchesSearch = 
      reg.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone?.includes(searchTerm) ||
      reg.grade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  // صفحه‌بندی
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filter]);

  const statusCounts = {
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved' || r.status === 'accepted').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* موبایل: هدر و دکمه منو */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-green-100 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-7 h-7 text-green-700" />
            <span className="font-bold text-green-700">پیش‌ثبت‌نام‌ها</span>
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
                const isActive = item.active || (typeof window !== 'undefined' && window.location.pathname === item.href);
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

      <div className="flex flex-col sm:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden sm:block right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
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
                <p className="text-xl font-bold text-green-700">{statusCounts.pending}</p>
                <p className="text-xs text-green-600">در انتظار</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{statusCounts.approved}</p>
                <p className="text-xs text-green-600">تأیید شده</p>
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
        <main className="flex-1 p-2 sm:p-6 space-y-3 sm:space-y-8">
          {/* Header Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-32 sm:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    🎓 مدیریت پیش‌ثبت‌نام‌ها
                  </h1>
                  <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">بررسی و مدیریت درخواست‌های پیش‌ثبت‌نام</p>
                  <div className="flex items-center gap-1 sm:gap-6 text-white/80">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{registrations.length} درخواست</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl items-center justify-center shadow-2xl">
                  <UserPlus className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6">
            <StatsCard
              title="در انتظار بررسی"
              value={statusCounts.pending}
              icon={AlertCircle}
              gradient="from-yellow-100 to-yellow-50"
              iconGradient="from-yellow-500 to-yellow-400"
              textColor="text-yellow-800"
            />
            <StatsCard
              title="تأیید شده"
              value={statusCounts.approved}
              icon={CheckCircle}
              gradient="from-blue-100 to-blue-50"
              iconGradient="from-blue-500 to-blue-400"
              textColor="text-blue-800"
            />
            <StatsCard
              title="رد شده"
              value={statusCounts.rejected}
              icon={XCircle}
              gradient="from-red-100 to-red-50"
              iconGradient="from-red-500 to-red-400"
              textColor="text-red-800"
            />
          </div>

          {/* Controls Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-green-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-green-600" />
                <span className="font-bold text-gray-800">جستجو و فیلتر:</span>
              </div>
              <button
                onClick={fetchPreRegistrations}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm">به‌روزرسانی</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو نام، تلفن، پایه..."
                  className="w-full pr-10 pl-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition font-medium"
                />
              </div>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition font-medium"
              >
                <option value="all">همه درخواست‌ها ({registrations.length})</option>
                <option value="pending">در انتظار بررسی ({statusCounts.pending})</option>
                <option value="approved">تأیید شده ({statusCounts.approved})</option>
                <option value="rejected">رد شده ({statusCounts.rejected})</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center justify-center bg-green-50 rounded-xl px-4 py-2 border border-green-200">
                نمایش {currentRegistrations.length} از {filteredRegistrations.length} درخواست
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-green-200">
            {currentRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6">
                <UserPlus className="w-16 h-16 text-gray-400 mb-4" />
                <p className="text-gray-500 text-lg font-medium">هیچ درخواستی یافت نشد</p>
                <p className="text-gray-400 text-sm mt-2 text-center">
                  {searchTerm || filter !== 'all' 
                    ? 'تنظیمات جستجو یا فیلتر را تغییر دهید'
                    : 'درخواست‌های ثبت‌نام در اینجا نمایش داده می‌شوند'
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-100 to-green-50 backdrop-blur-lg">
                      <tr>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-800 border-b border-green-200">ردیف</th>
                        <th className="px-6 py-4 text-right text-sm font-bold text-green-800 border-b border-green-200">اطلاعات دانش‌آموز</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-green-800 border-b border-green-200">پایه تحصیلی</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-green-800 border-b border-green-200">تاریخ ثبت</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-green-800 border-b border-green-200">وضعیت</th>
                        <th className="px-6 py-4 text-center text-sm font-bold text-green-800 border-b border-green-200">عملیات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-green-100">
                      {currentRegistrations.map((reg, index) => (
                        <tr key={reg.id} className="hover:bg-green-50/50 transition-all duration-300">
                          <td className="px-6 py-4 text-center border-b border-green-100">
                            <span className="w-8 h-8 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto">
                              {startIndex + index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 border-b border-green-100">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-base">
                                  {reg.first_name} {reg.last_name}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Phone className="w-4 h-4 text-green-600" />
                                  <a 
                                    href={`tel:${reg.phone}`} 
                                    className="text-green-600 hover:text-green-700 font-medium transition"
                                  >
                                    {reg.phone}
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-green-100">
                            <span className="bg-green-100 text-green-800 px-3 py-2 rounded-xl font-medium">
                              {reg.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-green-100">
                            <span className="text-gray-600 font-medium">
                              {reg.created_at ? new Date(reg.created_at).toLocaleDateString('fa-IR') : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-green-100">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                              reg.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900' :
                              (reg.status === 'approved' || reg.status === 'accepted') ? 'bg-gradient-to-r from-blue-400 to-blue-300 text-blue-900' : 
                              'bg-gradient-to-r from-red-400 to-red-300 text-red-900'
                            }`}>
                              {reg.status === 'pending' ? '⏳ در انتظار' :
                               (reg.status === 'approved' || reg.status === 'accepted') ? '✅ تأیید شده' : '❌ رد شده'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center border-b border-green-100">
                            {reg.status === 'pending' ? (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => updateStatus(reg.id, 'approved')}
                                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-2 rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>تأیید</span>
                                </button>
                                <button
                                  onClick={() => updateStatus(reg.id, 'rejected')}
                                  className="bg-gradient-to-r from-red-600 to-red-500 text-white px-4 py-2 rounded-xl font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>رد</span>
                                </button>
                                <button
                                  onClick={() => deleteRegistration(reg.id, `${reg.first_name} ${reg.last_name}`)}
                                  className="bg-gradient-to-r from-gray-600 to-gray-500 text-white p-2 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-500 text-sm">
                                  {(reg.status === 'approved' || reg.status === 'accepted') ? 'تأیید شده' : 'رد شده'}
                                </span>
                                <button
                                  onClick={() => deleteRegistration(reg.id, `${reg.first_name} ${reg.last_name}`)}
                                  className="bg-gradient-to-r from-gray-600 to-gray-500 text-white p-2 rounded-xl hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Cards */}
                <div className="lg:hidden p-3 space-y-3">
                  {currentRegistrations.map((reg, index) => (
                    <div key={reg.id} className="bg-gradient-to-r from-green-50 to-green-25 rounded-xl border border-green-200 p-4 shadow-lg">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800 text-base truncate">
                              {reg.first_name} {reg.last_name}
                            </h3>
                            <span className="w-6 h-6 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {startIndex + index + 1}
                            </span>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-green-600" />
                              <a 
                                href={`tel:${reg.phone}`} 
                                className="text-green-600 hover:text-green-700 font-medium transition text-sm"
                              >
                                {reg.phone}
                              </a>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">پایه:</span>
                              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-lg text-xs font-medium">
                                {reg.grade}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">تاریخ:</span>
                              <span className="text-gray-600 font-medium text-xs">
                                {reg.created_at ? new Date(reg.created_at).toLocaleDateString('fa-IR') : '-'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">وضعیت:</span>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow ${
                                reg.status === 'pending' ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-yellow-900' :
                                (reg.status === 'approved' || reg.status === 'accepted') ? 'bg-gradient-to-r from-blue-400 to-blue-300 text-blue-900' : 
                                'bg-gradient-to-r from-red-400 to-red-300 text-red-900'
                              }`}>
                                {reg.status === 'pending' ? '⏳ در انتظار' :
                                 (reg.status === 'approved' || reg.status === 'accepted') ? '✅ تأیید شده' : '❌ رد شده'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      {reg.status === 'pending' ? (
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => updateStatus(reg.id, 'approved')}
                            className="flex-1 min-w-0 bg-gradient-to-r from-green-600 to-green-500 text-white px-3 py-2 rounded-lg font-bold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">تأیید</span>
                          </button>
                          <button
                            onClick={() => updateStatus(reg.id, 'rejected')}
                            className="flex-1 min-w-0 bg-gradient-to-r from-red-600 to-red-500 text-white px-3 py-2 rounded-lg font-bold hover:from-red-700 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">رد</span>
                          </button>
                          <button
                            onClick={() => deleteRegistration(reg.id, `${reg.first_name} ${reg.last_name}`)}
                            className="bg-gradient-to-r from-gray-600 to-gray-500 text-white p-2 rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-sm">
                            {(reg.status === 'approved' || reg.status === 'accepted') ? 'تأیید شده' : 'رد شده'}
                          </span>
                          <button
                            onClick={() => deleteRegistration(reg.id, `${reg.first_name} ${reg.last_name}`)}
                            className="bg-gradient-to-r from-gray-600 to-gray-500 text-white p-2 rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-green-200">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 disabled:opacity-50 transition-all"
                    >
                      قبلی
                    </button>
                    
                    <div className="flex gap-1">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const pageNum = i + Math.max(1, currentPage - 2);
                        if (pageNum > totalPages) return null;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 rounded-lg border transition-all ${
                              currentPage === pageNum 
                                ? 'bg-green-600 text-white border-green-600' 
                                : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 disabled:opacity-50 transition-all"
                    >
                      بعدی
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, gradient, iconGradient, textColor }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg`}>
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-r ${iconGradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
        </div>
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      </div>
      <div>
        <p className={`text-2xl sm:text-4xl font-bold ${textColor} mb-1 sm:mb-2`}>{value.toLocaleString('fa-IR')}</p>
        <p className={`text-xs sm:text-base ${textColor} font-medium opacity-80`}>{title}</p>
      </div>
    </div>
  );
}