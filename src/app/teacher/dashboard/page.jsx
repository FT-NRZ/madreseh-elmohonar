'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, User, GraduationCap, BookOpen, BarChart3, Settings, Eye, LogOut,
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  ClipboardList, FileText, Image, MessageSquare, Home, LayoutGrid, 
  GalleryHorizontalEnd, ArrowRight, Coffee, Bell, NewspaperIcon, Menu, X,
  Send, Edit, Trash2, Award, AlertTriangle, Shield
} from 'lucide-react';
import moment from 'jalali-moment';

export default function TeacherDashboardPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [teacherStats, setTeacherStats] = useState({
    classes: 0,
    students: 0,
    exams: 0
  });
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeacherStats = async (nationalCode) => {
    try {
      const res = await fetch(`/api/teacher/stats?nationalCode=${nationalCode}`);
      if (res.ok) {
        const data = await res.json();
        setTeacherStats(data.stats || { classes: 0, students: 0, exams: 0 });
        if (data.teacherId) setTeacherId(data.teacherId);
      } else {
        setTeacherStats({ classes: 0, students: 0, exams: 0 });
      }
    } catch (error) {
      setTeacherStats({ classes: 0, students: 0, exams: 0 });
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        if (userObj.role !== 'teacher') {
          window.location.href = '/';
          return;
        }
        setTeacher(userObj);
        setTeacherId(userObj.id);
        setLoading(false);
        
        const nationalCode = userObj?.nationalCode;
        if (nationalCode) {
          fetchTeacherStats(nationalCode);
        }
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری داشبورد معلم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-10 md:space-y-6">
      {/* خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Coffee className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                {loading ? 'در حال بارگذاری...' : `${getGreeting()}، ${teacher?.firstName || 'معلم عزیز'} ${teacher?.lastName || ''} 👋`}
              </h1>
              <p className="text-green-100 text-xs md:text-base">
                {teacher?.subject ? `معلم ${teacher.subject}` : 'به داشبورد معلم خوش آمدید.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار معلم */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6">
        <StatsCard
          title="کلاس‌های من"
          value={teacherStats.classes}
          icon={GraduationCap}
          gradient="from-green-50 to-white"
          iconGradient="from-green-600 to-green-500"
        />
        <StatsCard
          title="دانش‌آموزان"
          value={teacherStats.students}
          icon={Users}
          gradient="from-green-100 to-green-50"
          iconGradient="from-green-600 to-green-500"
        />
        <StatsCard
          title="آزمون‌ها"
          value={teacherStats.exams}
          icon={FileText}
          gradient="from-green-50 to-white"
          iconGradient="from-green-500 to-green-400"
        />
      </div>

      {/* آخرین توبیخی و تشویقی */}
      <LatestDisciplinary teacherId={teacherId} />

      {/* دکمه‌های دسترسی سریع */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          دسترسی سریع
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <QuickAccessCard
            title="برنامه هفتگی"
            description="مشاهده و مدیریت برنامه هفتگی کلاس‌ها"
            icon={Calendar}
            color="from-blue-500 to-blue-600"
            onClick={() => window.location.href = '/teacher/schedule'}
          />
          <QuickAccessCard
            title="اخبار و اطلاعیه‌ها"
            description="مشاهده اخبار عمومی و اطلاعیه‌های شخصی"
            icon={NewspaperIcon}
            color="from-purple-500 to-purple-600"
            onClick={() => window.location.href = '/teacher/news'}
          />
          <QuickAccessCard
            title="کلاس‌های من"
            description="مدیریت و مشاهده کلاس‌های تحت نظارت"
            icon={GraduationCap}
            color="from-green-500 to-green-600"
            onClick={() => window.location.href = '/teacher/classes'}
          />
          <QuickAccessCard
            title="آزمون‌ها"
            description="مدیریت آزمون‌ها و نتایج دانش‌آموزان"
            icon={FileText}
            color="from-orange-500 to-orange-600"
            onClick={() => window.location.href = '/teacher/exams'}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        {/* اخبار فوری */}
        <div>
          <UrgentNews teacherId={teacherId} />
        </div>
        {/* بخشنامه‌های فوری */}
        <div>
          <UrgentCirculars teacherId={teacherId} />
        </div>
      </div>

      {/* یادآوری‌های امروز و آمار هفته */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6">
        <TodayReminders teacherId={teacherId} />
        <WeeklyStats teacherId={teacherId} />
      </div>
    </div>
  );
}

function LatestDisciplinary({ teacherId }) {
  const [latestActions, setLatestActions] = useState({ reward: null, warning: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetchLatestDisciplinary();
    }
  }, [teacherId]);

  const fetchLatestDisciplinary = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/disciplinary?teacherId=${userData.id}`);
      const data = await response.json();
      if (data.success) {
        const actions = data.actions || [];
        const latestReward = actions.filter(a => a.type === 'reward').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        const latestWarning = actions.filter(a => a.type === 'warning').sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
        
        setLatestActions({ reward: latestReward, warning: latestWarning });
      }
    } catch (error) {
      setLatestActions({ reward: null, warning: null });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // اگر هیچ توبیخی و تشویقی وجود ندارد، بخش را نمایش نده
  if (!latestActions.reward && !latestActions.warning) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
        آخرین سوابق من
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* آخرین تشویقی */}
        {latestActions.reward && (
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-green-800 text-sm">آخرین تشویقی</h4>
                <p className="text-xs text-green-600">{moment(latestActions.reward.date).format('jYYYY/jMM/jDD')}</p>
              </div>
            </div>
            <p className="text-sm text-green-700 font-medium line-clamp-2">{latestActions.reward.title}</p>
          </div>
        )}

        {/* آخرین توبیخی */}
        {latestActions.warning && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-orange-800 text-sm">آخرین توبیخی</h4>
                <p className="text-xs text-orange-600">{moment(latestActions.warning.date).format('jYYYY/jMM/jDD')}</p>
              </div>
            </div>
            <p className="text-sm text-orange-700 font-medium line-clamp-2">{latestActions.warning.title}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// کامپوننت یادآوری‌های امروز
function TodayReminders({ teacherId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTodayReminders = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // دریافت آخرین 2 یادآوری که معلم ایجاد کرده
      const response = await fetch(`/api/teacher/news?teacherId=${userData.id}&limit=2`);
      const data = await response.json();
      
      if (data.success) {
        // اطمینان از اینکه فقط 2 مورد آخر نمایش داده شود
        setReminders((data.news || []).slice(0, 2));
      } else {
        setReminders([]);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setReminders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (reminder) => {
    window.location.href = '/teacher/reminders';
  };

  const handleDelete = async (id) => {
    if (confirm('آیا مطمئن هستید که می‌خواهید این یادآوری را حذف کنید؟')) {
      try {
        const response = await fetch(`/api/teacher/news?id=${id}`, {
          method: 'DELETE',
        });
        
        const result = await response.json();
        
        if (result.success) {
          fetchTodayReminders(); // بروزرسانی لیست
          alert('یادآوری با موفقیت حذف شد');
        } else {
          alert('خطا در حذف یادآوری');
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
        alert('خطا در حذف یادآوری');
      }
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchTodayReminders();
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
        آخرین یادآوری‌های من
      </h4>
      
      {reminders.length === 0 ? (
        <p className="text-sm text-gray-500">یادآوری‌ای ایجاد نکرده‌اید</p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
                  {reminder.title}
                </span>
                <p className="text-xs text-gray-500">
                  {reminder.reminder_date ? 
                    `یادآوری: ${moment(reminder.reminder_date).format('jMM/jDD')}` :
                    `ایجاد: ${moment(reminder.created_at).format('jMM/jDD')}`
                  }
                </p>
                <p className="text-xs text-gray-400">
                  مخاطب: {reminder.target_type === 'grade' ? 'پایه تحصیلی' : 
                           reminder.target_type === 'specific_student' ? 'دانش‌آموز خاص' : 
                           'همه دانش‌آموزان'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(reminder)}
                  className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                  title="ویرایش"
                >
                  <Edit className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="p-1 rounded bg-red-100 hover:bg-red-200 text-red-600 transition"
                  title="حذف"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => window.location.href = '/teacher/reminders'}
            className="w-full text-center text-xs text-yellow-600 hover:text-yellow-800 font-medium mt-2"
          >
            مشاهده همه یادآوری‌ها
          </button>
        </div>
      )}
    </div>
  );
}

function WeeklyStats({ teacherId }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teacherId) {
      fetchRecentActivities();
    }
  }, [teacherId]);

  const fetchRecentActivities = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // دریافت آخرین 2 یادآوری ایجاد شده
      const newsResponse = await fetch(`/api/teacher/news?teacherId=${userData.id}&limit=2`);
      const newsData = await newsResponse.json();
      
      let activities = [];
      
      if (newsData.success && newsData.news && newsData.news.length > 0) {
        activities = newsData.news.slice(0, 2).map(item => ({ // اطمینان از 2 مورد
          type: 'news',
          title: `ایجاد یادآوری: ${item.title}`,
          date: item.created_at,
          icon: 'news'
        }));
      }

      // اگر کمتر از 2 فعالیت داریم، پیش‌فرض اضافه کن
      if (activities.length < 2) {
        const placeholderActivities = [
          { type: 'login', title: 'ورود به سیستم', date: new Date(), icon: 'login' },
          { type: 'view', title: 'مشاهده داشبورد', date: new Date(Date.now() - 3600000), icon: 'view' }
        ];
        
        // فقط تا 2 مورد کل
        const needed = 2 - activities.length;
        activities = [...activities, ...placeholderActivities.slice(0, needed)];
      }

      // اطمینان نهایی: فقط 2 مورد
      setRecentActivities(activities.slice(0, 2));
    } catch (error) {
      // فقط 1 مورد پیش‌فرض
      setRecentActivities([
        { type: 'system', title: 'ورود به سیستم', date: new Date(), icon: 'login' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (iconType) => {
    switch (iconType) {
      case 'news': return NewspaperIcon;
      case 'login': return User;
      case 'view': return Eye;
      case 'class': return GraduationCap;
      case 'exam': return FileText;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">آخرین فعالیت‌های من</h4>
      <div className="space-y-2 md:space-y-3">
        {recentActivities.length === 0 ? (
          <p className="text-sm text-gray-500">فعالیت اخیری وجود ندارد</p>
        ) : (
          recentActivities.map((activity, index) => {
            const IconComponent = getActivityIcon(activity.icon);
            return (
              <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-3 h-3 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
                    {activity.title}
                  </span>
                  <p className="text-xs text-gray-500">
                    {moment(activity.date).format('jMM/jDD - HH:mm')}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function UrgentNews({ teacherId }) {
  const [latestNews, setLatestNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchLatestNews();
    }
  }, [teacherId]);

  const fetchLatestNews = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/news?role=teacher&userId=${userData.id}`);
      const data = await response.json();
      if (data.success && data.news && data.news.length > 0) {
        // فقط آخرین خبر بر اساس تاریخ
        const sorted = [...data.news].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
        setLatestNews(sorted[0]);
      } else {
        setLatestNews(null);
      }
    } catch (error) {
      setLatestNews(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!latestNews) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
          آخرین خبر
        </h4>
        <p className="text-sm text-gray-500">خبری وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
        آخرین خبر
      </h4>
      <div
        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-green-500"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
              {latestNews.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {moment(latestNews.publish_date).format('jMM/jDD')}
            </span>
          </div>
        </div>
        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Modal نمایش جزئیات خبر */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
              <h2 className="text-lg font-bold text-green-700">جزئیات خبر</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <h3 className="font-bold text-gray-800">{latestNews.title}</h3>
              <p className="text-gray-700">{latestNews.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{moment(latestNews.publish_date).format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UrgentCirculars({ teacherId }) {
  const [latestCircular, setLatestCircular] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchLatestCircular();
    }
  }, [teacherId]);

  const fetchLatestCircular = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/circulars?role=teacher&userId=${userData.id}`);
      const data = await response.json();
      if (data.success && data.circulars && data.circulars.length > 0) {
        // فقط آخرین بخشنامه بر اساس تاریخ
        const sorted = [...data.circulars].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
        setLatestCircular(sorted[0]);
      } else {
        setLatestCircular(null);
      }
    } catch (error) {
      setLatestCircular(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!latestCircular) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
          آخرین بخشنامه
        </h4>
        <p className="text-sm text-gray-500">بخشنامه‌ای وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
        آخرین بخشنامه
      </h4>
      <div
        className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        <div className="w-2 h-2 rounded-full flex-shrink-0 bg-blue-500"></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
              {latestCircular.title}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              {moment(latestCircular.publish_date).format('jMM/jDD')}
            </span>
          </div>
        </div>
        <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
      </div>

      {/* Modal نمایش جزئیات بخشنامه */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-blue-100 to-blue-50 border-b border-blue-100">
              <h2 className="text-lg font-bold text-blue-700">جزئیات بخشنامه</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-full bg-blue-50 hover:bg-blue-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <h3 className="font-bold text-gray-800">{latestCircular.title}</h3>
              <p className="text-gray-700">{latestCircular.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{moment(latestCircular.publish_date).format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, gradient, iconGradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-xl md:rounded-2xl p-2 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg`}>
      <div className="flex items-center justify-between mb-2 md:mb-6">
        <div className={`w-7 h-7 md:w-14 md:h-14 bg-gradient-to-r ${iconGradient} rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-4 h-4 md:w-7 md:h-7 text-white" />
        </div>
        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
      </div>
      <div>
        <p className="text-base md:text-4xl font-bold text-gray-800 mb-0.5 md:mb-2">{value}</p>
        <p className="text-xs md:text-base text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}

// Quick Access Card Component
function QuickAccessCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-white to-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-right"
    >
      <div className="flex items-start gap-2 md:gap-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r ${color} rounded-lg md:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors text-sm md:text-base">{title}</h4>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}