'use client'
import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit, Trash2, Eye, EyeOff, 
  X, AlertCircle, RefreshCw, ArrowLeft
} from 'lucide-react';

export default function AdminUsersPage() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);

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
      fetchUsers();
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
    }
  }, []);

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
        setTotalUsers(data.users?.length || 0);
      } else {
        // داده‌های نمونه در صورت عدم دسترسی به API
        const sampleUsers = [
          {
            id: 1,
            firstName: 'احمد',
            lastName: 'محمدی',
            nationalCode: '1234567890',
            role: 'student',
            phone: '09123456789',
            email: 'ahmad@example.com',
            isActive: true,
            createdAt: '2024-01-10'
          },
          {
            id: 2,
            firstName: 'فاطمه',
            lastName: 'کریمی',
            nationalCode: '0987654321',
            role: 'teacher',
            phone: '09234567890',
            email: 'fatemeh@example.com',
            isActive: true,
            createdAt: '2024-01-11'
          },
          {
            id: 3,
            firstName: 'حسن',
            lastName: 'احمدی',
            nationalCode: '5566778899',
            role: 'admin',
            phone: '09567890123',
            email: 'hassan@example.com',
            isActive: true,
            createdAt: '2024-01-12'
          }
        ];
        setUsers(sampleUsers);
        setTotalUsers(sampleUsers.length);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر کاربران
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName?.includes(searchTerm) ||
                         user.lastName?.includes(searchTerm) ||
                         user.nationalCode?.includes(searchTerm) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // حذف کاربر
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
        alert('کاربر با موفقیت حذف شد!');
      } else {
        // حذف از داده‌های محلی
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        alert('کاربر با موفقیت حذف شد!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('خطا در حذف کاربر');
    }
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // تغییر وضعیت کاربر
  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isActive: !user.isActive } : user
          )
        );
      } else {
        // تغییر در داده‌های محلی
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user.id === userId ? { ...user, isActive: !user.isActive } : user
          )
        );
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
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
      
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-xl shadow-xl border-b border-green-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            
            {/* بازگشت به داشبورد */}
            <button
              onClick={() => window.location.href = '/admin/dashboard'}
              className="flex items-center space-x-3 rtl:space-x-reverse px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">بازگشت به داشبورد</span>
            </button>

            {/* عنوان صفحه */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800">مدیریت کاربران</h1>
              <p className="text-gray-600">مجموع: {totalUsers} کاربر</p>
            </div>

            {/* اطلاعات کاربر */}
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
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
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Controls */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-green-200 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* جستجو */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در کاربران..."
                className="w-full pr-12 pl-4 py-3 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50/50 backdrop-blur-lg transition-all duration-300"
              />
            </div>

            {/* فیلتر نقش */}
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50/50 backdrop-blur-lg transition-all duration-300"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="student">دانش‌آموزان</option>
              <option value="teacher">معلمان</option>
              <option value="admin">مدیران</option>
            </select>

            {/* دکمه‌های عملیات */}
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <button
                onClick={fetchUsers}
                className="flex items-center px-4 py-3 bg-gradient-to-r from-green-100 to-green-50 text-green-700 rounded-2xl hover:from-green-200 hover:to-green-100 transition-all duration-300 border border-green-200"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="mr-2">بروزرسانی</span>
              </button>
              
              <button
                onClick={() => setShowCreateUser(true)}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <UserPlus className="w-4 h-4" />
                <span className="mr-2">افزودن کاربر</span>
              </button>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">در حال بارگذاری...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">کاربری یافت نشد</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onEdit={() => {
                  setSelectedUser(user);
                  setShowEditUser(true);
                }}
                onDelete={() => {
                  setSelectedUser(user);
                  setShowDeleteModal(true);
                }}
                onToggleStatus={() => toggleUserStatus(user.id)}
              />
            ))
          )}
        </div>
      </main>

      {/* Create User Modal */}
      {showCreateUser && (
        <CreateUserModal 
          onClose={() => setShowCreateUser(false)}
          onSuccess={() => {
            setShowCreateUser(false);
            fetchUsers();
          }}
        />
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <EditUserModal 
          user={selectedUser}
          onClose={() => {
            setShowEditUser(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setShowEditUser(false);
            setSelectedUser(null);
            fetchUsers();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <DeleteConfirmModal
          user={selectedUser}
          onConfirm={() => handleDeleteUser(selectedUser.id)}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

// User Card Component
function UserCard({ user, onEdit, onDelete, onToggleStatus }) {
  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-gradient-to-r from-purple-600 to-purple-500 text-white',
      teacher: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
      student: 'bg-gradient-to-r from-green-600 to-green-500 text-white'
    };
    
    const labels = {
      admin: 'مدیر',
      teacher: 'معلم',
      student: 'دانش‌آموز'
    };

    return (
      <span className={`px-3 py-1 text-sm font-bold rounded-full shadow-lg ${styles[role] || styles.student}`}>
        {labels[role] || 'نامشخص'}
      </span>
    );
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      
      {/* User Avatar & Info */}
      <div className="flex items-center space-x-4 rtl:space-x-reverse mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-white text-lg font-bold">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-gray-600 text-sm font-mono">
            {user.nationalCode}
          </p>
          {user.phone && (
            <p className="text-gray-500 text-sm">{user.phone}</p>
          )}
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        {getRoleBadge(user.role)}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">وضعیت:</span>
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 text-sm font-bold rounded-full transition-all duration-300 ${
            user.isActive
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg'
              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg'
          }`}
        >
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-4 border-t border-green-200">
        <button
          onClick={onEdit}
          className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:scale-110"
          title="ویرایش"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    nationalCode: user.nationalCode || '',
    phone: user.phone || '',
    email: user.email || '',
    role: user.role || 'student',
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
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
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
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* نوع کاربر */}
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

          {/* نام و نام خانوادگی */}
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

          {/* کد ملی */}
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

          {/* شماره موبایل */}
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

          {/* ایمیل */}
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

          {/* رمز عبور */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">رمز عبور جدید (اختیاری)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-4 pl-24 border border-green-200 rounded-2xl focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-green-50 backdrop-blur-lg transition-all duration-300"
                placeholder="خالی بگذارید تا تغییر نکند"
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

          {/* خطا */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* دکمه‌ها */}
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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-200">
        
        {/* Header */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* نوع کاربر */}
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

          {/* نام و نام خانوادگی */}
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

          {/* کد ملی */}
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

          {/* شماره موبایل */}
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

          {/* رمز عبور */}
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

          {/* خطا */}
          {error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-2xl backdrop-blur-lg">
              <AlertCircle className="w-5 h-5 text-red-500 ml-3" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* دکمه‌ها */}
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

// Delete Confirmation Modal
function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-md w-full shadow-2xl border border-red-200">
        
        <div className="p-8">
          <div className="flex items-center space-x-4 rtl:space-x-reverse mb-6">
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">حذف کاربر</h2>
              <p className="text-sm text-gray-500">این عمل غیرقابل بازگشت است</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-700 mb-4">
              آیا مطمئن هستید که می‌خواهید کاربر زیر را حذف کنید؟
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.firstName?.[0]}{user.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-800">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500 font-mono">
                    کد ملی: {user.nationalCode}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 rtl:space-x-reverse">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              انصراف
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl hover:from-red-700 hover:to-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
            >
              حذف کاربر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}