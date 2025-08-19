'use client'

import { useState, useEffect } from 'react';
import { 
  Menu, 
  X, 
  User, 
  Calendar, 
  ClipboardList, 
  BookOpen, 
  FileText, 
  Newspaper, 
  School, 
  Image, 
  UtensilsCrossed, 
  MessageSquare,
  Bell,
  LogOut,
  Home,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  Users
} from 'lucide-react';

// Simple components
const StudentProfile = ({ studentId }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center gap-4 mb-6">
      <div className="w-20 h-20 bg-gradient-to-br from-[#399918] to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
        د
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">پروفایل دانش‌آموز</h2>
        <p className="text-gray-600 mt-1">کلاس ششم ابتدایی</p>
        <p className="text-gray-500 text-sm">کد دانش‌آموزی: {studentId}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gray-50 p-4 rounded-xl text-center">
        <p className="text-gray-600 text-sm mb-1">رتبه کلاس</p>
        <p className="text-2xl font-bold text-[#399918]">3</p>
      </div>
      <div className="bg-gray-50 p-4 rounded-xl text-center">
        <p className="text-gray-600 text-sm mb-1">معدل کل</p>
        <p className="text-2xl font-bold text-[#399918]">18.5</p>
      </div>
    </div>
  </div>
);

const WeeklySchedule = ({ studentId }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
      <Calendar size={24} className="text-[#399918]" />
      برنامه هفتگی
    </h3>
    <div className="space-y-3">
      {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'].map((day) => (
        <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <span className="font-medium text-gray-800">{day}</span>
          <span className="text-sm text-gray-600">6 کلاس درس</span>
        </div>
      ))}
    </div>
  </div>
);

const dashboardTabs = [
  { key: 'profile', label: 'پروفایل دانش‌آموز', icon: User },
  { key: 'schedule', label: 'برنامه هفتگی', icon: Calendar },
  { key: 'attendance', label: 'حضور و غیاب', icon: ClipboardList },
  { key: 'report', label: 'کارنامه‌ها', icon: BookOpen },
  { key: 'exams', label: 'آزمون‌ها', icon: FileText },
  { key: 'examResults', label: 'نتایج آزمون', icon: Award },
  { key: 'classnews', label: 'اخبار کلاس', icon: Newspaper },
  { key: 'schoolnews', label: 'اخبار مدرسه', icon: School },
  { key: 'gallery', label: 'گالری', icon: Image },
  { key: 'meals', label: 'برنامه غذایی', icon: UtensilsCrossed },
  { key: 'suggestion', label: 'ارسال نظر/پیشنهاد', icon: MessageSquare },
];

const quickActions = [
  { title: 'مشاهده نمرات', icon: TrendingUp },
  { title: 'برنامه امروز', icon: Clock },
  { title: 'آزمون‌ها', icon: Star },
  { title: 'گروه کلاسی', icon: Users },
];

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  const studentId = '12345';

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile studentId={studentId} />;
      case 'schedule':
        return <WeeklySchedule studentId={studentId} />;
      case 'attendance':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ClipboardList size={24} className="text-[#399918]" />
              حضور و غیاب
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-xl text-center border border-green-100">
                <p className="text-2xl font-bold text-green-600 mb-1">145</p>
                <p className="text-green-600 text-sm">روز حاضر</p>
              </div>
              <div className="bg-red-50 p-4 rounded-xl text-center border border-red-100">
                <p className="text-2xl font-bold text-red-600 mb-1">3</p>
                <p className="text-red-600 text-sm">روز غایب</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center border border-blue-100">
                <p className="text-2xl font-bold text-blue-600 mb-1">98%</p>
                <p className="text-blue-600 text-sm">درصد حضور</p>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {dashboardTabs.find(tab => tab.key === activeTab)?.label}
            </h3>
            <p className="text-gray-600">محتوای این بخش در حال توسعه است.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 rounded-lg bg-[#399918] text-white hover:bg-green-700 transition-colors"
                aria-label="باز کردن منو"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#399918] rounded-lg flex items-center justify-center">
                  <School className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#399918]">سامانه دانش‌آموز</h1>
                  {mounted && (
                    <p className="text-xs text-gray-600 hidden sm:block">
                      {currentTime.toLocaleDateString('fa-IR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  3
                </span>
              </button>
              <div className="w-8 h-8 bg-[#399918] rounded-lg flex items-center justify-center text-white text-sm font-bold">
                د
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-50
          transition-transform duration-300 md:static md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}
          md:sticky md:top-16
          overflow-y-auto
        `}>
          {/* Sidebar Header */}
          <div className="p-4 bg-[#399918] text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold">منوی دانش‌آموز</h2>
              <p className="text-green-100 text-sm">دانش‌آموز</p>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 hover:bg-white/20 rounded-lg"
              aria-label="بستن منو"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                setIsSidebarOpen(false);
              }}
              className={`w-full text-right p-3 rounded-lg font-medium transition-colors flex items-center justify-between ${
                activeTab === 'dashboard'
                  ? 'bg-[#399918] text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home size={18} />
                <span>داشبورد اصلی</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight size={16} />}
            </button>

            {dashboardTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-right p-3 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    activeTab === tab.key
                      ? 'bg-[#399918] text-white'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={18} />
                    <span className="text-sm">{tab.label}</span>
                  </div>
                  {activeTab === tab.key && <ChevronRight size={16} />}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-gray-200">
              <button className="w-full text-right p-3 rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors flex items-center gap-3">
                <LogOut size={18} />
                <span>خروج از سیستم</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:mr-0">
          <div className="p-4 sm:p-6">
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[#399918] to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">👋</span>
                    <h2 className="text-xl sm:text-2xl font-bold">خوش آمدید!</h2>
                  </div>
                  <p className="text-green-100 mb-4 text-sm sm:text-base"> به سامانه دانش‌آموز خوش آمدید</p>
                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      سال تحصیلی 1403-1402
                    </div>
                    <div className="bg-white/20 px-3 py-1 rounded-full">
                      ترم دوم
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#399918] rounded-lg flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="text-white" size={18} />
                      </div>
                      <p className="text-gray-600 text-xs mb-1">معدل کل</p>
                      <p className="text-2xl font-bold text-[#399918]">18.5</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div className="bg-[#399918] h-2 rounded-full" style={{width: '92.5%'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <ClipboardList className="text-white" size={18} />
                      </div>
                      <p className="text-gray-600 text-xs mb-1">درصد حضور</p>
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '98%'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                        <FileText className="text-white" size={18} />
                      </div>
                      <p className="text-gray-600 text-xs mb-1">آزمون آتی</p>
                      <p className="text-2xl font-bold text-blue-600">3</p>
                      <p className="text-xs text-gray-500 mt-1">ریاضی، علوم، فارسی</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-3 relative">
                        <MessageSquare className="text-white" size={18} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                      </div>
                      <p className="text-gray-600 text-xs mb-1">پیام جدید</p>
                      <p className="text-2xl font-bold text-orange-600">7</p>
                      <p className="text-xs text-gray-500 mt-1">2 خوانده نشده</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">دسترسی سریع</h3>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group text-center"
                      >
                        <action.icon size={24} className="mb-2 text-[#399918] group-hover:scale-110 transition-transform mx-auto" />
                        <p className="font-medium text-gray-800 text-sm">{action.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">فعالیت‌های اخیر</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'نمره آزمون ریاضی ثبت شد', time: '2 ساعت پیش', color: 'bg-green-500' },
                      { title: 'اخبار جدید کلاس منتشر شد', time: '5 ساعت پیش', color: 'bg-blue-500' },
                      { title: 'برنامه غذایی هفته آینده اعلام شد', time: '1 روز پیش', color: 'bg-orange-500' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Star size={14} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 text-sm truncate">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Tab Content */}
            {activeTab !== 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#399918] rounded-lg flex items-center justify-center">
                    {(() => {
                      const tab = dashboardTabs.find(tab => tab.key === activeTab);
                      if (tab?.icon) {
                        const IconComponent = tab.icon;
                        return <IconComponent size={20} className="text-white" />;
                      }
                      return null;
                    })()}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    {dashboardTabs.find(tab => tab.key === activeTab)?.label}
                  </h1>
                </div>
                {renderContent()}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}