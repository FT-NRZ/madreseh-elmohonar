'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, User, GraduationCap, BookOpen, BarChart3, Settings, LogOut,
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  ClipboardList, FileText, Image, MessageSquare, Home, LayoutGrid, 
  GalleryHorizontalEnd, ArrowRight, Coffee, Bell
} from 'lucide-react';

import MyClasses from '../components/MyClasses';
import WeeklySchedule from '../components/WeeklySchedule';
import ExamsList from '../components/ExamsList';
import ExamResults from '../components/ExamResults';
import ReportCards from '../components/ReportCards';
import SuggestionForm from '../components/SuggestionForm';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, key: 'dashboard' },
  { label: 'کلاس‌های من', icon: GraduationCap, key: 'classes' },
  { label: 'برنامه هفتگی', icon: Calendar, key: 'schedule' },
  { label: 'آزمون‌ها', icon: FileText, key: 'exams' },
  { label: 'کارنامه‌ها', icon: BookOpen, key: 'reportCards' },
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

  const fetchTeacherStats = async (nationalCode) => {
  try {
    console.log('📞 Fetching stats for national code:', nationalCode);
    const res = await fetch(`/api/teacher/stats?nationalCode=${nationalCode}`);
    console.log('📊 Stats API response status:', res.status);
    
    if (res.ok) {
      const data = await res.json();
      console.log('📊 Stats API response data:', data);
      
      // تنظیم آمار
      setTeacherStats(data.stats || { classes: 0, students: 0, exams: 0 });
      
      // تنظیم teacherId - این خط مهم است!
      if (data.teacherId) {
        console.log('✅ Setting teacherId:', data.teacherId);
        setTeacherId(data.teacherId);
      } else {
        console.log('⚠️ No teacherId in response');
      }
    } else {
      console.log('⚠️ Stats API failed, using fallback data');
      setTeacherStats({ classes: 0, students: 0, exams: 0 });
    }
  } catch (error) {
    console.error('💥 Error fetching teacher stats:', error);
    setTeacherStats({ classes: 0, students: 0, exams: 0 });
  }
};

useEffect(() => {
  if (typeof window !== "undefined") {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setTeacher(user);
    setLoading(false);
    
    const nationalCode = user?.nationalCode;
    if (nationalCode) {
      fetchTeacherStats(nationalCode);
    }
  }
}, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  const renderContent = () => {
    console.log('🎯 Dashboard renderContent - teacherId:', teacherId);
    switch (activeTab) {
      case 'classes':
        return <MyClasses teacherId={teacherId} />;
      case 'schedule':
        return <WeeklySchedule />;
      case 'exams':
        return <ExamsList teacherId={teacherId} />;
      case 'reportCards':
        return <ReportCards />;
      case 'suggestion':
        return <SuggestionForm />;
      case 'settings':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">تنظیمات</h3>
            <p className="text-gray-600">در این بخش می‌توانید تنظیمات پنل معلم را انجام دهید.</p>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* خوش‌آمدگویی */}
            <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Coffee className="w-8 h-8 text-white" />
                  <div>
                    <h1 className="text-2xl font-bold mb-3">
                      {loading ? 'در حال بارگذاری...' : `${getGreeting()}، ${teacher?.firstName || 'معلم عزیز'} ${teacher?.lastName || ''} 👋`}
                    </h1>
                    <p className="text-green-100">
                      {teacher?.subject ? `معلم ${teacher.subject}` : 'به داشبورد معلم خوش آمدید.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* آمار معلم */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* دکمه‌های دسترسی سریع */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-green-600" />
                دسترسی سریع
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAccessCard
                  title="برنامه هفتگی"
                  description="مشاهده و مدیریت برنامه هفتگی کلاس‌ها"
                  icon={Calendar}
                  color="from-blue-500 to-blue-600"
                  onClick={() => setActiveTab('schedule')}
                />
                
                <QuickAccessCard
                  title="حضور و غیاب"
                  description="ثبت و مشاهده وضعیت حضور دانش‌آموزان"
                  icon={ClipboardList}
                  color="from-purple-500 to-purple-600"
                  onClick={() => setActiveTab('attendance')}
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

            {/* اطلاعات تکمیلی */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-yellow-500" />
                  یادآوری‌های امروز
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">کلاس ریاضی - ساعت ۱۰:۳۰</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">تصحیح آزمون علوم</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <h4 className="text-lg font-bold text-gray-900 mb-4">آمار این هفته</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">کلاس‌های برگزار شده</span>
                    <span className="font-bold text-green-600">۱۲</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">آزمون‌های تصحیح شده</span>
                    <span className="font-bold text-blue-600">۸</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">حضور دانش‌آموزان</span>
                    <span className="font-bold text-purple-600">۹۲٪</span>
                  </div>
                </div>
              </div>
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
      <div className="flex flex-col sm:flex-row">
        {/* Sidebar - همان کد قبلی */}
        <aside className="right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
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
        <nav className="fixed sm:hidden bottom-0 left-0 right-0 z-30 bg-white border-t border-green-200 flex justify-around items-center py-1 shadow-xl">
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
        <main className="flex-1 pb-16 sm:pb-0 p-2 sm:p-6 space-y-3 sm:space-y-8 mt-2 sm:mt-0">
          <div className="space-y-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}

// Stats Card Component
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
        <p className="text-lg sm:text-4xl font-bold text-gray-800 mb-0.5 sm:mb-2">{value}</p>
        <p className="text-xs sm:text-base text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}

// Quick Access Card Component
function QuickAccessCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] text-left"
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors">{title}</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}