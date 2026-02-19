'use client'

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Bell, User, Users, 
  BookOpen, Star, RefreshCw, Filter, Search
} from 'lucide-react';
import moment from 'jalali-moment';

export default function RemindersPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [gradeId, setGradeId] = useState(null);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`;
  };
  useEffect(() => {
  if (!gradeId && studentId) {
    // تلاش برای دریافت لیست دانش‌آموزان و استخراج پایه
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/student', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
            const found = data.students?.find(s => s.id === studentId);
            if (found?.class_id && found?.classes?.grade_id) {
              setGradeId(found.classes.grade_id);
            }
        }
      } catch {}
    })();
  }
}, [studentId, gradeId]);

  // تنظیم کاربر و studentId
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        console.log('User Data:', userObj); // دیباگ
        setUser(userObj);
        
        // تلاش برای پیدا کردن studentId
        const sId = userObj.id || userObj.user_id || userObj.studentId;
        const gId = userObj.grade_id || userObj.gradeId;
        
        console.log('Student ID:', sId, 'Grade ID:', gId); // دیباگ
        
        setStudentId(sId);
        setGradeId(gId);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  // دریافت یادآوری‌ها
  useEffect(() => {
    if (studentId) {
      fetchReminders();
    }
  }, [studentId, gradeId]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage?.getItem?.('token');
      if (!token) {
        setError('لطفاً دوباره وارد شوید');
        setLoading(false);
        return;
      }

      // فراخوانی API با پارامترهای کامل
      const params = new URLSearchParams({
        studentId: studentId,
        type: 'student_view'
      });

      // اضافه کردن gradeId اگر موجود باشد
      if (gradeId) {
        params.append('gradeId', gradeId);
      }

      console.log('API URL:', `/api/teacher/news/student?${params.toString()}`); // دیباگ
      
      const res = await fetch(`/api/teacher/news/student?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }

      if (!res.ok) {
        console.error('API Error:', res.status, res.statusText);
        throw new Error('خطا در دریافت یادآوری‌ها');
      }

      const data = await res.json();
      console.log('API Response:', data); // دیباگ
      
      if (data.success && data.reminders) {
        // نرمال‌سازی داده‌ها
        const normalizedReminders = data.reminders.map(item => ({
          id: item.id,
          title: item.title || 'بدون عنوان',
          content: item.content || '',
          image_url: buildImageUrl(item.image_url),
          target_type: item.target_type,
          target_grade_id: item.target_grade_id,
          target_student_id: item.target_student_id,
          is_important: !!item.is_important,
          reminder_date: item.reminder_date || null,
          created_at: item.created_at,
          teacher_name: item.users 
            ? `${item.users.first_name || ''} ${item.users.last_name || ''}`.trim() 
            : 'معلم',
          grade_name: item.target_grade?.grade_name || null,
          student_name: item.target_student?.users 
            ? `${item.target_student.users.first_name} ${item.target_student.users.last_name}` 
            : null
        }));

        console.log('Normalized Reminders:', normalizedReminders); // دیباگ
        setReminders(normalizedReminders);
      } else {
        console.log('No reminders found or API returned false');
        setReminders([]);
      }
      
    } catch (error) {
      console.error('Fetch Error:', error);
      setError(null);
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
    if (filterType === 'grade') return item.target_type === 'grade' && matchesSearch;
    if (filterType === 'personal') return item.target_type === 'specific_student' && matchesSearch;
    if (filterType === 'general') return item.target_type === 'all_students' && matchesSearch;
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
      case 'grade':
        return { 
          label: item.grade_name ? `پایه ${item.grade_name}` : 'کلاس', 
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
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-8 border border-gray-100">
        <div className="flex justify-center items-center py-12">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header مینیمال */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Bell className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h2 className="text-lg md:text-2xl font-bold mb-1">یادآوری‌ها</h2>
                <p className="text-green-100 text-xs md:text-sm">یادآوری‌های مربوط به شما</p>
              </div>
            </div>
            {reminders.length > 0 && (
              <div className="text-center">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-lg md:text-2xl font-bold">{filteredReminders.length}</span>
                </div>
                <p className="text-xs text-green-100 mt-1">یادآوری</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* آمار سریع - مینیمال */}
      {reminders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 md:gap-4">
          <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-green-700">{reminders.length}</p>
              <p className="text-xs md:text-sm text-gray-600">کل</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-orange-700">{reminders.filter(r => r.is_important).length}</p>
              <p className="text-xs md:text-sm text-gray-600">مهم</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-blue-700">{reminders.filter(r => r.target_type === 'grade').length}</p>
              <p className="text-xs md:text-sm text-gray-600">کلاسی</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-purple-700">{reminders.filter(r => r.target_type === 'specific_student').length}</p>
              <p className="text-xs md:text-sm text-gray-600">شخصی</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-indigo-700">{reminders.filter(r => r.target_type === 'all_students').length}</p>
              <p className="text-xs md:text-sm text-gray-600">عمومی</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
            <div className="text-center">
              <p className="text-lg md:text-2xl font-bold text-red-700">{reminders.filter(r => isToday(r.reminder_date)).length}</p>
              <p className="text-xs md:text-sm text-gray-600">امروز</p>
            </div>
          </div>
        </div>
      )}

      {/* فیلترها - مینیمال */}
      {reminders.length > 0 && (
        <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-lg border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-4">
            <div className="flex items-center gap-2 md:gap-3">
              <Filter className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
              <h3 className="text-base md:text-lg font-bold text-gray-800">فیلتر</h3>
            </div>
            <button
              onClick={fetchReminders}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              بروزرسانی
            </button>
          </div>

          {/* جستجو */}
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-sm"
            />
          </div>

          {/* دکمه‌های فیلتر */}
          <div className="flex flex-wrap gap-2">
            {['all', 'today', 'important', 'personal', 'grade', 'general'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  filterType === type
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'همه' : 
                 type === 'today' ? 'امروز' : 
                 type === 'important' ? 'مهم' : 
                 type === 'personal' ? 'شخصی' : 
                 type === 'grade' ? 'کلاسی' : 'عمومی'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* لیست یادآوری‌ها */}
      <div className="space-y-4">
        {filteredReminders.length === 0 ? (
          <div className="bg-white rounded-xl md:rounded-2xl p-12 text-center shadow-lg border border-gray-100">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-700 mb-2">
              {reminders.length === 0 ? 'هیچ یادآوری‌ای وجود ندارد' : 'یادآوری‌ای یافت نشد'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {reminders.length === 0 
                ? 'به محض ثبت یادآوری‌ها توسط معلم، اینجا نمایش داده می‌شود.'
                : 'برای این فیلتر یادآوری‌ای موجود نیست'
              }
            </p>
            {reminders.length === 0 && (
              <button
                onClick={fetchReminders}
                className="px-6 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition"
              >
                بررسی مجدد
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredReminders.map((item) => {
              const typeInfo = getReminderTypeInfo(item);
              const IconComponent = typeInfo.icon;
              const todayReminder = isToday(item.reminder_date);
              const pastReminder = isPast(item.reminder_date);
              
              return (
                <div
                  key={item.id}
                  className={`group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all border overflow-hidden ${
                    todayReminder ? 'border-red-300' :
                    item.is_important ? 'border-orange-300' :
                    'border-gray-100'
                  }`}
                >
                  {/* عکس - اصلاح شده */}
                  {item.image_url && (
                    <div className="relative h-32 md:h-40 overflow-hidden bg-gray-50 flex items-center justify-center">
                      <img
                        src={buildImageUrl(item.image_url)}
                        alt={item.title}
                        className="max-w-full max-h-full object-contain"
                        style={{ width: 'auto', height: 'auto' }}
                        onError={(e) => { 
                          e.target.style.display = 'none';
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Header */}
                  <div className={`p-4 border-b ${
                    todayReminder ? 'bg-red-50 border-red-100' :
                    item.is_important ? 'bg-orange-50 border-orange-100' :
                    'bg-gray-50 border-gray-100'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${typeInfo.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm md:text-base mb-1">
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                          {item.is_important && (
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              مهم
                            </span>
                          )}
                          {todayReminder && (
                            <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                              <Bell className="w-3 h-3" />
                              امروز
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* محتوا */}
                  <div className="p-4">
                    <p className="text-gray-700 text-xs md:text-sm leading-relaxed mb-3 line-clamp-3">
                      {item.content}
                    </p>
                    
                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{moment(item.created_at).format('jYYYY/jMM/jDD')}</span>
                        </div>
                        {item.reminder_date && (
                          <div className={`flex items-center gap-1 ${
                            todayReminder ? 'text-red-600 font-bold' :
                            pastReminder ? 'text-gray-400' : 'text-blue-600'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span>{moment(item.reminder_date).format('jYYYY/jMM/jDD')}</span>
                          </div>
                        )}
                      </div>
                      {item.teacher_name && (
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{item.teacher_name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Debug Info (فقط در حالت توسعه) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-600">
          <p><strong>Student ID:</strong> {studentId}</p>
          <p><strong>Grade ID:</strong> {gradeId}</p>
          <p><strong>Total Reminders:</strong> {reminders.length}</p>
          <p><strong>Filtered Reminders:</strong> {filteredReminders.length}</p>
        </div>
      )}
    </div>
  );
}