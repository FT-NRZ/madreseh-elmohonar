'use client'

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import WeeklySchedule from '../components/WeeklySchedule'; // اضافه کردن import
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null); // اضافه کردن state برای user

  // studentId ثابت یا از localStorage
  const studentId = '4';

  useEffect(() => {
    setMounted(true);
    
    // دریافت اطلاعات کاربر از localStorage یا API
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // اگر اطلاعات کاربر وجود ندارد، مقدار پیش‌فرض قرار دهید
      setUser({ id: 1 }); // یا هر مقدار مناسب دیگری
    }
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile studentId={studentId} />;
      case 'schedule':
        return <WeeklySchedule studentId={4} />;
      case 'allSchedules':
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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // ...باقی کد بدون تغییر...
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex">
        {/* Sidebar - Fixed on right like admin panel */}
        <aside className="right-0 top-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-200">
          <div className="p-6 bg-gradient-to-r from-green-600 via-green-500 to-green-700 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <School className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">پنل دانش‌آموز</h2>
                  <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
                </div>
              </div>
              {/* Quick Stats in Sidebar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">18.5</p>
                  <p className="text-xs text-white/80">معدل</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">98%</p>
                  <p className="text-xs text-white/80">حضور</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
              <div className="w-20 h-20 bg-white rounded-full absolute -top-10 -right-10"></div>
              <div className="w-16 h-16 bg-white rounded-full absolute -bottom-8 -left-8"></div>
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {/* Dashboard Button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl scale-[1.02] transform'
                  : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-white/20' : 'bg-green-100'}`}>
                <Home size={18} />
              </div>
              <span className="text-sm">داشبورد اصلی</span>
            </button>

            {/* Other Menu Items */}
            {dashboardTabs.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-xl scale-[1.02] transform'
                      : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? 'bg-white/20' : 'bg-green-100'}`}>
                    <IconComponent size={18} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
            
            {/* Logout Button */}
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

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8">
          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                        خوش آمدید دانش‌آموز عزیز!
                      </h2>
                      <p className="text-white/90 mb-6 text-lg">به سامانه دانش‌آموز خوش آمدید</p>
                      <div className="flex items-center space-x-6 text-white/80">
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                        </div>
                        <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-lg rounded-xl px-4 py-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">{new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center shadow-2xl">
                      <School className="w-16 h-16 text-white" />
                    </div>
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
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
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
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
              <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                      {(() => {
                        const tab = dashboardTabs.find(tab => tab.key === activeTab);
                        if (tab?.icon) {
                          const IconComponent = tab.icon;
                          return <IconComponent size={24} className="text-white" />;
                        }
                        return null;
                      })()}
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                      {dashboardTabs.find(tab => tab.key === activeTab)?.label}
                    </h1>
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-green-200 p-8">
                {renderContent()}
              </div>
            </div>
          )}
        </main>
      </div>
      
      <Toaster position="bottom-center" />
    </div>
  );
}