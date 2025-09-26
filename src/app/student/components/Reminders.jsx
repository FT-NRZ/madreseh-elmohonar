'use client'
import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Bell, AlertTriangle, User, Users, 
  BookOpen, Star, RefreshCw, Filter, Search, Eye,
  Newspaper, Target, CheckCircle2
} from 'lucide-react';
import moment from 'jalali-moment';

export default function Reminders({ studentId, gradeId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReminders();
  }, [studentId, gradeId]);

  // دریافت یادآوری‌ها
  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage?.getItem?.('token');
      if (!token) {
        throw new Error('توکن احراز هویت یافت نشد');
      }

      // درخواست به API معلم برای دریافت یادآوری‌های مربوط به دانش‌آموز
      const params = new URLSearchParams({
        studentId: studentId || '',
        gradeId: gradeId || '',
        type: 'student_view'
      });
      
        const response = await fetch(`/api/teacher/news/student?${params.toString()}`, {
        headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
        });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Reminders API response:', data);
      
      if (data.success) {
        setReminders(data.reminders || []);
      } else {
        throw new Error(data.error || 'خطا در دریافت یادآوری‌ها');
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError(error.message);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر یادآوری‌ها
    const filteredReminders = reminders.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'important') return item.is_important && matchesSearch;
    if (filterType === 'grade') return item.target_type === 'grade' && matchesSearch;  // تغییر از specific_grade به grade
    if (filterType === 'personal') return item.target_type === 'specific_student' && matchesSearch;
    if (filterType === 'today') {
        const today = moment().format('YYYY-MM-DD');
        const reminderDate = item.reminder_date ? moment(item.reminder_date).format('YYYY-MM-DD') : null;
        return reminderDate === today && matchesSearch;
    }
    return matchesSearch;
    });

  // تعیین نوع یادآوری
    const getReminderTypeInfo = (item) => {
    switch (item.target_type) {
        case 'grade':  // تغییر از specific_grade به grade
        return { 
            label: 'کلاس', 
            color: 'bg-blue-100 text-blue-700 border-blue-200',
            icon: BookOpen
        };
        case 'specific_student':
        return { 
            label: 'شخصی', 
            color: 'bg-orange-100 text-orange-700 border-orange-200',
            icon: User
        };
        case 'all_students':
        return { 
            label: 'عمومی', 
            color: 'bg-purple-100 text-purple-700 border-purple-200',
            icon: Users
        };
        default:
        return { 
            label: 'نامشخص', 
            color: 'bg-gray-100 text-gray-700 border-gray-200',
            icon: Bell
        };
    }
    };

  // بررسی اینکه یادآوری امروز است یا نه
  const isToday = (date) => {
    if (!date) return false;
    return moment(date).isSame(moment(), 'day');
  };

  // بررسی اینکه یادآوری گذشته است یا نه
  const isPast = (date) => {
    if (!date) return false;
    return moment(date).isBefore(moment(), 'day');
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Bell className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">یادآوری‌ها</h2>
              <p className="text-green-100 text-sm">یادآوری‌های مربوط به شما</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-6"></div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-2">در حال بارگذاری یادآوری‌ها...</p>
              <p className="text-sm text-gray-500">لطفاً منتظر بمانید</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-white rounded-3xl shadow-2xl border border-red-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">خطا در بارگذاری</h2>
              <p className="text-red-100 text-sm">مشکلی در دریافت یادآوری‌ها پیش آمده</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">خطا در بارگذاری یادآوری‌ها</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchReminders} 
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Bell className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">یادآوری‌ها و اطلاعیه‌ها</h2>
                <p className="text-green-100 text-sm">یادآوری‌های مربوط به شما و کلاس</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{filteredReminders.length}</span>
              </div>
              <p className="text-xs text-green-100 mt-1">یادآوری</p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-green-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">{reminders.length}</p>
            <p className="text-sm text-gray-600">کل یادآوری‌ها</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-orange-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-700">{reminders.filter(r => r.is_important).length}</p>
            <p className="text-sm text-gray-600">مهم</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-blue-100">
        <div className="text-center">
            <p className="text-2xl font-bold text-blue-700">{reminders.filter(r => r.target_type === 'specific_grade').length}</p>
            <p className="text-sm text-gray-600">کلاسی</p>
        </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-purple-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-700">{reminders.filter(r => r.target_type === 'specific_student').length}</p>
            <p className="text-sm text-gray-600">شخصی</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow border border-red-100">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-700">{reminders.filter(r => isToday(r.reminder_date)).length}</p>
            <p className="text-sm text-gray-600">امروز</p>
          </div>
        </div>
      </div>

      {/* فیلترها */}
      <div className="bg-white rounded-2xl p-6 shadow border border-green-100">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">فیلتر یادآوری‌ها</h3>
          </div>
          <button
            onClick={fetchReminders}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition"
          >
            <RefreshCw className="w-4 h-4" />
            بروزرسانی
          </button>
        </div>

        {/* جستجو */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="جستجو در یادآوری‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-12 pl-4 py-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50"
          />
        </div>

        {/* فیلترهای سریع */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === 'all'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setFilterType('today')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === 'today'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            امروز
          </button>
          <button
            onClick={() => setFilterType('important')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === 'important'
                ? 'bg-orange-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            مهم
          </button>
          <button
            onClick={() => setFilterType('personal')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === 'personal'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            شخصی
          </button>
          <button
            onClick={() => setFilterType('grade')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filterType === 'grade'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            کلاسی
          </button>
        </div>
      </div>

      {/* لیست یادآوری‌ها */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow border border-green-100">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">یادآوری‌ای یافت نشد</h3>
            <p className="text-gray-500">
              {searchTerm || filterType !== 'all' 
                ? 'برای این فیلتر یادآوری‌ای موجود نیست' 
                : 'هنوز یادآوری‌ای برای شما ثبت نشده است'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredReminders.map((item) => {
              const typeInfo = getReminderTypeInfo(item);
              const IconComponent = typeInfo.icon;
              const todayReminder = isToday(item.reminder_date);
              const pastReminder = isPast(item.reminder_date);
              
              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border overflow-hidden transform hover:scale-[1.02] ${
                    todayReminder ? 'border-red-300 ring-2 ring-red-200' :
                    item.is_important ? 'border-orange-300 ring-2 ring-orange-200' :
                    'border-green-100'
                  }`}
                >
                  {/* Header */}
                  <div className={`p-4 border-b ${
                    todayReminder ? 'bg-red-50 border-red-100' :
                    item.is_important ? 'bg-orange-50 border-orange-100' :
                    'bg-green-50 border-green-100'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${typeInfo.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 leading-tight">
                            {item.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${typeInfo.color}`}>
                              {typeInfo.label}
                            </span>
                            {item.is_important && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                مهم
                              </span>
                            )}
                            {todayReminder && (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                امروز
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-gray-700 text-sm leading-relaxed mb-4 line-clamp-3">
                      {item.content}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            ایجاد: {moment(item.created_at).format('jYYYY/jMM/jDD')}
                          </span>
                        </div>
                        {item.reminder_date && (
                          <div className={`flex items-center gap-1 ${
                            todayReminder ? 'text-red-600 font-semibold' :
                            pastReminder ? 'text-gray-400' : 'text-blue-600'
                          }`}>
                            <Clock className="w-4 h-4" />
                            <span>
                              یادآوری: {moment(item.reminder_date).format('jYYYY/jMM/jDD')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}