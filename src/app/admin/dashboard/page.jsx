'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Eye, EyeOff, Trash2, Edit, Search, Filter, X, AlertCircle, CheckCircle,
  Menu, Bell, Calendar, Clock, TrendingUp, Award, FileText, Home,
  ChevronDown, Plus, MoreVertical, Star, Image, Loader2, Upload,
  FolderPlus, ChevronRight, Pencil 
} from 'lucide-react';


export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userStats, setUserStats] = useState({
    students: 0,
    teachers: 0,
    admins: 0,
    total: 0
  });


  const handleNavigation = (tab) => {
  if (tab === 'overview') {
    setActiveTab(tab); // فقط در داشبورد باقی می‌ماند
  } else {
    // برای باقی تب‌ها به صفحات جداگانه می‌رود
    const routes = {
      users: '/admin/users',
      classes: '/admin/classes',
      gallery: '/admin/gallery', // اضافه کردن route گالری
      schedule: '/admin/weekly_schedule',
      reports: '/admin/reports',
      settings: '/admin/settings'
    };
    
    const targetRoute = routes[tab];
    if (targetRoute) {
      window.location.href = targetRoute;
    }
  }
};

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

  // دریافت آمار کاربران
  useEffect(() => {
    if (user) {
      fetchUserStats();
      if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [activeTab, user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
  { id: 'overview', label: 'داشبورد', icon: Home, color: 'blue' },
  { id: 'users', label: 'مدیریت کاربران', icon: Users, color: 'green' },
  { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap, color: 'purple' },
  { id: 'gallery', label: 'گالری تصاویر', icon: Image, color: 'pink' },
  { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'orange' },
  { id: 'reports', label: 'گزارش‌ها', icon: BarChart3, color: 'indigo' },
  { id: 'settings', label: 'تنظیمات', icon: Settings, color: 'gray' }
];

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
      {/* Sidebar */}
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
                onClick={() => handleNavigation(item.id)} // تغییر از setActiveTab به handleNavigation
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
                <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
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
              <h1 className="text-2xl font-bold text-gray-800">
                {activeTab === 'overview' && '📊 داشبورد'}
                {activeTab === 'users' && '👥 مدیریت کاربران'}
                {activeTab === 'classes' && '🎓 مدیریت کلاس‌ها'}
                {activeTab === 'gallery' && '🖼️ گالری تصاویر'}
                {activeTab === 'schedule' && '📅 برنامه هفتگی'}
                {activeTab === 'reports' && '📈 گزارش‌ها'}
                {activeTab === 'settings' && '⚙️ تنظیمات'}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString('fa-IR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                <Bell className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="text-right">
                <p className="text-sm text-gray-500">خوش آمدید</p>
                <p className="font-semibold text-gray-800">{user?.firstName} {user?.lastName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          {activeTab === 'overview' && (
            <OverviewTab userStats={userStats} onRefreshStats={fetchUserStats} onCreateUser={() => setShowCreateUser(true)} />
          )}

          {activeTab === 'users' && (
            <UserManagement 
              users={users}
              loading={loading}
              showCreateUser={showCreateUser}
              setShowCreateUser={setShowCreateUser}
              onRefresh={() => {
                fetchUsers();
                fetchUserStats();
              }}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab userStats={userStats} />
          )}

          {activeTab === 'calendar' && (
            <CalendarTab />
          )}

          {activeTab === 'settings' && (
            <SettingsTab />
          )}
        </main>
      </div>
    </div>
  );
}

// کامپوننت داشبورد اصلی
function OverviewTab({ userStats, onRefreshStats, onCreateUser }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // دریافت فعالیت‌های اخیر از API
  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    setLoadingActivities(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecentActivities(data.activities || []);
      } else {
        // اگر API وجود ندارد، فعالیت‌های نمونه نشان بده
        setRecentActivities([
          {
            action: 'سیستم راه‌اندازی شد',
            user: 'سیستم',
            time: 'امروز',
            type: 'system'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setRecentActivities([
        {
          action: 'سیستم راه‌اندازی شد',
          user: 'سیستم',
          time: 'امروز',
          type: 'system'
        }
      ]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const stats = [
    {
      title: 'دانش‌آموزان',
      value: userStats.students,
      icon: GraduationCap,
      color: 'blue',
      change: userStats.students > 0 ? '+' + userStats.students : '0',
      trend: userStats.students > 0 ? 'up' : 'stable'
    },
    {
      title: 'معلمان',
      value: userStats.teachers,
      icon: BookOpen,
      color: 'green',
      change: userStats.teachers > 0 ? '+' + userStats.teachers : '0',
      trend: userStats.teachers > 0 ? 'up' : 'stable'
    },
    {
      title: 'مدیران',
      value: userStats.admins,
      icon: Star,
      color: 'purple',
      change: userStats.admins > 1 ? '+' + (userStats.admins - 1) : '0',
      trend: userStats.admins > 1 ? 'up' : 'stable'
    },
    {
      title: 'کل کاربران',
      value: userStats.total,
      icon: Users,
      color: 'orange',
      change: userStats.total > 1 ? '+' + (userStats.total - 1) : '0',
      trend: userStats.total > 1 ? 'up' : 'stable'
    }
  ];

  return (
    <div className="space-y-8">
      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                  stat.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                  stat.color === 'green' ? 'bg-gradient-to-r from-green-400 to-green-600' :
                  stat.color === 'purple' ? 'bg-gradient-to-r from-purple-400 to-purple-600' :
                  'bg-gradient-to-r from-orange-400 to-orange-600'
                }`}>
                  <IconComponent className="w-7 h-7 text-white" />
                </div>
                <div className={`flex items-center space-x-1 text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-gray-500'}`}>
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change}</span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</p>
                <p className="text-gray-600 font-medium">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* اقدامات سریع و فعالیت‌های اخیر */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* اقدامات سریع */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <Award className="w-6 h-6 text-yellow-500 ml-2" />
            اقدامات سریع
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={onCreateUser}
              className="flex flex-col items-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-300 border border-green-200 group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-green-800">افزودن کاربر</p>
              <p className="text-sm text-green-600 text-center mt-1">ثبت کاربر جدید</p>
            </button>

            <button className="flex flex-col items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 border border-blue-200 group">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-blue-800">گزارش جدید</p>
              <p className="text-sm text-blue-600 text-center mt-1">تولید گزارش</p>
            </button>

            <button
              onClick={onRefreshStats}
              className="flex flex-col items-center p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl hover:from-purple-100 hover:to-violet-100 transition-all duration-300 border border-purple-200 group"
            >
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-purple-800">بروزرسانی آمار</p>
              <p className="text-sm text-purple-600 text-center mt-1">تازه‌سازی داده‌ها</p>
            </button>

            <button className="flex flex-col items-center p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl hover:from-orange-100 hover:to-amber-100 transition-all duration-300 border border-orange-200 group">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <p className="font-semibold text-orange-800">تنظیمات</p>
              <p className="text-sm text-orange-600 text-center mt-1">پیکربندی سیستم</p>
            </button>
          </div>
        </div>

        {/* فعالیت‌های اخیر */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <Clock className="w-6 h-6 text-blue-500 ml-2" />
              فعالیت‌های اخیر
            </h3>
            <button
              onClick={fetchRecentActivities}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loadingActivities}
            >
              <BarChart3 className={`w-4 h-4 text-gray-500 ${loadingActivities ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="space-y-4">
            {loadingActivities ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                <span className="text-gray-500">در حال بارگذاری...</span>
              </div>
            ) : recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ml-4 ${
                    activity.type === 'student' ? 'bg-blue-100' :
                    activity.type === 'teacher' ? 'bg-green-100' :
                    activity.type === 'admin' ? 'bg-purple-100' : 'bg-orange-100'
                  }`}>
                    {activity.type === 'student' && <GraduationCap className="w-5 h-5 text-blue-600" />}
                    {activity.type === 'teacher' && <BookOpen className="w-5 h-5 text-green-600" />}
                    {activity.type === 'admin' && <Settings className="w-5 h-5 text-purple-600" />}
                    {activity.type === 'system' && <Award className="w-5 h-5 text-orange-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user || 'سیستم'}</p>
                  </div>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">هنوز فعالیتی ثبت نشده</p>
                <p className="text-sm text-gray-400">فعالیت‌های سیستم در اینجا نمایش داده می‌شود</p>
              </div>
            )}
          </div>

          {/* اطلاعات سیستم */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">{userStats.total}</p>
                <p className="text-sm text-gray-500">کاربران فعال</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {new Date().toLocaleDateString('fa-IR', { day: 'numeric' })}
                </p>
                <p className="text-sm text-gray-500">روز جاری</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت مدیریت کاربران
function UserManagement({ users, loading, showCreateUser, setShowCreateUser, onRefresh }) {
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = user.firstName?.includes(searchTerm) || 
                         user.lastName?.includes(searchTerm) || 
                         user.nationalCode?.includes(searchTerm);
    return matchesRole && matchesSearch;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">مدیریت کاربران</h1>
        <button
          onClick={() => setShowCreateUser(true)}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 ml-2" />
          افزودن کاربر جدید
        </button>
      </div>

      {/* فیلترها */}
      <div className="bg-white rounded-xl p-6 shadow-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">جستجو</label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="نام، نام خانوادگی یا کد ملی"
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع کاربر</label>
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="all">همه کاربران</option>
                <option value="student">دانش‌آموزان</option>
                <option value="teacher">معلمان</option>
                <option value="admin">مدیران</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* جدول کاربران */}
      <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کاربر</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">کد ملی</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نقش</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin ml-2"></div>
                      در حال بارگذاری...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    هنوز کاربری ثبت نشده است
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                          </span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {user.nationalCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'مدیر' : 
                         user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        فعال
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse">
                        <button 
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="ویرایش"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* مودال ایجاد کاربر */}
      {showCreateUser && (
        <CreateUserModal 
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            setShowCreateUser(false);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}

// کامپوننت مودال ایجاد کاربر
function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalCode: '',
    phone: '',
    email: '',
    role: 'student',
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
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`کاربر با موفقیت ایجاد شد!\n\nنام کاربری: ${data.user.nationalCode}\nرمز عبور: ${formData.password}`);
        onSuccess();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('خطا در ایجاد کاربر');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b bg-gradient-to-r from-green-500 to-blue-600">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">افزودن کاربر جدید</h2>
            <button onClick={onClose} className="text-white hover:text-gray-200">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع کاربر</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="student">دانش‌آموز</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدیر</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">کد ملی</label>
            <input
              type="text"
              value={formData.nationalCode}
              onChange={(e) => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              maxLength="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="09123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-2 pl-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600"
                >
                  تولید
                </button>
              </div>
            </div>
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
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
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

// کامپوننت‌های باقی تب‌ها
function ReportsTab({ userStats }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">گزارش‌ها</h2>
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <p className="text-gray-600">گزارش‌ها در حال توسعه است...</p>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="font-bold text-blue-800">کل کاربران: {userStats.total}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-bold text-green-800">دانش‌آموزان: {userStats.students}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">تقویم</h2>
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <p className="text-gray-600">تقویم در حال توسعه است...</p>
      </div>
    </div>
  );
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">تنظیمات</h2>
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <p className="text-gray-600">تنظیمات در حال توسعه است...</p>
      </div>
    </div>
  );
}



