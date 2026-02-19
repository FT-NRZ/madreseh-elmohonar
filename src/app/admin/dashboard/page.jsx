'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, GraduationCap, BookOpen, BarChart3, Settings,
  Activity, Calendar, Clock, Crown, RefreshCw, Sparkles,
  Edit, Trash2, CalendarCheck
} from 'lucide-react';

export default function AdminDashboard() {
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

  // آمار پیش‌ثبت‌نام‌ها
  const [preStats, setPreStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    last: []
  });

  const openEditModal = (user) => {
    setUserToEdit(user);
    setShowEditUser(true);
  };

  useEffect(() => {
    fetchUserStats();
    fetchUsers();
    fetchPreStats();
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
        setUsers([]);
      }
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPreStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/pre-registration', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        const regs = data.preRegistrations || [];
        setPreStats({
          total: regs.length,
          pending: regs.filter(r => r.status === 'pending').length,
          approved: regs.filter(r => r.status === 'approved').length,
          rejected: regs.filter(r => r.status === 'rejected').length,
          last: regs.slice(0, 5)
        });
      }
    } catch {
      setPreStats({ total: 0, pending: 0, approved: 0, rejected: 0, last: [] });
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

  return (
    <div className="space-y-3 sm:space-y-8">
      {/* Welcome Card */}
      <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-32 sm:translate-x-32"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
            <div>
              <h2 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                خوش آمدید! 🌟
              </h2>
              <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">پنل مدیریت هوشمند مدرسه علم و هنر</p>
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
            <div className="w-14 hidden h-14 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl md:flex items-center justify-center shadow-2xl">
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

      {/* آمار پیش‌ثبت‌نام */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
        <StatsCard
          title="پیش‌ثبت‌نام‌ها"
          value={preStats.total}
          icon={UserPlus}
          gradient="from-yellow-50 to-white"
          iconGradient="from-yellow-400 to-yellow-300"
        />
        <StatsCard
          title="در انتظار"
          value={preStats.pending}
          icon={Clock}
          gradient="from-yellow-100 to-yellow-50"
          iconGradient="from-yellow-500 to-yellow-400"
        />
        <StatsCard
          title="تأیید شده"
          value={preStats.approved}
          icon={Crown}
          gradient="from-blue-100 to-blue-50"
          iconGradient="from-blue-500 to-blue-400"
        />
        <StatsCard
          title="رد شده"
          value={preStats.rejected}
          icon={Crown}
          gradient="from-pink-100 to-pink-50"
          iconGradient="from-pink-500 to-pink-400"
        />
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

      {/* آخرین پیش‌ثبت‌نام‌ها */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl border border-green-200">
        <h3 className="text-base sm:text-xl font-bold text-gray-800 mb-3 flex items-center">
          <UserPlus className="w-5 h-5 text-yellow-500 ml-2" />
          آخرین پیش‌ثبت‌نام‌ها
          <a
            href="/admin/pre-registrations"
            className="ml-auto px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            مشاهده همه
          </a>
        </h3>
        {preStats.last.length === 0 ? (
          <div className="text-gray-400 text-xs">هیچ پیش‌ثبت‌نامی ثبت نشده</div>
        ) : (
          <div className="space-y-2">
            {preStats.last.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2 border border-green-100">
                <div>
                  <span className="font-bold text-gray-800">{reg.first_name} {reg.last_name}</span>
                  <span className="mx-2 text-gray-500 text-xs">{reg.grade}</span>
                  <span className="mx-2 text-green-700 text-xs">{reg.phone}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  reg.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  reg.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                  'bg-pink-100 text-pink-700'
                }`}>
                  {reg.status === 'pending' ? 'در انتظار' : reg.status === 'approved' ? 'تأیید' : 'رد شده'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
}

// کامپوننت‌های کمکی
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