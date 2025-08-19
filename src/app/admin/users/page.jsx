'use client'
import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Edit, Trash2, Eye, EyeOff, X, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

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
      {/* Header */}
      <header className="bg-white/95 shadow border-b border-green-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.location.href = '/admin/dashboard'}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>داشبورد مدیریت</span>
          </button>
          <h1 className="text-lg font-bold text-green-700">مدیریت کاربران</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700">{user?.firstName} {user?.lastName}</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">{user?.role === 'admin' ? 'مدیر' : ''}</span>
          </div>
        </div>
      </header>

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
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
        >
          <UserPlus className="w-4 h-4" />
          افزودن کاربر
        </button>
      </div>

      {/* Users Grid */}
      <div className="max-w-4xl mx-auto px-4 pb-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
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
    </div>
  );
}

// User Card Component
function UserCard({ user, onEdit, onDelete, onToggleStatus }) {
  const roleLabel = user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز';
  const roleColor = user.role === 'admin' ? 'bg-purple-600' : user.role === 'teacher' ? 'bg-blue-600' : 'bg-green-600';

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-5 flex flex-col gap-3 hover:shadow-lg transition">
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${roleColor}`}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div>
          <div className="font-bold text-gray-800">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gray-500 font-mono">{user.nationalCode}</div>
          <div className="text-xs text-gray-400">{user.phone}</div>
          {user.role === 'student' && user.grade && (
            <div className="text-xs text-green-700 font-bold mt-1">پایه: {user.grade}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 text-xs rounded ${roleColor} text-white`}>{roleLabel}</span>
        <button
          onClick={onToggleStatus}
          className={`px-2 py-1 text-xs rounded ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} border`}
        >
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-green-100">
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
          title="ویرایش"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
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
    role: user.role || 'student',
    grade: user.grade || '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // نگاشت پایه به کلاس
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
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-green-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-green-700">ویرایش کاربر</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-green-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="px-3 py-2 border rounded bg-green-50" placeholder="نام" required />
            <input type="text" value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="px-3 py-2 border rounded bg-green-50" placeholder="نام خانوادگی" required />
          </div>
          <input type="text" value={formData.nationalCode} onChange={e => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="کد ملی" required />
          <input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="شماره موبایل" />
          <select
            value={formData.role}
            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 border rounded bg-green-50"
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>
          {formData.role === 'student' && (
            <select
              value={formData.grade || ''}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 border rounded bg-green-50"
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
            <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="رمز جدید (اختیاری)" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button type="button" onClick={generatePassword} className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded">تولید</button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded text-gray-700">انصراف</button>
            <button type="submit" className="px-4 py-2 bg-green-600 rounded text-white">{isLoading ? 'در حال ذخیره...' : 'ذخیره'}</button>
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // نگاشت پایه به کلاس
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
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(submitData)
      });
      const data = await response.json();
      if (data?.success || response.ok) {
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
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-green-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-green-700">افزودن کاربر جدید</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-green-50">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={formData.firstName} onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))} className="px-3 py-2 border rounded bg-green-50" placeholder="نام" required />
            <input type="text" value={formData.lastName} onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))} className="px-3 py-2 border rounded bg-green-50" placeholder="نام خانوادگی" required />
          </div>
          <input type="text" value={formData.nationalCode} onChange={e => setFormData(prev => ({ ...prev, nationalCode: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="کد ملی" required />
          <input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="شماره موبایل" />
          <select
            value={formData.role}
            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
            className="w-full px-3 py-2 border rounded bg-green-50"
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>
          {formData.role === 'student' && (
            <select
              value={formData.grade || ''}
              onChange={e => setFormData(prev => ({ ...prev, grade: e.target.value }))}
              className="w-full px-3 py-2 border rounded bg-green-50"
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
            <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} className="w-full px-3 py-2 border rounded bg-green-50" placeholder="رمز عبور" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-2 top-2 text-gray-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            <button type="button" onClick={generatePassword} className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded">تولید</button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 rounded text-gray-700">انصراف</button>
            <button type="submit" className="px-4 py-2 bg-green-600 rounded text-white">{isLoading ? 'در حال ایجاد...' : 'ایجاد'}</button>
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
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl border border-red-100 p-6">
        <div className="flex items-center gap-3 mb-6">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-bold text-red-600">حذف کاربر</h2>
        </div>
        <div className="mb-4">
          <div className="font-bold text-gray-800">{user.firstName} {user.lastName}</div>
          <div className="text-xs text-gray-500 font-mono">کد ملی: {user.nationalCode}</div>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded text-gray-700">انصراف</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 rounded text-white">حذف</button>
        </div>
      </div>
    </div>
  );
}