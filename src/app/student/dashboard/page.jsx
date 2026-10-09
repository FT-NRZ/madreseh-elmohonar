'use client'

import React, { useState, useEffect } from 'react';
import Workshops from '../components/Workshops';
import StudentSpecialNews from '../components/StudentSpecialNews';
import moment from 'jalali-moment';
import {
  Calendar, ClipboardList, BookOpen, FileText, Award, 
  Clock, Star, Users, UtensilsCrossed, Target, ArrowRight,
  Coffee, NewspaperIcon, Sparkles, Bell, Image
} from 'lucide-react';

const quickActions = [
  { title: 'برنامه امروز', icon: Clock, action: 'schedule' },
  { title: 'آزمون‌ها', icon: Star, action: 'exams' },
  { title: 'برنامه غذایی', icon: UtensilsCrossed, action: 'MealSchedule' },
];

export default function StudentDashboardPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [gradeId, setGradeId] = useState(null);
  const [gradeName, setGradeName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [studentStats, setStudentStats] = useState({
    weeklyAttendance: '100%',
    exams: '12'
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudent(userObj);
        setStudentId(userObj.id);
        setLoading(false);
        fetchStudentInfo(userObj.id);
        fetchStudentStats(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchStudentStats = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      // دریافت حضور و غیاب هفته گذشته
      const attendanceRes = await fetch(`/api/student/${userId}/attendance?filter=week`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let weeklyAttendance = '100%';
      
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        if (attendanceData.success && attendanceData.stats) {
          const { present, absent, late } = attendanceData.stats;
          const totalDays = present + absent + late;
          if (totalDays > 0) {
            const attendancePercent = Math.round((present / totalDays) * 100);
            weeklyAttendance = `${attendancePercent}%`;
          }
        }
      }
      
      // دریافت آمار آزمون‌ها
      const examsRes = await fetch(`/api/student/${userId}/exams`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let examsCount = '12';
      
      if (examsRes.ok) {
        const examsData = await examsRes.json();
        if (examsData.success && examsData.exams) {
          examsCount = examsData.exams.length.toString();
        }
      }
      
      setStudentStats({
        weeklyAttendance,
        exams: examsCount
      });
      
    } catch (error) {
      console.error('Error fetching student stats:', error);
      // استفاده از مقادیر پیش‌فرض
      setStudentStats({
        weeklyAttendance: '95%',
        exams: '8'
      });
    }
  };

  const fetchStudentInfo = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }
      
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
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error fetching student info:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    return 'عصر بخیر';
  };

  return (
    <div className="space-y-6 mb-5">
      
      {/* خوش‌آمدگویی */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 md:gap-3 mb-2">
            <Coffee className="w-6 h-6 md:w-8 md:h-8 text-white" />
            <div>
              <h1 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">
                {loading ? 'در حال بارگذاری...' : `${getGreeting()}، ${student?.firstName || 'دانش‌آموز عزیز'} ${student?.lastName || ''} 👋`}
              </h1>
              <p className="text-green-100 text-xs md:text-base">
                {gradeName ? `دانش‌آموز ${gradeName}` : 'به داشبورد دانش‌آموز خوش آمدید.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* آمار دانش‌آموز - حذف معدل کل و تغییر حضور به هفتگی */}
      <div className="grid grid-cols-1 gap-2 md:gap-6">
        <StatsCard
          title="حضور هفته"
          value={studentStats.weeklyAttendance}
          icon={ClipboardList}
          gradient="from-blue-50 to-white"
          iconGradient="from-blue-600 to-blue-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, idx) => {
          const IconComponent = action.icon;
          return (
            <button
              key={idx}
              className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border border-green-100 flex flex-col items-center gap-2"
              onClick={() => window.location.href = `/student/${action.action}`}
            >
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-2">
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-gray-800">{action.title}</span>
            </button>
          );
        })}
      </div>

      {/* دکمه‌های دسترسی سریع */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
          دسترسی سریع
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          <QuickAccessCard
            title="برنامه امروز"
            description="مشاهده برنامه کلاسی امروز"
            icon={Calendar}
            color="from-blue-500 to-blue-600"
            onClick={() => window.location.href = '/student/schedule'}
          />
          <QuickAccessCard
            title="آزمون‌های فعال"
            description="مشاهده آزمون‌های فعال و نتایج"
            icon={FileText}
            color="from-purple-500 to-purple-600"
            onClick={() => window.location.href = '/student/exams'}
          />
          <QuickAccessCard
            title="کارنامه"
            description="مشاهده نمرات و عملکرد تحصیلی"
            icon={BookOpen}
            color="from-green-500 to-green-600"
            onClick={() => window.location.href = '/student/Reportcards'}
          />
          <QuickAccessCard
            title="یادآوری‌ها"
            description="مشاهده یادآوری‌ها و اطلاعیه‌ها"
            icon={Bell}
            color="from-orange-500 to-orange-600"
            onClick={() => window.location.href = '/student/reminders'}
          />
        </div>
      </div>

      {/* اخبار و اطلاعیه‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2 md:gap-6">
        <RecentNews studentId={studentId} />
      </div>

      {/* ورک شاپ‌ها و برنامه‌های ویژه */}
      <div className="space-y-6">
        <Workshops />
      </div>

      {/* اخبار ویژه دانش‌آموز */}
      <div className="space-y-6">
        <StudentSpecialNews studentId={studentId} />
      </div>
    </div>
  );
}

// کامپوننت اخبار اخیر
function RecentNews({ studentId }) {
  const [recentNews, setRecentNews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (studentId) {
      fetchRecentNews();
    }
  }, [studentId]);

  const fetchRecentNews = async () => {
    try {
      const response = await fetch(`/api/news?role=student&userId=${studentId}`);
      const data = await response.json();
      
      if (data.success) {
        setRecentNews((data.news || []).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching recent news:', error);
    } finally {
      setLoading(false);
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
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <NewspaperIcon className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
        اخبار اخیر
      </h4>
      
      {recentNews.length === 0 ? (
        <p className="text-sm text-gray-500">خبری وجود ندارد</p>
      ) : (
        <div className="space-y-2 md:space-y-3">
          {recentNews.map((news, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
                  {news.title}
                </span>
                <p className="text-xs text-gray-500">
                  {moment(news.publish_date).format('jMM/jDD')}
                </p>
              </div>
            </div>
          ))}
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