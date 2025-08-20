'use client';

import { useState } from 'react';
import {
  User,
  BookOpen,
  Calendar,
  ClipboardList,
  FileText,
  Award,
  Image,
  MessageSquare,
  Users,
  ChevronRight,
  Bell,
  LogOut,
  Home,
} from 'lucide-react';

import ProfileCard from '../components/ProfileCard';
import MyClasses from '../components/MyClasses';
import WeeklySchedule from '../components/WeeklySchedule';
import AttendanceRegister from '../components/AttendanceRegister';
import ExamsList from '../components/ExamsList';
import ExamResults from '../components/ExamResults';
import ReportCards from '../components/ReportCards';
import Gallery from '../components/Gallery';
import SuggestionForm from '../components/SuggestionForm';

const teacherTabs = [
  { key: 'profile', label: 'پروفایل من', icon: User },
  { key: 'classes', label: 'کلاس‌های من', icon: Users },
  { key: 'schedule', label: 'برنامه هفتگی', icon: Calendar },
  { key: 'attendance', label: 'حضور و غیاب', icon: ClipboardList },
  { key: 'exams', label: 'آزمون‌ها', icon: FileText },
  { key: 'examResults', label: 'نتایج آزمون', icon: Award },
  { key: 'reportCards', label: 'کارنامه‌ها', icon: BookOpen },
  { key: 'gallery', label: 'گالری کلاس', icon: Image },
  { key: 'suggestion', label: 'ارسال پیام/پیشنهاد', icon: MessageSquare },
];

export default function TeacherDashboardPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileCard />;
      case 'classes':
        return <MyClasses />;
      case 'schedule':
        return <WeeklySchedule />;
      case 'attendance':
        return <AttendanceRegister />;
      case 'exams':
        return <ExamsList />;
      case 'examResults':
        return <ExamResults />;
      case 'reportCards':
        return <ReportCards />;
      case 'gallery':
        return <Gallery />;
      case 'suggestion':
        return <SuggestionForm />;
      default:
        return (
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {teacherTabs.find((tab) => tab.key === activeTab)?.label}
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
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">پنل معلم</h2>
                  <p className="text-green-100 text-sm">مدرسه علم و هنر</p>
                </div>
              </div>
              {/* Quick Stats in Sidebar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">5</p>
                  <p className="text-xs text-white/80">کلاس‌ها</p>
                </div>
                <div className="bg-white/20 backdrop-blur-lg rounded-xl p-3 text-center">
                  <p className="text-xl font-bold text-white">12</p>
                  <p className="text-xs text-white/80">دانش‌آموزان</p>
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
              <div
                className={`p-2 rounded-xl ${
                  activeTab === 'dashboard' ? 'bg-white/20' : 'bg-green-100'
                }`}
              >
                <Home size={18} />
              </div>
              <span className="text-sm">داشبورد اصلی</span>
            </button>

            {/* Other Menu Items */}
            {teacherTabs.map((item) => {
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
                  <div
                    className={`p-2 rounded-xl ${
                      isActive ? 'bg-white/20' : 'bg-green-100'
                    }`}
                  >
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
          <div className="space-y-6">{renderContent()}</div>
        </main>
      </div>
    </div>
  );
}