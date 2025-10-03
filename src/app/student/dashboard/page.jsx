'use client'

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ExamsList from '../components/ExamsList';
import WeeklySchedule from '../components/WeeklySchedule';
import MealSchedule from '../components/MealSchedule';
import ExamResults from '../components/ExamResults';
import Workshops from '../components/Workshops';
import ReportCard from '../components/ReportCard';
import SpecialClasses from '../components/SpecialClasses';
import StudentSpecialNews from '../components/StudentSpecialNews';
import AttendanceList from '../components/AttendanceList'
import Reminders from '../components/Reminders';
import {
  Menu, X, User, Calendar, ClipboardList, BookOpen, FileText, Newspaper, School, Image, UtensilsCrossed,
  MessageSquare, Bell, LogOut, Home, Award, ChevronRight, TrendingUp, Clock, Star, Users
} from 'lucide-react';
import ClassNews from '../components/ClassNews';

const StudentProfile = ({ user, gradeName }) => (
  <div className="bg-white rounded-3xl shadow-2xl p-8 border border-green-100 flex items-center gap-6 student-profile">
    <div className="w-24 h-24 bg-gradient-to-br from-[#399918] to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
      {user?.firstName?.[0] || 'د'}
    </div>
    <div>
      <h2 className="text-2xl font-extrabold text-green-800 mb-1">
        {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'دانش‌آموز'}
      </h2>
      <p className="text-green-600 text-lg">{gradeName || 'پایه نامشخص'}</p>
    </div>
  </div>
);

const dashboardTabs = [
  { key: 'schedule', label: 'برنامه هفتگی', icon: Calendar },
  { key: 'attendance', label: 'حضور و غیاب', icon: ClipboardList },
  { key: 'reportCard', label: 'کارنامه', icon: BookOpen },
  { key: 'exams', label: 'آزمون‌ها', icon: FileText },
  { key: 'examResults', label: 'نتایج آزمون', icon: Award },
  { key: 'classnews', label: 'اخبار کلاس', icon: Newspaper },
  { key: 'reminders', label: 'یادآوری‌ها', icon: Bell },
  { key: 'gallery', label: 'گالری', icon: Image },
  { key: 'meals', label: 'برنامه غذایی', icon: UtensilsCrossed },
  { key: 'suggestion', label: 'ارسال نظر/پیشنهاد', icon: MessageSquare },
];

const quickActions = [
  { title: 'برنامه امروز', icon: Clock, tab: 'schedule' },
  { title: 'آزمون‌ها', icon: Star, tab: 'exams' },
  { title: 'گروه کلاسی', icon: Users, tab: 'classnews' },
  { title: 'برنامه غذایی', icon: UtensilsCrossed, tab: 'meals' },
];

export default function StudentDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [gradeId, setGradeId] = useState(null);
  const [gradeName, setGradeName] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
        fetchStudentInfo(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // گرفتن اطلاعات دانش‌آموز و gradeId
  const fetchStudentInfo = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }
      // اطلاعات حساس را در کنسول لاگ نکنید
      const response = await fetch(`/api/student/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.student) {
          if (data.student.class?.grade) {
            setGradeId(data.student.class.grade.id);
            setGradeName(data.student.class.grade.name);
          } else {
            setGradeId(null);
            setGradeName(null);
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch {
      // هیچ اطلاعاتی از دانش‌آموز در کنسول لاگ نشود
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return (
          <>
            <WeeklySchedule studentId={studentId} />
            <div className="mt-8">
              <SpecialClasses gradeId={gradeId || 1} />
            </div>
          </>
        );
      case 'attendance':
        return (
          <div className="space-y-6">
            <AttendanceList studentId={studentId} /> 
          </div>
        );
      case 'exams':
        return studentId ? <ExamsList studentId={studentId} /> : <div>در حال بارگذاری...</div>;
      case 'examResults':
        return studentId ? <ExamResults studentId={studentId} /> : <div>در حال بارگذاری...</div>;
      case 'reportCard':
        return studentId ? <ReportCard studentId={studentId} /> : <div>در حال بارگذاری...</div>;
      case 'classnews':
        return studentId ? (
          <ClassNews studentId={studentId} gradeId={gradeId} />
        ) : (
          <div>در حال بارگذاری...</div>
        );
      case 'reminders':
        return studentId ? (
          <Reminders studentId={studentId} gradeId={gradeId} />
        ) : (
          <div>در حال بارگذاری...</div>
        );
      case 'gallery':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-xl font-bold text-green-800 mb-4">گالری</h3>
            <p className="text-gray-600">محتوای گالری در حال توسعه است.</p>
          </div>
        );
      case 'meals':
        return studentId ? <MealSchedule studentId={studentId} /> : <div>در حال بارگذاری...</div>;
      case 'suggestion':
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-xl font-bold text-green-800 mb-4">ارسال نظر/پیشنهاد</h3>
            <p className="text-gray-600">فرم ارسال نظر و پیشنهاد در حال توسعه است.</p>
          </div>
        );
      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-xl font-bold text-green-800 mb-4">
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
        <aside className="right-0 top-0 w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
          <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <School className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="text-xl font-bold">پنل دانش‌آموز</h2>
                <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">18.5</p>
                <p className="text-xs text-green-600">معدل</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
                <p className="text-xl font-bold text-green-700">98%</p>
                <p className="text-xs text-green-600">حضور</p>
              </div>
            </div>
          </div>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow-xl scale-[1.02] transform'
                  : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'dashboard' ? 'bg-green-100' : 'bg-green-50'}`}>
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
        {/* Main Content */}
        <main className="flex-1 p-6 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <StudentProfile user={user} gradeName={gradeName}/>
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, idx) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={idx}
                      className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-green-100 flex flex-col items-center gap-2"
                      onClick={() => setActiveTab(action.tab)}
                    >
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-2">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-gray-800">{action.title}</span>
                    </button>
                  );
                })}
              </div>
              {/* برنامه امروز و کلاس ویژه */}
              <div className="bg-gradient-to-br from-green-100 via-white to-green-50 rounded-2xl shadow-lg p-4 border border-green-100 flex flex-col gap-4 items-center transition-all duration-300">
                <div className="w-full">
                  <h3 className="text-base font-bold text-green-700 mb-2">برنامه امروز</h3>
                  <WeeklySchedule studentId={studentId} todayOnly />
                </div>
              </div>
              <Workshops />
              {/* آزمون‌های فعال */}
              <div className="bg-gradient-to-br from-green-100 via-white to-green-50 rounded-2xl shadow-lg p-4 border border-green-100 transition-all duration-300">
                <h3 className="text-base font-bold text-green-700 mb-2">آزمون‌های فعال</h3>
                <ExamsList studentId={studentId} activeOnly />
              </div>
              {/* اخبار ویژه دانش‌آموز */}
              <div className="space-y-6">
                <StudentSpecialNews studentId={studentId} />
              </div>
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