'use client'
import React, { useState, useEffect } from 'react';
import {
  BookOpen, Calendar, Award, User, Users, BarChart3, Home, Menu, ChevronDown,
  LogOut, Bell, FileText, Star, CheckCircle, AlertCircle, Clock, Camera,
  MessageSquare, GraduationCap, ClipboardList, Image, Newspaper
} from 'lucide-react';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // احراز هویت و دریافت اطلاعات دانش‌آموز
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      window.location.href = '/';
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'student') {
        window.location.href = '/';
        return;
      }
      setStudent(parsedUser);
    } catch (error) {
      window.location.href = '/';
    }
  }, []);

  // دریافت اطلاعات داشبورد
  useEffect(() => {
    if (student) {
      fetchDashboardData();
    }
  }, [student]);

  // API: /api/student/dashboard
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/student/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      setDashboardData(await res.json());
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { id: 'overview', label: 'خانه', icon: Home },
    { id: 'grades', label: 'نمرات', icon: Award },
    { id: 'exams', label: 'برنامه‌ی امتحانات', icon: ClipboardList },
    { id: 'gallery', label: 'گالری', icon: Image },
    { id: 'news', label: 'اخبار', icon: Newspaper }
  ];

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-green-700 text-lg">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9F3] flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-white shadow-xl flex flex-col transition-all duration-300 border-l border-[#CCD5AE]`}>
        {/* Header */}
        <div className="p-6 border-b border-[#E9EDC9]">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-12 h-12 bg-gradient-to-r from-[#7FB685] to-[#4B6043] rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-7 h-7 text-white" />
              </div>
              {sidebarOpen && (
                <div className="mr-3">
                  <h2 className="font-bold text-[#4B6043] text-lg">پنل دانش‌آموز</h2>
                  <p className="text-sm text-[#7FB685]">مدرسه علم و هنر</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-[#F0F3E6] transition-colors"
            >
              <Menu className="w-5 h-5 text-[#4B6043]" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-6 flex-1 px-4">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-200 group ${
                  'text-[#4B6043] hover:bg-[#F0F3E6] hover:text-[#7FB685]'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${sidebarOpen ? 'ml-3' : 'mx-auto'}`} />
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-[#E9EDC9]">
          <div className={`flex items-center ${!sidebarOpen ? 'justify-center' : 'mb-4'}`}>
            <div className="w-12 h-12 bg-gradient-to-r from-[#DAE2B6] to-[#7FB685] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#4B6043] font-bold text-lg">
                {student?.firstName?.[0]}{student?.lastName?.[0]}
              </span>
            </div>
            {sidebarOpen && (
              <div className="mr-3 flex-1">
                <p className="font-semibold text-[#4B6043]">{student?.firstName} {student?.lastName}</p>
                <p className="text-sm text-[#7FB685]">دانش‌آموز</p>
              </div>
            )}
            {sidebarOpen && (
              <ChevronDown className="w-4 h-4 text-[#7FB685]" />
            )}
          </div>
          {sidebarOpen && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center py-3 px-4 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4 ml-2" />
              خروج از سیستم
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-[#E9EDC9] px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#4B6043]">
                داشبورد 
              </h1>
              <p className="text-[#7FB685] mt-1">
                {new Date().toLocaleDateString('fa-IR', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <button className="p-2 rounded-xl hover:bg-[#F0F3E6] transition-colors relative">
                <Bell className="w-6 h-6 text-[#7FB685]" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
              <div className="text-right">
                <p className="text-sm text-[#7FB685]">خوش آمدید</p>
                <p className="font-semibold text-[#4B6043]">{student?.firstName} {student?.lastName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-[#F8F9F3]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* اطلاعات کلی */}
            <DashboardCard
              title=" کلاس ها"
              value={dashboardData?.className || '-'}
              icon={Users}
              color="bg-[#7FB685]"
            />
            <DashboardCard
              title="غیبت"
              value={dashboardData?.absenceCount || '-'}
              icon={AlertCircle}
              color="bg-[#CCD5AE]"
            />
            <DashboardCard
              title="اخبار جدید"
              value={dashboardData?.newNews || '-'}
              icon={Newspaper}
              color="bg-[#51a854]"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// کامپوننت کارت داشبورد
function DashboardCard({ title, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-[#c9edca] hover:shadow-xl transition-all duration-300">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${color} mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <p className="text-3xl font-bold text-[#4B6043] mb-1">{value}</p>
      <p className="text-[#7FB685] font-medium">{title}</p>
    </div>
  );
}