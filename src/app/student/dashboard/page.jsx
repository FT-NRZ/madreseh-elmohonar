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
  Settings,
  LogOut,
  Home,
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  Star,
  Users
} from 'lucide-react';

// Mock components for demonstration
const StudentProfile = ({ studentId }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-green-100">
    <div className="flex items-center space-x-6 rtl:space-x-reverse">
      <div className="w-24 h-24 bg-gradient-to-br from-[#399918] to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
        د
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">پروفایل دانش‌آموز</h2>
        <p className="text-gray-600 mb-1">کلاس: در حال بارگذاری...</p>
        <p className="text-gray-600">کد دانش‌آموزی: {studentId}</p>
      </div>
    </div>
  </div>
);

const WeeklySchedule = ({ studentId }) => (
  <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-green-100">
    <h3 className="text-xl font-bold text-gray-900 mb-6">برنامه هفتگی</h3>
    <div className="space-y-4">
      {['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'].map((day, index) => (
        <div key={day} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-100">
          <span className="font-semibold text-gray-800">{day}</span>
          <span className="text-sm text-gray-600">8 کلاس درس</span>
        </div>
      ))}
    </div>
  </div>
);

const dashboardTabs = [
  { key: 'profile', label: 'پروفایل دانش‌آموز', icon: User, color: 'from-[#399918] to-green-600' },
  { key: 'schedule', label: 'برنامه هفتگی', icon: Calendar, color: 'from-green-500 to-green-600' },
  { key: 'attendance', label: 'حضور و غیاب', icon: ClipboardList, color: 'from-lime-500 to-green-600' },
  { key: 'report', label: 'کارنامه‌ها', icon: BookOpen, color: 'from-green-700 to-[#399918]' },
  { key: 'exams', label: 'آزمون‌ها', icon: FileText, color: 'from-green-400 to-green-700' },
  { key: 'examResults', label: 'نتایج آزمون', icon: Award, color: 'from-[#399918] to-lime-500' },
  { key: 'classnews', label: 'اخبار کلاس', icon: Newspaper, color: 'from-green-300 to-green-600' },
  { key: 'schoolnews', label: 'اخبار مدرسه', icon: School, color: 'from-green-200 to-[#399918]' },
  { key: 'gallery', label: 'گالری', icon: Image, color: 'from-green-400 to-green-500' },
  { key: 'meals', label: 'برنامه غذایی', icon: UtensilsCrossed, color: 'from-[#399918] to-green-400' },
  { key: 'suggestion', label: 'ارسال نظر/پیشنهاد', icon: MessageSquare, color: 'from-green-600 to-[#399918]' },
];

const quickActions = [
  { title: 'مشاهده نمرات جدید', icon: TrendingUp, color: 'bg-gradient-to-r from-[#399918] to-green-600' },
  { title: 'برنامه امروز', icon: Clock, color: 'bg-gradient-to-r from-green-500 to-green-600' },
  { title: 'آزمون‌های نزدیک', icon: Star, color: 'bg-gradient-to-r from-green-400 to-green-700' },
  { title: 'گروه‌های کلاسی', icon: Users, color: 'bg-gradient-to-r from-green-700 to-[#399918]' },
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
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">حضور و غیاب</h3>
            <p className="text-gray-600">اطلاعات حضور و غیاب در اینجا نمایش داده می‌شود.</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-green-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6">{dashboardTabs.find(tab => tab.key === activeTab)?.label}</h3>
            <p className="text-gray-600">محتوای این بخش در حال توسعه است.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-green-200">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#399918] rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-green-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-[#399918] to-green-600 text-white hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#399918] to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <School className="text-white" size={20} />
                </div>
                <div>
                  <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-[#399918] via-green-600 to-green-700 bg-clip-text text-transparent">
                    سامانه دانش‌آموز
                  </h1>
                  {mounted && (
                    <p className="text-xs text-green-700 font-medium">
                      {currentTime.toLocaleDateString('fa-IR')} - {currentTime.toLocaleTimeString('fa-IR')}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="relative p-2 text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-500 to-green-700 rounded-full flex items-center justify-center text-white text-xs font-bold animate-pulse">
                  3
                </span>
              </button>
              <button className="p-2 text-green-700 hover:bg-green-50 rounded-xl transition-all duration-200">
                <Settings size={20} />
              </button>
              <div className="w-8 h-8 bg-gradient-to-r from-green-700 to-[#399918] rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                د
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay for Mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        {/* دسکتاپ: sticky و همیشه ثابت */}
        <aside
          className={`
            hidden lg:block
            sticky top-16
            h-[calc(100vh-4rem)]
            w-80
            bg-white/95 backdrop-blur-xl shadow-2xl z-50
            border-l border-green-200 overflow-y-auto
          `}
          style={{ minHeight: 'calc(100vh - 4rem)' }}
        >
          {/* Sidebar Header */}
          <div className="p-4 bg-gradient-to-r from-[#399918] via-green-600 to-green-700 text-white relative overflow-hidden">
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold mb-1">منوی دانش‌آموز</h2>
                <p className="text-green-100 text-sm">دانش‌آموز</p>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
              <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            {/* Dashboard Button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group w-full text-right p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden
                ${activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-[#399918] to-green-600 text-white shadow-lg scale-[1.02]'
                  : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-md'
                }`}
            >
              <div className="flex items-center gap-3">
                <Home size={20} />
                <span className="text-sm">داشبورد اصلی</span>
              </div>
              {activeTab === 'dashboard' && <ChevronRight size={18} />}
            </button>
            {/* Other Menu Items */}
            {dashboardTabs.map(tab => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`group w-full text-right p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden
                    ${activeTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-[1.02]`
                      : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-md'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent size={20} />
                    <span className="text-sm">{tab.label}</span>
                  </div>
                  {activeTab === tab.key && <ChevronRight size={18} />}
                </button>
              );
            })}
            {/* Logout Button */}
            <div className="pt-4 mt-4 border-t border-green-200">
              <button className="w-full text-right p-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-300 flex items-center gap-3 group">
                <LogOut size={20} className="group-hover:transform group-hover:scale-110 transition-transform" />
                <span className="text-sm">خروج از سیستم</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* موبایل: سایدبار متحرک */}
        {isSidebarOpen && (
          <aside
            className={`
              fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50
              border-l border-green-200 overflow-y-auto transition-all duration-300
              lg:hidden
            `}
          >
            <div className="p-4 bg-gradient-to-r from-[#399918] via-green-600 to-green-700 text-white relative overflow-hidden">
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold mb-1">منوی دانش‌آموز</h2>
                  <p className="text-green-100 text-sm">دانش‌آموز</p>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-all duration-200"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
                <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
              <button
                onClick={() => {
                  setActiveTab('dashboard');
                  setIsSidebarOpen(false);
                }}
                className={`group w-full text-right p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden
                  ${activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-[#399918] to-green-600 text-white shadow-lg scale-[1.02]'
                    : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-md'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Home size={20} />
                  <span className="text-sm">داشبورد اصلی</span>
                </div>
                {activeTab === 'dashboard' && <ChevronRight size={18} />}
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
                    className={`group w-full text-right p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-between relative overflow-hidden
                      ${activeTab === tab.key
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-[1.02]`
                        : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent size={20} />
                      <span className="text-sm">{tab.label}</span>
                    </div>
                    {activeTab === tab.key && <ChevronRight size={18} />}
                  </button>
                );
              })}
              <div className="pt-4 mt-4 border-t border-green-200">
                <button className="w-full text-right p-3 rounded-xl font-semibold text-red-600 hover:bg-red-50 hover:shadow-md transition-all duration-300 flex items-center gap-3 group">
                  <LogOut size={20} className="group-hover:transform group-hover:scale-110 transition-transform" />
                  <span className="text-sm">خروج از سیستم</span>
                </button>
              </div>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:pr-0 relative">
          <div className="max-w-6xl mx-auto p-6">
            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-[#399918] via-green-600 to-green-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-3">خوش آمدید! 👋</h2>
                    <p className="text-green-100 text-lg mb-4">به سامانه دانش‌آموز خوش آمدید</p>
                    <div className="flex items-center gap-4 text-green-100">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="text-sm">سال تحصیلی 1403-1402</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span className="text-sm">ترم دوم</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="w-48 h-48 bg-white rounded-full absolute -top-24 -left-24 animate-pulse"></div>
                    <div className="w-32 h-32 bg-white rounded-full absolute top-1/2 -right-16 animate-pulse delay-1000"></div>
                    <div className="w-24 h-24 bg-white rounded-full absolute bottom-0 left-1/3 animate-pulse delay-2000"></div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#399918] to-green-600 rounded-xl flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-xs font-medium">معدل کل</p>
                        <p className="text-2xl font-bold text-[#399918]">18.5</p>
                      </div>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-[#399918] to-green-600 h-2 rounded-full" style={{width: '92.5%'}}></div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                        <ClipboardList className="text-white" size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-xs font-medium">درصد حضور</p>
                        <p className="text-2xl font-bold text-green-600">98%</p>
                      </div>
                    </div>
                    <div className="w-full bg-green-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{width: '98%'}}></div>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-700 rounded-xl flex items-center justify-center">
                        <FileText className="text-white" size={20} />
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-xs font-medium">آزمون‌های آتی</p>
                        <p className="text-2xl font-bold text-green-700">3</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3].map(i => (
                        <div key={i} className="flex-1 h-2 bg-gradient-to-r from-green-400 to-green-700 rounded-full"></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-green-200 hover:shadow-2xl transition-all duration-300 hover:transform hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-700 to-[#399918] rounded-xl flex items-center justify-center relative">
                        <MessageSquare className="text-white" size={20} />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-700 rounded-full flex items-center justify-center text-white text-xs animate-pulse"></span>
                      </div>
                      <div className="text-right">
                        <p className="text-green-700 text-xs font-medium">پیام‌های جدید</p>
                        <p className="text-2xl font-bold text-green-700">7</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-700">2 پیام خوانده نشده</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xl font-bold text-green-800 mb-4">دسترسی سریع</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className={`${action.color} text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}
                      >
                        <action.icon size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                        <p className="font-semibold text-sm">{action.title}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-4">فعالیت‌های اخیر</h3>
                  <div className="space-y-3">
                    {[
                      { title: 'نمره آزمون ریاضی ثبت شد', time: '2 ساعت پیش', type: 'exam' },
                      { title: 'اخبار جدید کلاس منتشر شد', time: '5 ساعت پیش', type: 'news' },
                      { title: 'برنامه غذایی هفته آینده اعلام شد', time: '1 روز پیش', type: 'meal' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#399918] to-green-600 rounded-full flex items-center justify-center">
                            <Star size={14} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-800 text-sm">{activity.title}</p>
                            <p className="text-xs text-green-700">{activity.time}</p>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-green-400" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Other Tab Content */}
            {activeTab !== 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`w-12 h-12 bg-gradient-to-r ${dashboardTabs.find(tab => tab.key === activeTab)?.color || 'from-[#399918] to-green-600'} rounded-2xl flex items-center justify-center`}>
                    {(() => {
                      const tab = dashboardTabs.find(tab => tab.key === activeTab);
                      if (tab?.icon) {
                        const IconComponent = tab.icon;
                        return <IconComponent size={24} className="text-white" />;
                      }
                      return null;
                    })()}
                  </div>
                  <h1 className="text-3xl font-bold text-green-800">
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