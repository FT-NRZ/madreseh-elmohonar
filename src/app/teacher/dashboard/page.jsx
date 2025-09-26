'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, User, GraduationCap, BookOpen, BarChart3, Settings,Eye, LogOut,
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  ClipboardList, FileText, Image, MessageSquare, Home, LayoutGrid, 
  GalleryHorizontalEnd, ArrowRight, Coffee, Bell, NewspaperIcon, Menu, X,
  Send,Edit, Trash2, Award, AlertTriangle,
  Shield
} from 'lucide-react';
import Circulars from '../components/Circulars';
import UrgentCirculars from '../components/UrgentCirculars';
import MyClasses from '../components/MyClasses';
import WeeklySchedule from '../components/WeeklySchedule';
import ExamsList from '../components/ExamsList';
import ReportCards from '../components/ReportCards';
import SuggestionForm from '../components/SuggestionForm';
import News from '../components/News';
import Reminders from '../components/Reminders';
import moment from 'jalali-moment';
import Disciplinary from '../components/Disciplinary';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, key: 'dashboard' },
  { label: 'کلاس‌های من', icon: GraduationCap, key: 'classes' },
  { label: 'برنامه هفتگی', icon: Calendar, key: 'schedule' },
  { label: 'آزمون‌ها', icon: FileText, key: 'exams' },
  { label: 'کارنامه‌ها', icon: BookOpen, key: 'reportCards' },
  { label: 'اخبار معلمین', icon: NewspaperIcon, key: 'news' },
  { label: 'یادآوری/خبر دانش‌آموزان', icon: Send, key: 'reminders' },
  { label: 'بخشنامه‌های داخلی', icon: Shield, key: 'circulars' }, 
  { label: 'توبیخی و تشویقی من', icon: Shield, key: 'disciplinary' }, 
  { label: 'ارسال پیام/پیشنهاد', icon: MessageSquare, key: 'suggestion' },
  { label: 'تنظیمات', icon: Settings, key: 'settings' }
];

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [teacherId, setTeacherId] = useState(null);
  const [teacherStats, setTeacherStats] = useState({
    classes: 0,
    students: 0,
    exams: 0
  });
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    if (typeof window !== "undefined") {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setTeacher(user);
      setLoading(false);
      const nationalCode = user?.nationalCode;
      if (nationalCode) fetchTeacherStats(nationalCode);
    }
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <MyClasses teacherId={teacherId} />;
      case 'schedule':
        return <WeeklySchedule />;
      case 'exams':
        return <ExamsList teacherId={teacherId} />;
      case 'reportCards':
        return <ReportCards />;
      case 'news':
        return <News teacherId={teacherId} />;
      case 'reminders':
        return <Reminders teacherId={teacherId} />;
      case 'circulars':
        return <Circulars teacherId={teacherId} />;
      case 'suggestion':
        return <SuggestionForm />;
      case 'disciplinary':
        return <Disciplinary teacherId={teacherId} />;
      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4">تنظیمات</h3>
            <p className="text-gray-600">در این بخش می‌توانید تنظیمات پنل معلم را انجام دهید.</p>
          </div>
        );
      default:
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
                  onClick={() => setActiveTab('schedule')}
                />
                <QuickAccessCard
                  title="اخبار و اطلاعیه‌ها"
                  description="مشاهده اخبار عمومی و اطلاعیه‌های شخصی"
                  icon={NewspaperIcon}
                  color="from-purple-500 to-purple-600"
                  onClick={() => setActiveTab('news')}
                />
                <QuickAccessCard
                  title="کلاس‌های من"
                  description="مدیریت و مشاهده کلاس‌های تحت نظارت"
                  icon={GraduationCap}
                  color="from-green-500 to-green-600"
                  onClick={() => setActiveTab('classes')}
                />
                <QuickAccessCard
                  title="آزمون‌ها"
                  description="مدیریت آزمون‌ها و نتایج دانش‌آموزان"
                  icon={FileText}
                  color="from-orange-500 to-orange-600"
                  onClick={() => setActiveTab('exams')}
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
              <TodayReminders teacherId={teacherId} setActiveTab={setActiveTab} />
              <WeeklyStats teacherId={teacherId} />
            </div>
          </div>
        );
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* موبایل: هدر و دکمه منو */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 border-b border-green-100 shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Crown className="w-7 h-7 text-green-700" />
            <span className="font-bold text-green-700">پنل معلم</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* موبایل: سایدبار drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-4 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Crown className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">پنل معلم</h2>
                  <p className="text-green-700 text-sm">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'مدرسه علم و هنر'}</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
              {sidebarMenu.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => {
                      setSidebarOpen(false);
                      setActiveTab(item.key);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow scale-[1.02]'
                        : 'text-green-700 hover:bg-green-50 hover:shadow'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-green-50'}`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 mt-4 transition"
              >
                <div className="p-2 rounded-xl bg-red-100">
                  <LogOut size={16} />
                </div>
                <span className="text-sm">خروج از سیستم</span>
              </button>
            </nav>
          </aside>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:block right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
          <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold">پنل معلم</h2>
                <p className="text-green-700 text-sm">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'مدرسه علم و هنر'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{teacherStats.classes}</p>
                <p className="text-xs text-green-600">کلاس‌ها</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">{teacherStats.students}</p>
                <p className="text-xs text-green-600">دانش‌آموزان</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            {sidebarMenu.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow-xl scale-[1.02] transform'
                      : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-green-50'}`}>
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

        {/* Bottom Navigation - Mobile */}
        <nav className="fixed md:hidden bottom-0 left-0 right-0 z-30 bg-white border-t border-green-200 flex justify-around items-center py-1 shadow-xl">
          {sidebarMenu.slice(0, 5).map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold transition-all ${isActive ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
              >
                <IconComponent size={20} />
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={logout}
            className="flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold text-red-500"
          >
            <LogOut size={20} />
            <span className="mt-0.5">خروج</span>
          </button>
        </nav>

        {/* Main Content */}
        <main className="flex-1 pb-16 md:pb-0 p-2 md:p-6 space-y-3 md:space-y-8 mt-2 md:mt-0">
          <div className="space-y-4 md:space-y-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

function LatestDisciplinary({ teacherId }) {
  const [latestActions, setLatestActions] = React.useState({ reward: null, warning: null });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (teacherId) {
      fetchLatestDisciplinary();
    }
    async function fetchLatestDisciplinary() {
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
    }
  }, [teacherId]);

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
function TodayReminders({ teacherId, setActiveTab }) { // اضافه کردن setActiveTab به props
  const [reminders, setReminders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

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
    // بررسی وجود setActiveTab
    if (setActiveTab && typeof setActiveTab === 'function') {
      setActiveTab('reminders');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('editReminder', { detail: reminder }));
      }, 100);
    } else {
      console.error('setActiveTab function not provided');
    }
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

  React.useEffect(() => {
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
        </div>
      )}
    </div>
  );
}

function WeeklyStats({ teacherId }) {
  const [recentActivities, setRecentActivities] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (teacherId) {
      fetchRecentActivities();
    }
    async function fetchRecentActivities() {
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
    }
  }, [teacherId]);

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
  const [latestNews, setLatestNews] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);

  React.useEffect(() => {
    if (teacherId) {
      fetchLatestNews();
    }
    async function fetchLatestNews() {
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