'use client';
import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Edit, Trash2, Eye, EyeOff, X, AlertCircle,
  RefreshCw, GraduationCap, Calendar, Image, LayoutGrid, Target,
  GalleryHorizontalEnd, CalendarCheck, Settings, LogOut,
  Newspaper as NewspaperIcon,
  CalculatorIcon,
  BookOpen,
  FileText,
  Shield,
  BarChart,
  GalleryHorizontal,
  Menu,
  Sparkles
} from 'lucide-react';
import EditUserModal from './EditUserModal';

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
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 6;
  const [grades, setGrades] = useState([]);
  const [filterGrade, setFilterGrade] = useState('all');


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
      fetchGrades(token); 
    } catch {
      window.location.href = '/login';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchGrades = async (token) => {
    try {
      const res = await fetch('/api/grades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGrades(Array.isArray(data.grades) ? data.grades : []);
      } else {
        setGrades([]);
      }
    } catch {
      setGrades([]);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else if (response.status === 403) {
        setUsers([]);
        setMessage('دسترسی مجاز نیست (403). دوباره وارد شوید.');
        setMessageType('error');
      } else {
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

const filteredUsers = users.filter(u => {
  const s = searchTerm.trim();
  const matchesSearch =
    (u.firstName || '').includes(s) ||
    (u.lastName || '').includes(s) ||
    (u.nationalCode || '').includes(s) ||
    (u.phone || '').includes(s);
  const matchesRole = filterRole === 'all' || u.role === filterRole;
  
  // 🔥 اصلاح: فیلتر پایه فقط وقتی اعمال میشه که نقش دانش‌آموز انتخاب شده باشه
  let matchesGrade = true; // پیش‌فرض همه رو نشون بده
  
  // اگر نقش دانش‌آموز انتخاب شده و فیلتر پایه هم تنظیم شده
  if (filterRole === 'student' && filterGrade !== 'all') {
    matchesGrade = u.role === 'student' && u.studentGrade?.gradeId?.toString() === filterGrade;
  }
  
  return matchesSearch && matchesRole && matchesGrade;
});

  // صفحه‌بندی
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  // ریست صفحه هنگام تغییر فیلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterGrade]);


  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMessage(data.message || 'حذف شد');
        setMessageType('success');
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        setMessage(data.message || 'خطا در حذف کاربر');
        setMessageType('error');
      }
    } catch {
      setMessage('خطا در ارتباط با سرور');
      setMessageType('error');
    }
    setShowDeleteModal(false);
    setSelectedUser(null);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleUserStatus = async (userId) => {
    try {
      const token = localStorage?.getItem?.('token');
      const res = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (res.ok) {
        setUsers(prev =>
          prev.map(u =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
          )
        );
      }
    } catch {}
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

  const userStats = {
    students: users.filter(u => u.role === 'student').length,
    teachers: users.filter(u => u.role === 'teacher').length,
    admins: users.filter(u => u.role === 'admin').length,
    total: users.length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex flex-col sm:flex-row">
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
                    👥 مدیریت کاربران
                  </h1>
                  <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">مدیریت دانش‌آموزان، معلمان و مدیران سیستم</p>
                  <div className="flex items-center gap-1 sm:gap-6 text-white/80">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Users className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{userStats.total} کاربر</span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl items-center justify-center shadow-2xl">
                  <Users className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
            <StatsCard
              title="دانش‌آموزان"
              value={userStats.students}
              icon={GraduationCap}
              gradient="from-green-100 to-green-50"
              iconGradient="from-green-600 to-green-500"
              textColor="text-green-800"
            />
            <StatsCard
              title="معلمان"
              value={userStats.teachers}
              icon={BookOpen}
              gradient="from-blue-100 to-blue-50"
              iconGradient="from-blue-600 to-blue-500"
              textColor="text-blue-800"
            />
            <StatsCard
              title="مدیران"
              value={userStats.admins}
              icon={Shield}
              gradient="from-purple-100 to-purple-50"
              iconGradient="from-purple-600 to-purple-500"
              textColor="text-purple-800"
            />
            <StatsCard
              title="کل کاربران"
              value={userStats.total}
              icon={Users}
              gradient="from-gray-100 to-gray-50"
              iconGradient="from-gray-600 to-gray-500"
              textColor="text-gray-800"
            />
          </div>

          {/* Message */}
          {message && (
            <div className={`rounded-xl p-3 text-sm ${messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
              {message}
            </div>
          )}

          {/* Controls */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-green-200">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none sm:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    placeholder="جستجو در کاربران..."
                    className="w-full pr-10 pl-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-600 outline-none transition text-sm"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={e => setFilterRole(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-600 outline-none text-sm"
                >
                  <option value="all">همه نقش‌ها</option>
                  <option value="student">دانش‌آموز</option>
                  <option value="teacher">معلم</option>
                  <option value="admin">مدیر</option>
                </select>
                {filterRole === 'student' && (
                  <select
                    value={filterGrade}
                    onChange={e => setFilterGrade(e.target.value)}
                    className="w-full sm:w-auto px-4 py-2 border border-green-200 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-600 outline-none text-sm"
                  >
                    <option value="all">همه پایه‌ها</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id.toString()}>
                        {grade.grade_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchUsers}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-xl border border-green-200 hover:bg-green-200 transition text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">بروزرسانی</span>
                </button>
                <button
                  onClick={() => setShowCreateUser(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition text-sm font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">افزودن کاربر</span>
                  <span className="sm:hidden">افزودن</span>
                </button>
              </div>
            </div>
          </div>

          {/* Users Grid/List */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-green-200">
            <div className="p-3 sm:p-6 border-b border-green-200">
              <h3 className="text-base sm:text-xl font-bold text-gray-800 flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 ml-2" />
                لیست کاربران ({filteredUsers.length})
              </h3>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-100 to-green-50 backdrop-blur-lg">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-bold text-green-800">کاربر</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-green-800">کد ملی</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-green-800">نقش</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-green-800">اطلاعات تحصیلی</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-green-800">وضعیت</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-green-800">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-gray-500">در حال بارگذاری...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <Users className="w-16 h-16 text-gray-400 mb-4" />
                          <p className="text-gray-500">کاربری یافت نشد</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((u, index) => (
                      <UserTableRow 
                        key={u.id || index} 
                        user={u} 
                        onEdit={() => { setSelectedUser(u); setShowEditUser(true); }}
                        onDelete={() => { setSelectedUser(u); setShowDeleteModal(true); }}
                        onToggleStatus={() => toggleUserStatus(u.id)}
                      />
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
              ) : currentUsers.length === 0 ? (
                <div className="flex flex-col items-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">کاربری یافت نشد</p>
                </div>
              ) : (
                currentUsers.map((u, index) => (
                  <UserMobileCard 
                    key={u.id || index} 
                    user={u} 
                    onEdit={() => { setSelectedUser(u); setShowEditUser(true); }}
                    onDelete={() => { setSelectedUser(u); setShowDeleteModal(true); }}
                    onToggleStatus={() => toggleUserStatus(u.id)}
                  />
                ))
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-green-200 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    قبلی
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-3 py-2 rounded-lg text-sm ${
                          currentPage === i + 1
                            ? 'bg-green-600 text-white'
                            : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    بعدی
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modals */}
          {showCreateUser && (
            <CreateUserModal
              onClose={() => setShowCreateUser(false)}
              onSuccess={() => { setShowCreateUser(false); fetchUsers(); }}
            />
          )}

          {showEditUser && selectedUser && (
            <EditUserModal
              user={selectedUser}
              onClose={() => { setShowEditUser(false); setSelectedUser(null); }}
              onSuccess={() => { setShowEditUser(false); setSelectedUser(null); fetchUsers(); }}
            />
          )}

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

// Desktop Table Row Component
function UserTableRow({ user, onEdit, onDelete, onToggleStatus }) {
  const roleLabel = user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز';
  const roleColor = 
    user.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-purple-500' :
    user.role === 'teacher' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
    'bg-gradient-to-r from-green-600 to-green-500';

  // تابع نمایش اطلاعات تحصیلی یکپارچه
  const renderEducationalInfo = () => {
    if (user.role === 'student' && user.studentGrade) {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-800">
            🎓 {user.studentGrade.gradeName}
          </span>
          <span className="text-xs text-gray-600">
            📊 سطح: {user.studentGrade.gradeLevel}
          </span>
          {/* نمایش نام کلاس اگر متفاوت از پایه باشد */}
          {user.className && user.className !== user.studentGrade.gradeName && (
            <span className="text-xs text-gray-500">
              📚 کلاس: {user.className}
            </span>
          )}
        </div>
      );
    } 
    else if (user.role === 'teacher' && user.teacherDetails) {
      const { teachingType, subject, workshopName, workshopIcon, teachingGrades } = user.teacherDetails;
      
      if (teachingType === 'workshop' && workshopName) {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-800">
              {workshopIcon || '🎪'} {workshopName}
            </span>
            {subject && (
              <span className="text-xs text-gray-600">
                📖 {subject}
              </span>
            )}
          </div>
        );
      } 
      else if (teachingType === 'grade') {
        // برای معلم پایه، نمایش پایه‌هایی که تدریس می‌کند
        if (teachingGrades?.length > 0) {
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-800">
                👨‍🏫 معلم پایه
              </span>
              <div className="flex flex-wrap gap-1">
                {teachingGrades.slice(0, 3).map((grade, idx) => (
                  <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {grade.gradeName}
                  </span>
                ))}
                {teachingGrades.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{teachingGrades.length - 3} مورد دیگر
                  </span>
                )}
              </div>
              {subject && (
                <span className="text-xs text-gray-600">
                  📖 {subject}
                </span>
              )}
            </div>
          );
        } else {
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-800">
                👨‍🏫 معلم پایه
              </span>
              {subject && (
                <span className="text-xs text-gray-600">
                  📖 {subject}
                </span>
              )}
            </div>
          );
        }
      } 
      else {
        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-500">
              👨‍🏫 معلم
            </span>
            {subject && (
              <span className="text-xs text-gray-600">
                📖 {subject}
              </span>
            )}
          </div>
        );
      }
    }
    else if (user.role === 'admin') {
      return (
        <span className="text-sm text-gray-500">
          👑 مدیر سیستم
        </span>
      );
    }
    
    return (
      <span className="text-sm text-gray-400">
        اطلاعات ناکامل
      </span>
    );
  };

  return (
    <tr className="hover:bg-green-50/50 transition-all duration-300">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${roleColor} rounded-2xl flex items-center justify-center shadow-lg`}>
            <span className="text-white font-bold text-sm">
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
      <td className="px-6 py-4">
        <span className="font-mono bg-green-100 px-3 py-2 rounded-xl text-sm shadow-sm text-green-600">
          {user.nationalCode}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg ${roleColor} text-white`}>
          {roleLabel}
        </span>
      </td>
      {/* ستون جدید اطلاعات تحصیلی */}
      <td className="px-6 py-4">
        <div className="min-w-0">
          {renderEducationalInfo()}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <button
          onClick={onToggleStatus}
          className={`px-4 py-2 text-sm font-bold rounded-full shadow-lg transition ${
            user.isActive 
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
              : 'bg-gradient-to-r from-gray-400 to-gray-300 text-white'
          }`}
        >
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          <button 
            onClick={onEdit}
            className="p-3 text-blue-600 hover:bg-blue-100 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <Edit className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
          </button>
          <button 
            onClick={onDelete}
            className="p-3 text-red-600 hover:bg-red-100 rounded-xl transition-all duration-300 hover:scale-110 group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// Mobile Card Component
function UserMobileCard({ user, onEdit, onDelete, onToggleStatus }) {
  const roleLabel = user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز';
  const roleColor = 
    user.role === 'admin' ? 'bg-gradient-to-r from-purple-600 to-purple-500' :
    user.role === 'teacher' ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
    'bg-gradient-to-r from-green-600 to-green-500';

  // تابع نمایش اطلاعات تحصیلی موبایل
  const renderMobileEducationalInfo = () => {
    if (user.role === 'student' && user.studentGrade) {
      return (
        <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <span className="text-xs font-medium text-green-700">
            🎓 پایه {user.studentGrade.gradeName}
          </span>
          {user.className && (
            <div className="text-xs text-green-600 mt-1">
              📚 کلاس: {user.className}
            </div>
          )}
        </div>
      );
    } 
    else if (user.role === 'teacher' && user.teacherDetails) {
      const { teachingType, subject, workshopName, workshopIcon, teachingGrades } = user.teacherDetails;
      
      if (teachingType === 'workshop') {
        return (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-xs font-medium text-blue-700">
              {workshopIcon || '🎪'} {workshopName || 'کارگاه نامشخص'}
            </span>
            {subject && (
              <div className="text-xs text-blue-600 mt-1">
                📖 {subject}
              </div>
            )}
          </div>
        );
      } 
      else if (teachingType === 'grade' && teachingGrades?.length > 0) {
        return (
          <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-blue-700 mb-1">
              📚 پایه‌های تدریس:
            </div>
            <div className="flex flex-wrap gap-1">
              {teachingGrades.slice(0, 2).map((grade, idx) => (
                <span key={idx} className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                  {grade.gradeName}
                </span>
              ))}
              {teachingGrades.length > 2 && (
                <span className="text-xs text-blue-600">
                  +{teachingGrades.length - 2}
                </span>
              )}
            </div>
            {subject && (
              <div className="text-xs text-blue-600 mt-1">
                📖 {subject}
              </div>
            )}
          </div>
        );
      }
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-green-100 p-3 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 ${roleColor} rounded-xl flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-sm">
            {user.firstName?.[0]}{user.lastName?.[0]}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">
            {user.firstName} {user.lastName}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="font-mono bg-green-100 px-2 py-1 rounded text-xs text-green-600">
              {user.nationalCode}
            </span>
            <span className={`px-2 py-1 text-xs font-bold rounded-full text-white ${roleColor}`}>
              {roleLabel}
            </span>
          </div>
          {user.phone && (
            <p className="text-xs text-gray-500 mt-1">{user.phone}</p>
          )}
        </div>
      </div>
      
      {/* اطلاعات تحصیلی در موبایل */}
      {renderMobileEducationalInfo()}
      
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onToggleStatus}
          className={`px-3 py-1 text-xs font-bold rounded-full shadow transition ${
            user.isActive 
              ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
              : 'bg-gradient-to-r from-gray-400 to-gray-300 text-white'
          }`}
        >
          {user.isActive ? 'فعال' : 'غیرفعال'}
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            title="ویرایش"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
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

function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', nationalCode: '', phone: '', email: '', 
    role: 'student', gradeId: '', password: '',
    // فیلدهای معلم
    teachingType: '', workshopId: '', subject: ''
  });
  
  const [grades, setGrades] = useState([]);        
  const [workshops, setWorkshops] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage?.getItem?.('token');
        
        // دریافت پایه‌ها (برای دانش‌آموز و معلم پایه)
        const gradesRes = await fetch('/api/grades', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (gradesRes.ok) {
          const gradesData = await gradesRes.json();
          console.log('📊 Grades loaded:', gradesData);
          setGrades(Array.isArray(gradesData.grades) ? gradesData.grades : []);
        } else {
          console.error('Failed to load grades:', gradesRes.status);
          setGrades([]);
        }

        // دریافت کارگاه‌ها (برای معلم کارگاه)
        const workshopsRes = await fetch('/api/workshops', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (workshopsRes.ok) {
          const workshopsData = await workshopsRes.json();
          console.log('🎪 Workshops loaded:', workshopsData);
          setWorkshops(Array.isArray(workshopsData.workshops) ? workshopsData.workshops : []);
        } else {
          console.error('Failed to load workshops:', workshopsRes.status);
          setWorkshops([]);
        }

      } catch (error) {
        console.error('❌ خطا در دریافت داده‌ها:', error);
        setGrades([]);
        setWorkshops([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password }));
  };

  const handleRoleChange = (newRole) => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // ریست کردن فیلدهای مربوط به هر نقش
      gradeId: '',
      teachingType: '',
      workshopId: '',
      subject: ''
    }));
  };

  const handleTeachingTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      teachingType: type,
      gradeId: '',
      workshopId: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // اعتبارسنجی
    if (formData.role === 'student' && !formData.gradeId) {
      setError('انتخاب پایه برای دانش‌آموز الزامی است');
      setIsLoading(false);
      return;
    }

    if (formData.role === 'teacher') {
      if (!formData.teachingType) {
        setError('انتخاب نوع تدریس برای معلم الزامی است');
        setIsLoading(false);
        return;
      }
      if (formData.teachingType === 'grade' && !formData.gradeId) {
        setError('انتخاب پایه برای معلم پایه‌ای الزامی است');
        setIsLoading(false);
        return;
      }
      if (formData.teachingType === 'workshop' && !formData.workshopId) {
        setError('انتخاب کارگاه برای معلم کارگاه الزامی است');
        setIsLoading(false);
        return;
      }
    }

    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          nationalCode: formData.nationalCode,
          phone: formData.phone || null,
          email: formData.email || null,
          role: formData.role,
          password: formData.password,
          // برای دانش‌آموز و معلم پایه
          gradeId: (formData.role === 'student' || (formData.role === 'teacher' && formData.teachingType === 'grade')) 
            ? Number(formData.gradeId) : undefined,
          // برای معلم
          teachingType: formData.role === 'teacher' ? formData.teachingType : undefined,
          workshopId: formData.role === 'teacher' && formData.teachingType === 'workshop' ? Number(formData.workshopId) : undefined,
          subject: formData.role === 'teacher' ? formData.subject : undefined
        })
      });
      const data = await response.json();
      if (response.ok && data?.success) {
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
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-green-100 p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-green-600" />
            <h2 className="text-lg font-bold text-green-700">افزودن کاربر جدید</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition" title="بستن">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
          {/* اطلاعات پایه */}
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

          <input 
            type="email" 
            value={formData.email} 
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))} 
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" 
            placeholder="ایمیل (اختیاری)" 
          />

          {/* انتخاب نقش */}
          <select 
            value={formData.role} 
            onChange={e => handleRoleChange(e.target.value)} 
            className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
          >
            <option value="student">دانش‌آموز</option>
            <option value="teacher">معلم</option>
            <option value="admin">مدیر</option>
          </select>

          {/* فیلدهای مخصوص دانش‌آموز */}
          {formData.role === 'student' && (
            <div className="space-y-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                اطلاعات دانش‌آموز
              </h3>
              
              {loading ? (
                <div className="text-sm text-gray-500">در حال بارگذاری پایه‌ها...</div>
              ) : (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">
                    انتخاب پایه/کلاس تحصیلی *
                  </label>
                  <select
                    value={formData.gradeId}
                    onChange={e => setFormData(prev => ({ ...prev, gradeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                    required
                  >
                    <option value="">انتخاب پایه/کلاس...</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        📚 {grade.grade_name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 پایه انتخاب شده به عنوان کلاس نیز در نظر گرفته می‌شود
                  </p>
                </div>
              )}
            </div>
          )}

          {/* فیلدهای مخصوص معلم */}
          {formData.role === 'teacher' && (
            <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-blue-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                اطلاعات معلم
              </h3>
              
              {/* نوع تدریس */}
              <div>
                <label className="block text-sm font-bold mb-2 text-gray-700">نوع تدریس *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleTeachingTypeChange('grade')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      formData.teachingType === 'grade'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">📚</div>
                    <div className="font-semibold text-sm">معلم پایه</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTeachingTypeChange('workshop')}
                    className={`p-3 border-2 rounded-lg text-center transition ${
                      formData.teachingType === 'workshop'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-1">🎪</div>
                    <div className="font-semibold text-sm">معلم کارگاه</div>
                  </button>
                </div>
              </div>

              {/* انتخاب پایه برای معلم پایه‌ای */}
              {formData.teachingType === 'grade' && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">انتخاب پایه تحصیلی *</label>
                  <select
                    value={formData.gradeId}
                    onChange={e => setFormData(prev => ({ ...prev, gradeId: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-100 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    required
                  >
                    <option value="">انتخاب پایه...</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        📚 {grade.grade_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* انتخاب کارگاه برای معلم کارگاه */}
              {formData.teachingType === 'workshop' && (
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">انتخاب کارگاه *</label>
                  <select
                    value={formData.workshopId}
                    onChange={e => setFormData(prev => ({ ...prev, workshopId: e.target.value }))}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                    required
                  >
                    <option value="">انتخاب کارگاه...</option>
                    {workshops.map(workshop => (
                      <option key={workshop.id} value={workshop.id}>
                        {workshop.icon || '🎪'} {workshop.workshop_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* موضوع تدریس */}
              <input 
                type="text" 
                value={formData.subject} 
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value }))} 
                className="w-full px-3 py-2 border border-blue-100 rounded-xl bg-blue-50 focus:ring-2 focus:ring-blue-400 outline-none transition" 
                placeholder="موضوع تدریس (اختیاری)" 
              />
            </div>
          )}

          {/* رمز عبور */}
          <div className="relative">
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={formData.password} 
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))} 
              className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition" 
              placeholder="رمز عبور" 
              required 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute left-2 top-2 text-gray-400"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button 
              type="button" 
              onClick={generatePassword} 
              className="absolute left-10 top-2 text-xs bg-green-100 px-2 py-1 rounded-xl shadow hover:bg-green-200 transition"
            >
              تولید
            </button>
          </div>

          {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-200">{error}</div>}

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

function DeleteConfirmModal({ user, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-red-100 p-0 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-red-100 to-red-50 border-b border-red-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-lg font-bold text-red-700">حذف کاربر</h2>
          </div>
          <button onClick={onCancel} className="p-2 rounded-full bg-red-50 hover:bg-red-200 transition" title="بستن">
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
            <span>موبایل: {user.phone || '-'}</span>
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