'use client';
import React, { useEffect, useState } from 'react';
import { 
  Users, Phone, Calendar, Check, X, Trash2, ArrowRight, 
  UserPlus, Clock, Crown, Filter, Search, RefreshCw,
  Eye, CheckCircle, XCircle, Sparkles, Activity
} from 'lucide-react';
import Link from 'next/link';

export default function PreRegistrationsPage() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        window.location.href = '/login';
        return false;
      }
      
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        
        const isAdmin = userObj.role === 'admin' || 
                       userObj.user_type === 'admin' || 
                       userObj.type === 'admin' ||
                       userObj.userType === 'admin';
                       
        if (!isAdmin) {
          setError(`شما دسترسی ادمین ندارید. نقش شما: ${userObj.role || userObj.user_type || userObj.type || 'نامشخص'}`);
          return false;
        }
        
        return true;
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return false;
      }
    };

    if (checkAuth()) {
      fetchRegistrations();
    }
  }, []);

  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/pre-registrations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }

      if (response.status === 403) {
        setError('دسترسی غیرمجاز - فقط ادمین‌ها');
        return;
      }

      const data = await response.json();
      if (data.success) {
        setRegistrations(data.registrations || []);
      } else {
        setError(data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (err) {
      setError('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/pre-registrations/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        setRegistrations(prev => 
          prev.map(reg => reg.id === id ? { ...reg, status } : reg)
        );
      } else {
        alert(data.message || 'خطا در به‌روزرسانی');
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور');
    }
  };

  const deleteRegistration = async (id) => {
    if (!confirm('آیا از حذف این درخواست اطمینان دارید؟')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/pre-registrations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setRegistrations(prev => prev.filter(reg => reg.id !== id));
      } else {
        alert(data.message || 'خطا در حذف');
      }
    } catch (err) {
      alert('خطا در ارتباط با سرور');
    }
  };

  // محاسبه آمار
  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    approved: registrations.filter(r => r.status === 'approved').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  // فیلتر و جستجو
  const filteredRegistrations = registrations.filter(reg => {
    const matchesStatus = filterStatus === 'all' || reg.status === filterStatus;
    const matchesSearch = !searchTerm || 
      reg.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.phone.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-6 shadow-lg"></div>
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-6 shadow-xl border border-green-200">
            <p className="text-gray-700 font-medium">در حال بارگذاری پیش‌ثبت‌نام‌ها...</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-xl p-8 rounded-2xl sm:rounded-3xl shadow-xl text-center border border-red-200 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <X className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-red-700 mb-4">خطا در دسترسی</h3>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <ArrowRight className="w-5 h-5" />
            بازگشت به پنل ادمین
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-8">
      {/* Header شبیه Dashboard */}
      <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 text-white shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-32 sm:translate-x-32"></div>
        <div className="relative z-10">
          {/* هدر موبایل */}
          <div className="sm:hidden mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold">مدیریت پیش‌ثبت‌نام‌ها</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
            <div>
              {/* عنوان دسکتاپ */}
              <h2 className="hidden sm:block text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                مدیریت پیش‌ثبت‌نام‌ها
              </h2>
              <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">مدیریت و بررسی درخواست‌های پیش‌ثبت‌نام</p>
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

            {/* لوگوی بزرگ فقط دسکتاپ */}
            <div className="w-14 h-14 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl hidden md:flex items-center justify-center shadow-2xl">
              <Users className="w-8 h-8 sm:w-16 sm:h-16 text-white" />
            </div>
          </div>

          {/* دکمه‌های عمل */}
          <div className="flex items-center gap-3 mt-4 sm:mt-6">
            <button
              onClick={fetchRegistrations}
              className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">به‌روزرسانی</span>
            </button>
            <Link
              href="/admin"
              className="flex items-center gap-2 bg-white/20 backdrop-blur-lg text-white px-3 sm:px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all duration-300 text-sm"
            >
              <ArrowRight className="w-4 h-4" />
              <span className="hidden sm:inline">بازگشت</span>
            </Link>
          </div>
        </div>
      </div>

      {/* کارت‌های آمار شبیه Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-6">
        <StatsCard
          title="کل درخواست‌ها"
          value={stats.total}
          icon={UserPlus}
          gradient="from-blue-50 to-white"
          iconGradient="from-blue-500 to-blue-400"
        />
        <StatsCard
          title="در انتظار بررسی"
          value={stats.pending}
          icon={Clock}
          gradient="from-yellow-50 to-orange-50"
          iconGradient="from-yellow-500 to-orange-400"
        />
        <StatsCard
          title="تأیید شده"
          value={stats.approved}
          icon={CheckCircle}
          gradient="from-green-50 to-emerald-50"
          iconGradient="from-green-500 to-emerald-400"
        />
        <StatsCard
          title="رد شده"
          value={stats.rejected}
          icon={XCircle}
          gradient="from-red-50 to-pink-50"
          iconGradient="from-red-500 to-pink-400"
        />
      </div>

      {/* فیلتر و جستجو */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-green-200">
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-3 flex items-center">
          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center ml-2">
            <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
          فیلتر و جستجو
        </h3>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجو بر اساس نام، نام خانوادگی یا شماره تلفن..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-12 pl-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent outline-none transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-transparent outline-none text-sm"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="pending">در انتظار</option>
              <option value="approved">تأیید شده</option>
              <option value="rejected">رد شده</option>
            </select>
          </div>
        </div>
      </div>

      {/* لیست درخواست‌ها */}
      {filteredRegistrations.length === 0 ? (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-xl border border-green-200">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Users className="w-8 h-8 sm:w-12 sm:h-12 text-gray-500" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-3">
            {searchTerm || filterStatus !== 'all' ? 'نتیجه‌ای یافت نشد' : 'هیچ درخواست پیش‌ثبت‌نامی یافت نشد'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-sm">
            {searchTerm || filterStatus !== 'all' 
              ? 'برای مشاهده نتایج بیشتر، فیلترها را تغییر دهید یا جستجوی جدیدی انجام دهید.'
              : 'زمانی که کاربران درخواست پیش‌ثبت‌نام ارسال کنند، اینجا نمایش داده خواهد شد.'
            }
          </p>
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl border border-green-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 text-white">
                <tr>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">شناسه</th>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">نام و نام خانوادگی</th>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">شماره تماس</th>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">پایه تحصیلی</th>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">تاریخ ثبت</th>
                  <th className="text-right px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">وضعیت</th>
                  <th className="text-center px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-bold">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegistrations.map((reg, index) => (
                  <tr key={reg.id} className="hover:bg-gradient-to-r hover:from-green-50 hover:to-green-25 transition-all duration-300">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="bg-gradient-to-r from-green-100 to-green-50 text-green-700 px-2 sm:px-3 py-1 rounded-lg text-xs font-bold border border-green-200">
                        #{reg.id}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                          {reg.first_name?.charAt(0)}{reg.last_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 text-xs sm:text-sm">{reg.first_name} {reg.last_name}</div>
                          <div className="text-xs text-gray-500">دانش‌آموز</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                        <span className="font-medium text-gray-700 text-xs sm:text-sm">{reg.phone}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border border-blue-200">
                        {reg.grade || 'نامشخص'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                        <span className="text-xs sm:text-sm">{new Date(reg.created_at).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(reg.id, 'approved')}
                              className="p-1.5 sm:p-2 bg-gradient-to-r from-green-500 to-green-400 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                              title="تأیید"
                            >
                              <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => updateStatus(reg.id, 'rejected')}
                              className="p-1.5 sm:p-2 bg-gradient-to-r from-red-500 to-red-400 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                              title="رد"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteRegistration(reg.id)}
                          className="p-1.5 sm:p-2 bg-gradient-to-r from-gray-500 to-gray-400 text-white rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-110"
                          title="حذف"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// کامپوننت‌های کمکی شبیه Dashboard
function StatsCard({ title, value, icon: Icon, gradient, iconGradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-gray-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg cursor-pointer`}>
      <div className="flex items-center justify-between mb-2 sm:mb-6">
        <div className={`w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-r ${iconGradient} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
        </div>
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
      </div>
      <div>
        <p className="text-lg sm:text-4xl font-bold text-gray-800 mb-0.5 sm:mb-2">{value.toLocaleString('fa-IR')}</p>
        <p className="text-xs sm:text-base text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const configs = {
    pending: {
      bg: 'from-yellow-100 to-orange-100',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      label: 'در انتظار بررسی',
      icon: Clock
    },
    approved: {
      bg: 'from-green-100 to-emerald-100',
      border: 'border-green-200',
      text: 'text-green-700',
      label: 'تأیید شده',
      icon: CheckCircle
    },
    rejected: {
      bg: 'from-red-100 to-pink-100',
      border: 'border-red-200',
      text: 'text-red-700',
      label: 'رد شده',
      icon: XCircle
    }
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 sm:gap-2 bg-gradient-to-r ${config.bg} ${config.text} px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs font-bold shadow-sm border ${config.border}`}>
      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">
        {status === 'pending' ? 'انتظار' : status === 'approved' ? 'تأیید' : 'رد'}
      </span>
    </span>
  );
}