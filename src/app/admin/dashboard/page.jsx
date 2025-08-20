'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Eye, EyeOff, Trash2, Edit, Search, X, AlertCircle,
  Menu, Calendar, Clock, Crown, Target, 
  RefreshCw, ChevronLeft, Activity, Sparkles, TrendingUp, Zap
} from 'lucide-react';
import { Image, Calendar as CalendarIcon, LayoutGrid, GalleryHorizontalEnd } from 'lucide-react';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: CalendarIcon, href: '/admin/weekly_schedule' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'گزارش‌ها', icon: BarChart3, href: '/admin/reports' },
  { label: 'تنظیمات', icon: Settings, href: '/admin/settings' }
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
      <div className="flex">
        {/* Sidebar - Fixed on right */}
        <aside className=" right-0 top-25 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-200">
          <div className="p-6 bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">پنل مدیریت</h2>
                  <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
                </div>
              </div>
              {/* Quick Stats in Sidebar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{userStats.students}</p>
                  <p className="text-xs text-white/80">دانش‌آموز</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">{userStats.teachers}</p>
                  <p className="text-xs text-white/80">معلم</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
              <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = window.location.pathname === item.href;
              return (
                <button
                  key={item.label}
                  onClick={() => (window.location.href = item.href)}
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

        {/* Main Content - with margin for sidebar */}
        <main className="flex-1 p-6 space-y-8">
          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    سلام {user?.firstName} عزیز! 🌟
                  </h2>
                  <p className="text-white/90 mb-6 text-lg">به پنل مدیریت هوشمند مدرسه علم و هنر خوش آمدید</p>
                  <div className="flex items-center space-x-6 text-white/80">
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
                <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                  <Crown className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {/* Users Table */}
          <UsersTable 
            users={users} 
            loading={loading} 
            onRefresh={fetchUsers} 
            onDeleteUser={confirmDelete}
            onEditUser={openEditModal}
          />

          {/* Recent Activity */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-green-200">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center ml-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              فعالیت‌های اخیر
            </h3>
            <div className="space-y-4">
              <ActivityItem text="سیستم مدیریت راه‌اندازی شد" time="امروز" />
              <ActivityItem text="پنل ادمین آماده استفاده است" time="5 دقیقه پیش" />
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
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
    <div className={`bg-gradient-to-br ${gradient} rounded-3xl p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`w-14 h-14 bg-gradient-to-r ${iconGradient} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <Sparkles className="w-5 h-5 text-green-600" />
      </div>
      <div>
        <p className="text-4xl font-bold text-gray-800 mb-2">{value.toLocaleString('fa-IR')}</p>
        <p className="text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ title, description, icon: Icon, gradient, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-r ${gradient} text-white rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-right relative overflow-hidden group`}
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

// Users Table Component
function UsersTable({ users, loading, onRefresh, onDeleteUser, onEditUser }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredUsers = users.filter(user => 
    user.firstName?.includes(searchTerm) || 
    user.lastName?.includes(searchTerm) || 
    user.nationalCode?.includes(searchTerm)
  );

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden border border-green-200">
      <div className="p-8 border-b border-green-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800 flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-white" />
            </div>
            لیست کاربران ({filteredUsers.length})
          </h3>
          <button
            onClick={onRefresh}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بروزرسانی
          </button>
        </div>
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در کاربران..."
            className="w-full pr-12 pl-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
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
                        <span className="text-white font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">
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
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-2xl border border-red-200">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">تأیید حذف کاربر</h2>
                <p className="text-white/80">این عمل غیرقابل بازگشت است</p>
              </div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              آیا مطمئن هستید که می‌خواهید کاربر زیر را حذف کنید؟
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.role === 'admin' ? 'مدیر' : 
                     user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'} | 
                    کد ملی: {user.nationalCode}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
                <p className="text-sm text-red-700 font-medium">
                  هشدار: تمام اطلاعات مربوط به این کاربر برای همیشه حذف خواهد شد.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              onClick={onCancel}
              className="px-8 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-all duration-300 font-medium"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              حذف کاربر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create User Modal Component
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalCode: '',
    phone: '',
    email: '',
    role: 'student',
    grade: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data?.success || response.ok) {
        alert(`کاربر با موفقیت ایجاد شد!\n\nنام کاربری: ${formData.nationalCode}\nرمز عبور: ${formData.password}`);
        onSuccess();
      } else {
        setError(data?.message || 'خطا در ایجاد کاربر');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">افزودن کاربر جدید</h2>
                  <p className="text-white/80">ایجاد حساب کاربری</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">نوع کاربر</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              required
            >
              <option value="student">🎓 دانش‌آموز</option>
              <option value="teacher">📚 معلم</option>
              <option value="admin">👑 مدیر</option>
            </select>
          </div>
          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">پایه</label>
              <select
                value={formData.grade || ''}
                onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              >
                <option value="">انتخاب پایه</option>
                <option value="اول ابتدایی">اول ابتدایی</option>
                <option value="دوم ابتدایی">دوم ابتدایی</option>
                <option value="سوم ابتدایی">سوم ابتدایی</option>
                <option value="چهارم ابتدایی">چهارم ابتدایی</option>
                <option value="پنجم ابتدایی">پنجم ابتدایی</option>
                <option value="ششم ابتدایی">ششم ابتدایی</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">نام</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">نام خانوادگی</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">کد ملی</label>
            <input
              type="text"
              value={formData.nationalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 font-mono bg-green-50 backdrop-blur-lg transition-all duration-300"
              maxLength="10"
              placeholder="1234567890"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">شماره موبایل</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              placeholder="09123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">ایمیل</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              placeholder="example@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-4 pl-24 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-green-100 transition-all duration-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-1 text-xs bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg"
                >
                  تولید
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-green-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-green-100 text-gray-700 rounded-2xl hover:bg-green-200 transition-all duration-300 font-medium"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
               {isLoading ? 'در حال ایجاد...' : 'ایجاد کاربر'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    nationalCode: user.nationalCode || '',
    phone: user.phone || '',
    email: user.email || '',
    role: user.role || 'student',
    grade: user.grade || '',
    password: '',
    changePassword: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage?.getItem?.('token');
      const submitData = { ...formData };
      if (!formData.changePassword) {
        delete submitData.password;
      }
      delete submitData.changePassword;
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });
      const data = await response.json();
      if (data?.success || response.ok) {
        alert('کاربر با موفقیت ویرایش شد!');
        onSuccess();
      } else {
        setError(data?.message || 'خطا در ویرایش کاربر');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-8 rounded-t-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">ویرایش کاربر</h2>
                  <p className="text-white/80">ویرایش اطلاعات کاربری</p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-all duration-300 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">نوع کاربر</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              required
            >
              <option value="student">🎓 دانش‌آموز</option>
              <option value="teacher">📚 معلم</option>
              <option value="admin">👑 مدیر</option>
            </select>
          </div>
          {formData.role === 'student' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">پایه</label>
              <select
                value={formData.grade || ''}
                onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              >
                <option value="">انتخاب پایه</option>
                <option value="اول ابتدایی">اول ابتدایی</option>
                <option value="دوم ابتدایی">دوم ابتدایی</option>
                <option value="سوم ابتدایی">سوم ابتدایی</option>
                <option value="چهارم ابتدایی">چهارم ابتدایی</option>
                <option value="پنجم ابتدایی">پنجم ابتدایی</option>
                <option value="ششم ابتدایی">ششم ابتدایی</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">نام</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">نام خانوادگی</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">کد ملی</label>
            <input
              type="text"
              value={formData.nationalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 font-mono bg-green-50 backdrop-blur-lg transition-all duration-300"
              maxLength="10"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">شماره موبایل</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              placeholder="09123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">ایمیل</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-4 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
              placeholder="example@email.com"
            />
          </div>
          <div className="border-t border-green-200 pt-6">
            <div className="flex items-center mb-3">
              <input
                type="checkbox"
                id="changePassword"
                checked={formData.changePassword}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  changePassword: e.target.checked,
                  password: e.target.checked ? prev.password : ''
                }))}
                className="rounded border-green-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="changePassword" className="mr-2 text-sm font-bold text-gray-700">
                تغییر رمز عبور
              </label>
            </div>
            {formData.changePassword && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">رمز عبور جدید</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-4 pl-24 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                    required={formData.changePassword}
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-green-100 transition-all duration-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-1 text-xs bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg"
                    >
                      تولید
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-end space-x-4 rtl:space-x-reverse pt-6 border-t border-green-200">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-green-100 text-gray-700 rounded-2xl hover:bg-green-200 transition-all duration-300 font-medium"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 disabled:opacity-50 font-medium shadow-lg hover:shadow-xl"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}