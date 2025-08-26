'use client'
import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Edit, Trash2, Eye, EyeOff, X, AlertCircle,
  RefreshCw, ArrowLeft, GraduationCap, Calendar, BookOpen, BarChart3,
  Settings, LogOut, Image, LayoutGrid, NewspaperIcon, Target, // ← این خط را اضافه کن
  GalleryHorizontalEnd,
  CalendarCheck
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

  // سایدبار مشابه داشبورد مدیریت
  const sidebarMenu = [
    { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
    { label: 'مدیریت کاربران', icon: Users, href: '/admin/users', active: true },
    { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
    { label: 'برنامه هفتگی', icon: Calendar, href: '/admin/weekly_schedule' },
    { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
    { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
    { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
    { label: 'گزارش‌ها', icon: BarChart3, href: '/admin/reports' },
    { label: 'تنظیمات', icon: Settings, href: '/admin/settings' },
    { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' }
  ];

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
    } catch {
      window.location.href = '/login';
    }
  }, []);

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
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const search = searchTerm.trim();
    const matchesSearch = u.firstName?.includes(search) || u.lastName?.includes(search) || u.nationalCode?.includes(search) || u.phone?.includes(search);
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch {}
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(prev =>
        prev.map(u =>
          u.id === userId ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch {}
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
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
      <div className="flex">
        {/* Sidebar - ست شده با داشبورد مدیریت */}
        <aside className="right-0 top-0 w-72 bg-white shadow-lg border-l border-green-100">
          <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold">پنل مدیریت</h2>
                <p className="text-green-600 text-xs">مدرسه علم و هنر</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{users.filter(u => u.role === 'student').length}</p>
                <p className="text-xs text-green-600">دانش‌آموز</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-green-700">{users.filter(u => u.role === 'teacher').length}</p>
                <p className="text-xs text-green-600">معلم</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
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
        <main className="flex-1 p-6 space-y-8 bg-gradient-to-br from-green-50 to-white">

          {/* Controls */}
          <div className="max-w-4xl mx-auto px-4 py-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="جستجو..."
                className="w-full pr-10 pl-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-600 outline-none"
              />
            </div>
            <select
              value={filterRole}
              onChange={e => setFilterRole(e.target.value)}
              className="px-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-600 outline-none"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="student">دانش‌آموز</option>
              <option value="teacher">معلم</option>
              <option value="admin">مدیر</option>
            </select>
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl border border-green-200 hover:bg-green-200 transition"
            >
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </button>
            <button
              onClick={() => setShowCreateUser(true)}
              className="flex items-center w-35 h-12 gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
            >
              <UserPlus className="w-4 h-4" />
              افزودن کاربر
            </button>
          </div>

          {/* Users Grid */}
          <div className="max-w-4xl mx-auto px-4 pb-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">کاربری یافت نشد</p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <UserCard
                  key={u.id}
                  user={u}
                  onEdit={() => { setSelectedUser(u); setShowEditUser(true); }}
                  onDelete={() => { setSelectedUser(u); setShowDeleteModal(true); }}
                  onToggleStatus={() => toggleUserStatus(u.id)}
                />
              ))
            )}
          </div>

          {/* Create User Modal */}
          {showCreateUser && (
            <CreateUserModal
              onClose={() => setShowCreateUser(false)}
              onSuccess={() => { setShowCreateUser(false); fetchUsers(); }}
            />
          )}

          {/* Edit User Modal */}
          {showEditUser && selectedUser && (
            <EditUserModal
              user={selectedUser}
              onClose={() => { setShowEditUser(false); setSelectedUser(null); }}
              onSuccess={() => { setShowEditUser(false); setSelectedUser(null); fetchUsers(); }}
            />
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedUser && (
            <DeleteConfirmModal
              user={selectedUser}
              onConfirm={() => handleDeleteUser(selectedUser.id)}
              onCancel={() => { setShowDeleteModal(false); setSelectedUser(null); }}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// User Card Component
function UserCard({ user, onEdit, onDelete, onToggleStatus }) {
  const roleLabel = user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز';
  const roleColor = user.role === 'admin' ? 'bg-gradient-to-br from-purple-400 to-purple-600' : user.role === 'teacher' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 'bg-gradient-to-br from-green-400 to-green-600';

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-8 w-full flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-center gap-6">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow ${roleColor}`}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div className="flex-1">
          <div className="font-bold text-green-800 text-xl mb-2">{user.firstName} {user.lastName}</div>
          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
            <Calendar className="w-4 h-4" />
            <span>کد ملی: {user.nationalCode}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
            <PhoneIcon className="w-4 h-4" />
            <span>موبایل: {user.phone}</span>
          </div>
          {user.role === 'student' && user.grade && (
            <div className="flex items-center gap-2 text-sm text-green-700 mt-1">
              <GraduationCap className="w-4 h-4" />
              <span>پایه: {user.grade}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className={`px-3 py-1 text-xs rounded-full shadow ${roleColor} text-white`}>{roleLabel}</span>
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 text-xs rounded-full border shadow ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-green-100">
        <button
          onClick={onEdit}
          className="p-2 bg-blue-50 text-blue-600 rounded-full shadow hover:bg-blue-100 transition"
          title="ویرایش"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-50 text-red-600 rounded-full shadow hover:bg-red-100 transition"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function PhoneIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <circle cx="12" cy="18" r="1" />
    </svg>
  );
}

// Edit User Modal
function EditUserModal({ user, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    nationalCode: user.nationalCode || '',
    phone: user.phone || '',
    role: user.role || 'student',
    grade: user.grade || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const gradeToClassId = {
    'اول ابتدایی': '1',
    'دوم ابتدایی': '2',
    'سوم ابتدایی': '3',
    'چهارم ابتدایی': '4'
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    let submitData = { ...formData };
    if (formData.role === 'student') {
      submitData.classId = gradeToClassId[formData.grade] || '';
    }
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(submitData)
      });
      const data = await response.json();
      if (data?.success || response.ok) {
        onSuccess();
      } else {
        setError(data?.message || 'خطا در ویرایش کاربر');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-green-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <Edit className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-green-700">ویرایش کاربر</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
            title="بستن"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="نام"
              required
            />
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="نام خانوادگی"
              required
            />
          </div>
          <input
            type="text"
            value={formData.nationalCode}
            onChange={e => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="کد ملی"
            required
          />
          <input
            type="tel"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
            placeholder="شماره موبایل"
          />
          <select
            value={formData.role}
            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>
          {formData.role === 'student' && (
            <select
              value={formData.grade || ''}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              required
            >
              <option value="">انتخاب پایه</option>
              <option value="اول ابتدایی">اول ابتدایی</option>
              <option value="دوم ابتدایی">دوم ابتدایی</option>
              <option value="سوم ابتدایی">سوم ابتدایی</option>
              <option value="چهارم ابتدایی">چهارم ابتدایی</option>
            </select>
          )}
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
              placeholder="رمز جدید (اختیاری)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-2 top-2 text-gray-400"
              title={showPassword ? "مخفی کردن" : "نمایش رمز"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={generatePassword}
              className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded-xl shadow hover:bg-green-200 transition"
              title="تولید رمز"
            >
              تولید
            </button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition"
            >
              {isLoading ? 'در حال ذخیره...' : 'ذخیره'}
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
    firstName: '', lastName: '', nationalCode: '', phone: '', role: 'student', grade: '', password: ''
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // بارگذاری لیست کلاس‌ها
  useEffect(() => {
    async function fetchClasses() {
      try {
        const token = localStorage?.getItem?.('token');
        const response = await fetch('/api/admin/classes', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error("خطا در بارگذاری کلاس‌ها:", error);
      } finally {
        setClassesLoading(false);
      }
    }
    fetchClasses();
  }, []);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // بررسی کلاس برای دانش‌آموز
    if (formData.role === 'student' && !formData.classId && !formData.grade) {
      setError('برای دانش‌آموز باید کلاس یا پایه انتخاب شود');
      setIsLoading(false);
      return;
    }
    
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data?.success) {
        onSuccess();
      } else {
        setError(data?.message || 'خطا در ایجاد کاربر');
      }
    } catch {
      setError('خطا در ارتباط با سرور');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-green-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-green-700">افزودن کاربر جدید</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
            title="بستن"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" placeholder="نام" required />
            <input type="text" value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" placeholder="نام خانوادگی" required />
          </div>
          <input type="text" value={formData.nationalCode} onChange={e => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))} className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" placeholder="کد ملی" required />
          <input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" placeholder="شماره موبایل" />
          <select value={formData.role} onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))} className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition">
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>
          {formData.role === 'student' && (
            <>
              {!formData.classId && (
                <select
                  value={formData.grade || ''}
                  onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value, classId: '' }))}
                  className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                >
                  <option value="">انتخاب پایه</option>
                  <option value="اول ابتدایی">اول ابتدایی</option>
                  <option value="دوم ابتدایی">دوم ابتدایی</option>
                  <option value="سوم ابتدایی">سوم ابتدایی</option>
                  <option value="چهارم ابتدایی">چهارم ابتدایی</option>
                </select>
              )}
            </>
          )}
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" placeholder="رمز عبور" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button type="button" onClick={generatePassword} className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded-xl shadow hover:bg-green-200 transition">تولید</button>
          </div>
                    {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition"
              disabled={isLoading}
            >
              {isLoading ? 'در حال ایجاد...' : 'ایجاد'}
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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-100 to-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">حذف کاربر</h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-full bg-red-50 hover:bg-red-200 transition"
            title="بستن"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-6">
          <div className="font-bold text-gray-800 text-lg mb-2">{user.firstName} {user.lastName}</div>
          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
            <Calendar className="w-4 h-4" />
            <span>کد ملی: {user.nationalCode}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700 mb-1">
            <PhoneIcon className="w-4 h-4" />
            <span>موبایل: {user.phone}</span>
          </div>
          <div className="flex justify-end gap-2 pt-6">
            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition">انصراف</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white font-bold shadow hover:scale-105 transition">حذف</button>
          </div>
        </div>
      </div>
    </div>
  );
}