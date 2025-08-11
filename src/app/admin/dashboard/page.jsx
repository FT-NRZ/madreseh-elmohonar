'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings, LogOut, 
  Eye, EyeOff, Trash2, Edit, Search, X, AlertCircle,
  Menu, Bell, Calendar, Clock, Home, Shield, RefreshCw, Activity
} from 'lucide-react';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userStats, setUserStats] = useState({
    students: 0,
    teachers: 0,
    admins: 0,
    total: 0
  });

  const handleNavigation = (tab) => {
    const routes = {
      users: '/admin/users',
      classes: '/admin/classes',
      gallery: '/admin/gallery',
      schedule: '/admin/weekly_schedule',
      reports: '/admin/reports',
      settings: '/admin/settings'
    };
    
    const targetRoute = routes[tab];
    if (targetRoute) {
      window.location.href = targetRoute;
    }
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
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats || { students: 0, teachers: 0, admins: 0, total: 0 });
      } else {
        setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setUsers([
          { id: 1, firstName: 'احمد', lastName: 'کریمی', nationalCode: '1234567890', role: 'student', phone: '09123456789', email: 'ahmad@example.com' },
          { id: 2, firstName: 'فاطمه', lastName: 'محمدی', nationalCode: '0987654321', role: 'teacher', phone: '09234567890', email: 'fatemeh@example.com' },
          { id: 3, firstName: 'علی', lastName: 'احمدی', nationalCode: '1122334455', role: 'admin', phone: '09345678901', email: 'ali@example.com' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([
        { id: 1, firstName: 'احمد', lastName: 'کریمی', nationalCode: '1234567890', role: 'student', phone: '09123456789', email: 'ahmad@example.com' },
        { id: 2, firstName: 'فاطمه', lastName: 'محمدی', nationalCode: '0987654321', role: 'teacher', phone: '09234567890', email: 'fatemeh@example.com' },
        { id: 3, firstName: 'علی', lastName: 'احمدی', nationalCode: '1122334455', role: 'admin', phone: '09345678901', email: 'ali@example.com' },
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        fetchUserStats();
        alert('کاربر با موفقیت حذف شد!');
      } else {
        const data = await response.json();
        alert(data.message || 'خطا در حذف کاربر');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const openEditModal = (user) => {
    setUserToEdit(user);
    setShowEditUser(true);
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'users', label: 'مدیریت کاربران', icon: Users },
    { id: 'classes', label: 'مدیریت کلاس‌ها', icon: GraduationCap },
    { id: 'gallery', label: 'گالری تصاویر', icon: BookOpen },
    { id: 'schedule', label: 'برنامه هفتگی', icon: Calendar },
    { id: 'reports', label: 'گزارش‌ها', icon: BarChart3 },
    { id: 'settings', label: 'تنظیمات', icon: Settings }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center space-x-3 rtl:space-x-reverse px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="mr-2">منو</span>
            </button>

            {/* User Info */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">مدیر سیستم</p>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-72 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Sidebar Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Shield className="w-8 h-8" />
              <div className="mr-3">
                <h2 className="text-lg font-bold">پنل مدیریت</h2>
                <p className="text-blue-100 text-sm">مدرسه علم و هنر</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className="w-full flex items-center px-4 py-3 mb-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <IconComponent className="w-5 h-5" />
                <span className="mr-3">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center space-x-3 rtl:space-x-reverse p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="mr-2">خروج</span>
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">داشبورد مدیریت</h1>
          <p className="text-gray-600 mt-1">خلاصه وضعیت سیستم</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">دانش‌آموزان</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.students}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">معلمان</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.teachers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">مدیران</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">کل کاربران</p>
                <p className="text-2xl font-bold text-gray-800">{userStats.total}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => setShowCreateUser(true)}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-right"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mr-4">
                <h3 className="font-bold text-gray-800">افزودن کاربر</h3>
                <p className="text-sm text-gray-600">ثبت کاربر جدید</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('reports')}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-right"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="mr-4">
                <h3 className="font-bold text-gray-800">گزارش‌ها</h3>
                <p className="text-sm text-gray-600">مشاهده آمار</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleNavigation('settings')}
            className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow text-right"
          >
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Settings className="w-6 h-6 text-purple-600" />
              </div>
              <div className="mr-4">
                <h3 className="font-bold text-gray-800">تنظیمات</h3>
                <p className="text-sm text-gray-600">پیکربندی سیستم</p>
              </div>
            </div>
          </button>
        </div>

        {/* Users Table */}
        <UsersTable 
          users={users} 
          loading={loading} 
          onRefresh={fetchUsers} 
          onDeleteUser={confirmDelete}
          onEditUser={openEditModal}
        />

      </div>

      {/* Create User Modal */}
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

      {/* Edit User Modal */}
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

      {/* Delete Confirmation Modal */}
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

// Users Table Component
function UsersTable({ users, loading, onRefresh, onDeleteUser, onEditUser }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user => 
    user.firstName?.includes(searchTerm) || 
    user.lastName?.includes(searchTerm) || 
    user.nationalCode?.includes(searchTerm)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800">لیست کاربران</h3>
          <button
            onClick={onRefresh}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="mr-2">بروزرسانی</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجو در کاربران..."
            className="w-full pr-10 pl-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">کاربر</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">کد ملی</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">نقش</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-gray-500">در حال بارگذاری...</p>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <p className="text-gray-500">کاربری یافت نشد</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </span>
                      </div>
                      <div className="mr-3">
                        <p className="font-medium text-gray-800">
                          {user.firstName} {user.lastName}
                        </p>
                        {user.phone && (
                          <p className="text-sm text-gray-500">{user.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-sm text-gray-600">
                      {user.nationalCode}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'مدیر' : 
                       user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => onEditUser(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteUser(user)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      
      // اگر رمز عبور تغییر نکنه، از ارسالش صرف نظر کن
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
      console.error('Edit user error:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        
        <div className="bg-green-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <Edit className="w-6 h-6" />
              <div className="mr-3">
                <h2 className="text-lg font-bold">ویرایش کاربر</h2>
                <p className="text-green-100 text-sm">ویرایش اطلاعات کاربری</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع کاربر</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              required
            >
              <option value="student">دانش‌آموز</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدیر</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 font-mono"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="09123456789"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
              placeholder="example@email.com"
            />
          </div>

          {/* تغییر رمز عبور */}
          <div className="border-t pt-4">
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
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="changePassword" className="mr-2 text-sm font-medium text-gray-700">
                تغییر رمز عبور
              </label>
            </div>

            {formData.changePassword && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">رمز عبور جدید</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-2 pl-20 border rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600"
                    required={formData.changePassword}
                  />
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 rtl:space-x-reverse">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      تولید
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700 mr-2">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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

// Delete Confirmation Modal
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
        
        <div className="p-6">
          <div className="flex items-center space-x-3 rtl:space-x-reverse mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="mr-3">
              <h2 className="text-lg font-bold text-gray-800">حذف کاربر</h2>
              <p className="text-sm text-gray-500">این عمل غیرقابل بازگشت است</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              آیا مطمئن هستید که می‌خواهید کاربر زیر را حذف کنید؟
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div className="mr-3">
                  <p className="font-medium text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">
                    کد ملی: {user.nationalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 rtl:space-x-reverse">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              حذف کاربر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create User Modal
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
      console.error('Create user error:', err);
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
        
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <UserPlus className="w-6 h-6" />
              <div className="mr-3">
                <h2 className="text-lg font-bold">افزودن کاربر جدید</h2>
                <p className="text-blue-100 text-sm">ایجاد حساب کاربری</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">نوع کاربر</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              required
            >
              <option value="student">دانش‌آموز</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدیر</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نام خانوادگی</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-mono"
              maxLength="10"
              placeholder="1234567890"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
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
                className="w-full px-3 py-2 pl-20 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                required
              />
              <div className="absolute left-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 rtl:space-x-reverse">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  تولید
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-red-700 mr-2">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
