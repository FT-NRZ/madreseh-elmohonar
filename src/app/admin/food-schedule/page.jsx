'use client';
import dynamic from 'next/dynamic';
import {
  Users, GraduationCap, Calendar as CalendarIcon, GalleryHorizontalEnd, CalendarCheck,
  Image, BarChart3, Settings, NewspaperIcon, LogOut, Target,
  LayoutGrid, FileText, Shield, Menu, X,
  BookOpen,
  UserPlus
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const FoodScheduleAdmin = dynamic(
  () => import('../components/FoodScheduleAdmin'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }
);

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: CalendarIcon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: Image, href: '/admin/gallery' },
  { label: 'مدیریت کارنامه ها', icon: BookOpen, href: '/admin/report_cards' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
];

export default function FoodSchedulePage() {
  const router = useRouter();
  const [userStats, setUserStats] = useState({ students: 0, teachers: 0 });
  const [currentPath, setCurrentPath] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex flex-col sm:flex-row relative">
      {/* موبایل: هدر و دکمه منو */}
      <div className="sm:hidden sticky top-0 z-40 bg-white/90 border-b border-green-100 shadow">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Target className="w-7 h-7 text-green-700" />
            <span className="font-bold text-green-700">پنل مدیریت</span>
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
        <div className="sm:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <aside className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            <div className="p-4 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">پنل مدیریت</h2>
                  <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
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
                const isActive = item.active;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      setSidebarOpen(false);
                      window.location.href = item.href;
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-green-200 to-green-100 text-green-900 shadow scale-[1.02]'
                        : 'text-green-700 hover:bg-green-50 hover:shadow'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-green-100' : 'bg-green-50'}`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </button>
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

      {/* Sidebar - Desktop */}
      <aside className="hidden sm:block sm:w-72 bg-white/95 backdrop-blur-xl shadow-2xl z-0 border-l border-green-100">
        <div className="p-6 bg-gradient-to-r from-green-200 via-green-100 to-green-50 text-green-800 border-b border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <Target className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-xl font-bold">پنل مدیریت</h2>
              <p className="text-green-700 text-sm">مدرسه علم و هنر</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-700">{userStats.students}</p>
              <p className="text-xs text-green-600">دانش‌آموز</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center border border-green-100">
              <p className="text-xl font-bold text-green-700">{userStats.teachers}</p>
              <p className="text-xs text-green-600">معلم</p>
            </div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarMenu.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentPath === item.href;
            return (
              <button
                key={item.label}
                onClick={() => (window.location.href = item.href)}
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
      <div className="flex-1">
        <FoodScheduleAdmin />
      </div>
    </div>
  );
}