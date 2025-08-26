'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  Edit, Trash2, CalendarCheck,
  NewspaperIcon
} from 'lucide-react';
import { Image, Calendar as CalendarIcon, LayoutGrid, GalleryHorizontalEnd } from 'lucide-react';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: CalendarIcon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'گزارش ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' }
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userStats, setUserStats] = useState({
    students: 0,
    teachers: 0,
    admins: 0,
    total: 0
  });
  const [showEditUser, setShowEditUser] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const openEditModal = (user) => {
    setUserToEdit(user);
    setShowEditUser(true);
  };

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
      fetchUserStats();
      fetchUsers();
    } catch (error) {
      window.location.href = '/login';
    }
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats || { students: 0, teachers: 0, admins: 0, total: 0 });
      } else {
        setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
      }
    } catch {
      setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setUsers([
          { id: 1, firstName: 'احمد', lastName: 'کریمی', nationalCode: '1234567890', role: 'student', phone: '09123456789' },
          { id: 2, firstName: 'فاطمه', lastName: 'محمدی', nationalCode: '0987654321', role: 'teacher', phone: '09234567890' },
          { id: 3, firstName: 'علی', lastName: 'احمدی', nationalCode: '1122334455', role: 'admin', phone: '09345678901' },
        ]);
      }
    } catch {
      setUsers([
        { id: 1, firstName: 'احمد', lastName: 'کریمی', nationalCode: '1234567890', role: 'student', phone: '09123456789' },
        { id: 2, firstName: 'فاطمه', lastName: 'محمدی', nationalCode: '0987654321', role: 'teacher', phone: '09234567890' },
        { id: 3, firstName: 'علی', lastName: 'احمدی', nationalCode: '1122334455', role: 'admin', phone: '09345678901' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        fetchUserStats();
        alert('کاربر با موفقیت حذف شد!');
      } else {
        const data = await response.json();
        alert(data.message || 'خطا در حذف کاربر');
      }
    } catch {
      alert('خطا در ارتباط با سرور');
    }
  };

  const confirmDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const executeDelete = () => {
    if (userToDelete) {
      handleDeleteUser(userToDelete.id);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    }
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar - Desktop */}
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
                <p className="text-xl font-bold text-green-700">{userStats.students}</p>
                <p className="text-xs text-green-600">دانش‌آموز</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{userStats.teachers}</p>
                <p className="text-xs text-green-600">معلم</p>
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

        {/* Bottom Navigation - Mobile */}
        <nav className="fixed sm:hidden bottom-0 left-0 right-0 z-30 bg-white border-t border-green-200 flex justify-around items-center py-1 shadow-xl">
          {sidebarMenu.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.href;
            return (
              <button
                key={item.label}
                onClick={() => (window.location.href = item.href)}
                className={`flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold transition-all ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
              >
                <IconComponent size={20} />
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold text-red-500"
          >
            <LogOut size={20} />
            <span className="mt-0.5">خروج</span>
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pb-16 sm:pb-0 p-2 sm:p-6 space-y-3 sm:space-y-8 mt-2 sm:mt-0">
          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-32 sm:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                <div>
                  <h2 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    سلام {user?.firstName} عزیز! 🌟
                  </h2>
                  <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">به پنل مدیریت هوشمند مدرسه علم و هنر خوش آمدید</p>
                  <div className="flex items-center gap-1 sm:gap-6 text-white/80">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 h-14 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl">
                  <Crown className="w-8 h-8 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-6">
            <StatsCard
              title="دانش‌آموزان"
              value={userStats.students}
              icon={GraduationCap}
              gradient="from-green-50 to-white"
              iconGradient="from-green-600 to-green-500"
            />
            <StatsCard
              title="معلمان"
              value={userStats.teachers}
              icon={BookOpen}
              gradient="from-green-100 to-green-50"
              iconGradient="from-green-600 to-green-500"
            />
            <StatsCard
              title="مدیران"
              value={userStats.admins}
              icon={Crown}
              gradient="from-green-50 to-white"
              iconGradient="from-green-500 to-green-400"
            />
            <StatsCard
              title="کل کاربران"
              value={userStats.total}
              icon={Users}
              gradient="from-green-100 to-green-50"
              iconGradient="from-green-600 to-green-500"
            />
          </div>

          {/* حضور و غیاب - کارت جدید */}
          <div className="bg-gradient-to-r from-green-400 to-green-300 rounded-2xl p-4 flex items-center justify-between shadow mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CalendarCheck className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg">حضور و غیاب</span>
              </div>
              <p className="text-white/90 text-xs mb-2">مدیریت و مشاهده وضعیت حضور و غیاب دانش‌آموزان</p>
              <button
                onClick={() => window.location.href = '/admin/attendances'}
                className="bg-white text-green-700 px-4 py-1 rounded-xl font-bold text-xs shadow hover:bg-green-50 transition"
              >
                ورود به بخش حضور و غیاب
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-6">
            <ActionCard
              title="افزودن کاربر جدید"
              description="ثبت دانش‌آموز، معلم یا مدیر"
              icon={UserPlus}
              gradient="from-green-600 to-green-500"
              onClick={() => setShowCreateUser(true)}
            />
            <ActionCard
              title="مشاهده گزارش‌ها"
              description="آمار و تحلیل‌های کامل"
              icon={BarChart3}
              gradient="from-green-500 to-green-400"
              onClick={() => window.location.href = '/admin/reports'}
            />
            <ActionCard
              title="مدیریت سیستم"
              description="تنظیمات و پیکربندی"
              icon={Settings}
              gradient="from-green-400 to-green-300"
              onClick={() => window.location.href = '/admin/settings'}
            />
          </div>

          {/* Users Table / Cards */}
          <UsersTable 
            users={users} 
            loading={loading} 
            onRefresh={fetchUsers} 
            onDeleteUser={confirmDelete}
            onEditUser={openEditModal}
          />

          {/* Recent Activity */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl border border-green-200">
            <h3 className="text-base sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-8 flex items-center">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center ml-2 sm:ml-3">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              فعالیت‌های اخیر
            </h3>
            <div className="space-y-2 sm:space-y-4">
              <ActivityItem text="سیستم مدیریت راه‌اندازی شد" time="امروز" />
              <ActivityItem text="پنل ادمین آماده استفاده است" time="5 دقیقه پیش" />
            </div>
          </div>
        </main>
      </div>
      {/* Modals (بدون تغییر) */}
      {showCreateUser && (
        <CreateUserModal 
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            setShowCreateUser(false);
            fetchUsers();
            fetchUserStats();
          }}
        />
      )}
      {showEditUser && userToEdit && (
        <EditUserModal 
          user={userToEdit}
          onClose={() => {
            setShowEditUser(false);
            setUserToEdit(null);
          }}
          onSuccess={() => {
            setShowEditUser(false);
            setUserToEdit(null);
            fetchUsers();
            fetchUserStats();
          }}
        />
      )}
      {showDeleteConfirm && userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onConfirm={executeDelete}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setUserToDelete(null);
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, gradient, iconGradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg`}>
      <div className="flex items-center justify-between mb-2 sm:mb-6">
        <div className={`w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-r ${iconGradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
        </div>
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
      </div>
      <div>
        <p className="text-lg sm:text-4xl font-bold text-gray-800 mb-0.5 sm:mb-2">{value.toLocaleString('fa-IR')}</p>
        <p className="text-xs sm:text-base text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, icon: Icon, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r ${gradient} text-white rounded-2xl sm:rounded-3xl p-3 sm:p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-right relative overflow-hidden group`}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 sm:mb-6">
          <div className="w-8 h-8 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-lg rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
            <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
          </div>
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white/70" />
        </div>
        <h4 className="text-sm sm:text-xl font-bold mb-1 sm:mb-3">{title}</h4>
        <p className="text-xs sm:text-white/90">{description}</p>
      </div>
    </button>
  );
}

// Activity Item Component
function ActivityItem({ text, time }) {
  return (
    <div className="flex items-center gap-2 sm:gap-4 p-2 sm:p-4 rounded-2xl hover:bg-green-50 transition-all duration-300 backdrop-blur-lg">
      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-green-600 to-green-400 rounded-full shadow-lg"></div>
      <div className="flex-1">
        <p className="text-xs sm:text-base text-gray-700 font-medium">{text}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  );
}

// Users Table Component
function UsersTable({ users, loading, onRefresh, onDeleteUser, onEditUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(user => 
    user.firstName?.includes(searchTerm) || 
    user.lastName?.includes(searchTerm) || 
    user.nationalCode?.includes(searchTerm)
  );

  // موبایل: کارت، دسکتاپ: جدول
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-green-200">
      <div className="p-3 sm:p-8 border-b border-green-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-6 gap-2 sm:gap-0">
          <h3 className="text-base sm:text-2xl font-bold text-gray-800 flex items-center">
            <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center mr-2 sm:mr-3">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            لیست کاربران ({filteredUsers.length})
          </h3>
          <button
            onClick={onRefresh}
            className="flex items-center px-3 py-1.5 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs sm:text-base"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بروزرسانی
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در کاربران..."
            className="w-full pr-8 pl-3 py-2 sm:py-4 border border-green-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300 text-xs sm:text-base"
          />
          <Users className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-green-50 backdrop-blur-lg">
            <tr>
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700">کاربر</th>
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700">کد ملی</th>
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700">نقش</th>
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700">وضعیت</th>
              <th className="px-8 py-4 text-right text-sm font-bold text-gray-700">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500">در حال بارگذاری...</p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <Users className="w-16 h-16 text-gray-400 mb-4" />
                    <p className="text-gray-500">کاربری یافت نشد</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-green-50 transition-all duration-300">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-base">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-base">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-mono bg-green-100 px-3 py-2 rounded-xl text-sm shadow-sm text-green-600">
                      {user.nationalCode}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${
                      user.role === 'admin' ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' :
                      user.role === 'teacher' ? 'bg-gradient-to-r from-green-500 to-green-400 text-white' :
                      'bg-gradient-to-r from-green-100 to-green-50 text-green-600 border border-green-200'
                    }`}>
                      {user.role === 'admin' ? 'مدیر' : 
                       user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-4 py-2 text-sm font-bold rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg">
                      فعال
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onEditUser(user)}
                        className="p-3 text-green-600 hover:bg-green-100 rounded-xl transition-all duration-300 hover:scale-110 group"
                      >
                        <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user)}
                        className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 group"
                      >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="sm:hidden p-2 space-y-2">
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-xs">در حال بارگذاری...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center py-8">
            <Users className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-gray-500 text-xs">کاربری یافت نشد</p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <div key={user.id || index} className="rounded-xl border border-green-100 bg-green-50 shadow-sm p-2 flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow">
                <span className="text-white font-bold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-800 text-xs">{user.firstName} {user.lastName}</span>
                  <span className="text-[10px] text-gray-400">{user.phone}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="font-mono bg-green-100 px-2 py-0.5 rounded text-[10px] text-green-600">{user.nationalCode}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full shadow ${
                    user.role === 'admin' ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' :
                    user.role === 'teacher' ? 'bg-gradient-to-r from-green-500 to-green-400 text-white' :
                    'bg-gradient-to-r from-green-100 to-green-50 text-green-600 border border-green-200'
                  }`}>
                    {user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-green-600 to-green-500 text-white shadow">فعال</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => onEditUser(user)}
                  className="p-1 text-green-600 hover:bg-green-100 rounded transition-all"
                  title="ویرایش"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDeleteUser(user)}
                  className="p-1 text-red-600 hover:bg-red-100 rounded transition-all"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}