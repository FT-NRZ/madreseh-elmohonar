'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, User, GraduationCap, BookOpen, BarChart3, Settings, Eye, LogOut,
  Activity, Calendar, Clock, Crown, Target, RefreshCw, Sparkles,
  ClipboardList, FileText, Image, MessageSquare, Home, LayoutGrid, 
  GalleryHorizontalEnd, ArrowRight, Coffee, Bell, NewspaperIcon, Menu, X,
  Send, Edit, Trash2, Award, AlertTriangle, Shield
} from 'lucide-react';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, key: 'dashboard', href: '/teacher/dashboard' },
  { label: 'کلاس‌های من', icon: GraduationCap, key: 'classes', href: '/teacher/classes' },
  { label: 'برنامه هفتگی', icon: Calendar, key: 'schedule', href: '/teacher/schedule' },
  { label: 'دانش‌آموزان من', icon: Users, key: 'students', href: '/teacher/students' }, 
  { label: 'آزمون‌ها', icon: FileText, key: 'exams', href: '/teacher/exams' },
  { label: 'کارنامه‌ها', icon: BookOpen, key: 'reportCards', href: '/teacher/report-cards' },
  { label: 'اخبار معلمین', icon: NewspaperIcon, key: 'news', href: '/teacher/news' },
  { label: 'یادآوری/خبر دانش‌آموزان', icon: Send, key: 'reminders', href: '/teacher/reminders' },
  { label: 'بخشنامه‌های داخلی', icon: Shield, key: 'circulars', href: '/teacher/circulars' }, 
  { label: 'توبیخی و تشویقی من', icon: Shield, key: 'disciplinary', href: '/teacher/disciplinary' }, 
];

export default function TeacherLayout({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [teacherId, setTeacherId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [teacherStats, setTeacherStats] = useState({
    classes: 0,
    students: 0,
    exams: 0
  });

  useEffect(() => {
    // بررسی احراز هویت
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      window.location.href = '/';
      return;
    }

    try {
      const userObj = JSON.parse(userData);
      if (userObj.role !== 'teacher') {
        window.location.href = '/';
        return;
      }
      
      setTeacher(userObj);
      setTeacherId(userObj.id);
      setLoading(false);
      
      // دریافت آمار معلم
      const nationalCode = userObj?.nationalCode;
      if (nationalCode) {
        fetchTeacherStats(nationalCode);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/';
    }

    // تنظیم مسیر فعلی
    setCurrentPath(window.location.pathname);
  }, []);

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

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const isActive = (href) => {
    return currentPath === href;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری پنل معلم...</p>
        </div>
      </div>
    );
  }

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
                const active = isActive(item.href);
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow scale-[1.02]'
                        : 'text-green-700 hover:bg-green-50 hover:shadow'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${active ? 'bg-green-100' : 'bg-green-50'}`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </a>
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
              const active = isActive(item.href);
              return (
                <a
                  key={item.key}
                  href={item.href}
                  className={`group w-full text-right p-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-4 relative overflow-hidden ${
                    active
                      ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow-xl scale-[1.02] transform'
                      : 'text-green-700 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 hover:shadow-lg hover:scale-[1.01]'
                  }`}
                >
                  <div className={`p-2 rounded-xl ${active ? 'bg-green-100' : 'bg-green-50'}`}>
                    <IconComponent size={18} />
                  </div>
                  <span className="text-sm">{item.label}</span>
                </a>
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
            const active = isActive(item.href);
            return (
              <a
                key={item.key}
                href={item.href}
                className={`flex flex-col items-center justify-center px-1 py-1 text-[10px] font-bold transition-all ${active ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}
              >
                <IconComponent size={20} />
                <span className="mt-0.5">{item.label}</span>
              </a>
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
          <div className="space-y-4 md:space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}