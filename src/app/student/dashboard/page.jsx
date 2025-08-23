'use client'

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ExamsList from '../components/ExamsList';
import WeeklySchedule from '../components/WeeklySchedule';
import MealSchedule from '../components/MealSchedule';
import {
  Menu, X, User, Calendar, ClipboardList, BookOpen, FileText, Newspaper, School, Image, UtensilsCrossed,
  MessageSquare, Bell, LogOut, Home, Award, ChevronRight, TrendingUp, Clock, Star, Users
} from 'lucide-react';

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
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      const userObj = JSON.parse(userData);
      setUser(userObj);
      setStudentId(userObj.id); // فرض: id دانش‌آموز در user ذخیره شده
    } else {
      setUser({ id: 1 });
      setStudentId(1);
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <StudentProfile studentId={studentId} />;
      case 'schedule':
        return <WeeklySchedule studentId={studentId} />;
      case 'exams':
        return studentId ? <ExamsList studentId={studentId} /> : <div>شناسه دانش‌آموز یافت نشد.</div>;
      case 'meals':
        return studentId ? <MealSchedule studentId={studentId} /> : <div>شناسه دانش‌آموز یافت نشد.</div>;
      // سایر caseها را طبق نیاز اضافه کن
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      <div className="flex">
        {/* Sidebar */}
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
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* ... داشبورد اصلی ... */}
              {/* این بخش را تغییر ندادم */}
            </div>
          )}
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