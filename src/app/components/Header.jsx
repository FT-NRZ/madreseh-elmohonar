'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, Menu, X, User, LogOut, UserCircle, Settings, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef();
  const pathname = usePathname();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'خانه', href: '/', active: true },
    { name: 'خبرنامه', href: '/News' },
    { name: 'پیش ثبت نام', href: '/pre-registration' },
    { name: 'گالری', href: '/gallery' },
    { name: 'کارگاه', href: '/workshops' },
    { name: 'آزمونک', href: '#' },
    { name: 'ارتباط با ما', href: '/contact' },
    { name: 'درباره ما', href: '/about' }
  ];

  const headerClasses = `
    sticky top-0 z-50 transition-all duration-500 ease-in-out
    ${isScrolled ? 'bg-white/85 backdrop-blur-xl shadow-2xl' : 'bg-white/95'}
  `;

  const goToPanel = () => {
    if (!user) return;
    if (user.role === 'admin') window.location.href = '/admin/dashboard';
    else if (user.role === 'teacher') window.location.href = '/teacher/dashboard';
    else window.location.href = '/student/dashboard';
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/Login';
  };

  // منوی کاربر با پنل‌های مختلف برای هر نقش
  const userMenuItems = [
    {
      name: 'پروفایل من',
      icon: <UserCircle className="w-5 h-5 ml-2 text-green-600" />,
      href: '/profile'
    },
    // پنل مدیریت برای ادمین
    {
      name: 'پنل مدیریت',
      icon: <Settings className="w-5 h-5 ml-2 text-blue-600" />,
      action: () => window.location.href = '/admin/dashboard',
      show: user?.role === 'admin'
    },
    // پنل معلم برای معلمان
    {
      name: 'پنل معلم',
      icon: <Users className="w-5 h-5 ml-2 text-purple-600" />,
      action: () => window.location.href = '/teacher/dashboard',
      show: user?.role === 'teacher'
    },
    // پنل دانش‌آموز برای دانش‌آموزان
    {
      name: 'پنل دانش‌آموز',
      icon: <BookOpen className="w-5 h-5 ml-2 text-orange-600" />,
      action: () => window.location.href = '/student/dashboard',
      show: user?.role === 'student'
    },
    {
      name: 'خروج',
      icon: <LogOut className="w-5 h-5 ml-2 text-red-600" />,
      action: handleLogout
    }
  ];

  return (
    <>
      <header className={headerClasses}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className={`absolute -top-1/2 -right-1/4 w-1/2 h-[150%] bg-gradient-to-bl from-[#399918]/15 to-transparent rounded-full blur-3xl transition-opacity duration-1000 ${isScrolled ? 'opacity-40' : 'opacity-100'}`}></div>
          <div className={`absolute -bottom-1/2 -left-1/4 w-1/2 h-[150%] bg-gradient-to-tr from-green-200/15 to-transparent rounded-full blur-3xl transition-opacity duration-1000 ${isScrolled ? 'opacity-20' : 'opacity-70'}`}></div>
        </div>
        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-16 md:h-24">
            <div className="hidden lg:flex items-center justify-between w-full">
              <Link href="/" className="flex items-center group cursor-pointer">
                <div className="relative">
                  <h1 className="text-2xl font-haftad text-[#399918] tracking-wide leading-none font-semibold">
                    <span className="transition-all duration-300 group-hover:text-green-700">
                      علم و هنر
                    </span>
                  </h1>
                  <p className="text-sm font-medium text-gray-400 tracking-[0.15em] mt-1 text-right group-hover:text-gray-600 transition-colors duration-300">
                    SCIENCE & ART
                  </p>
                </div>
              </Link>
              <nav className="flex items-center justify-center">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-md rounded-full px-4 py-3 border border-gray-200/80 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {menuItems.map((item) => {
                    // بررسی فعال بودن - شامل /workshops و /workshops/[id]
                    const isActive = pathname === item.href || 
                      (item.href === '/workshops' && pathname.startsWith('/workshops'));
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-full group overflow-hidden ${
                          isActive
                            ? 'text-white bg-gradient-to-r from-[#399918] to-green-600 shadow-lg ring-2 ring-[#399918]'
                            : 'text-gray-700 hover:text-[#399918] hover:bg-white/80'
                        }`}
                      >
                        <span className="relative z-10">{item.name}</span>
                        {!isActive && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#399918]/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#399918] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                          </>
                        )}
                        {isActive && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`flex items-center transition-all duration-500 ease-out ${
                    isSearchOpen ? 'w-80' : 'w-12'
                  }`}>
                    <div className="relative flex items-center w-full">
                      <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`flex items-center justify-center h-12 bg-white/80 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-200/80 ${
                          isSearchOpen 
                            ? 'w-12 rounded-r-2xl border-l-0' 
                            : 'w-12 rounded-2xl hover:bg-[#399918]/5'
                        }`}
                      >
                        <Search className={`w-5 h-5 transition-all duration-300 ${
                          isSearchOpen ? 'text-[#399918]' : 'text-gray-600 group-hover:text-[#399918]'
                        }`} />
                      </button>
                      <div className={`flex items-center bg-white/90 backdrop-blur-md shadow-lg border border-gray-200/80 border-r-0 rounded-l-2xl transition-all duration-500 overflow-hidden ${
                        isSearchOpen ? 'w-full opacity-100' : 'w-0 opacity-0 border-opacity-0'
                      }`}>
                        <input
                          type="text"
                          placeholder="جستجو در علم و هنر..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-6 py-3 bg-transparent outline-none text-gray-700 text-right font-medium placeholder:text-gray-400 placeholder:font-normal"
                          style={{ direction: 'rtl' }}
                        />
                        <div className="flex items-center px-3">
                          {searchQuery && (
                            <button 
                              onClick={() => setSearchQuery('')}
                              className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                            >
                              <X className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                          <div className="w-px h-6 bg-gray-200 mx-2"></div>
                          <button 
                            onClick={() => setIsSearchOpen(false)}
                            className="p-1 rounded-full hover:bg-red-50 hover:text-red-500 transition-all duration-200 text-gray-400"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center justify-center px-5 h-12 bg-gradient-to-br from-green-600 to-[#399918] rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 ring-2 ring-[#399918]/20 hover:ring-[#399918]/40 font-bold text-white"
                    >
                      <UserCircle className="w-6 h-6 ml-2" />
                      {user.firstName} {user.lastName} | {user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}
                    </button>
                    {showUserMenu && (
                      <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center">
                            <UserCircle className="w-8 h-8 text-green-600 ml-2" />
                            <div>
                              <div className="font-bold text-gray-800">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-gray-500">{user.role === 'admin' ? 'مدیر' : user.role === 'teacher' ? 'معلم' : 'دانش‌آموز'}</div>
                            </div>
                          </div>
                        </div>
                        <nav>
                          {userMenuItems.map((item, idx) =>
                            item.show === false ? null : item.href ? (
                              <Link
                                key={item.name}
                                href={item.href}
                                className="flex items-center px-4 py-3 text-gray-700 hover:bg-green-50 transition-all duration-200 font-medium"
                                onClick={() => setShowUserMenu(false)}
                              >
                                {item.icon}
                                {item.name}
                              </Link>
                            ) : (
                              <button
                                key={item.name}
                                onClick={() => {
                                  setShowUserMenu(false);
                                  item.action();
                                }}
                                className={`flex items-center w-full px-4 py-3 text-gray-700 transition-all duration-200 font-medium ${
                                  item.name === 'خروج' ? 'hover:bg-red-50' : 
                                  item.name === 'پنل مدیریت' ? 'hover:bg-blue-50' :
                                  item.name === 'پنل معلم' ? 'hover:bg-purple-50' :
                                  item.name === 'پنل دانش‌آموز' ? 'hover:bg-orange-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                {item.icon}
                                {item.name}
                              </button>
                            )
                          )}
                        </nav>
                      </div>
                    )}
                  </div>
                ) : (
                  <button 
                    onClick={onLoginClick}
                    className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#399918] to-green-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ring-2 ring-[#399918]/20 hover:ring-[#399918]/40"
                  >
                    <User className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>
            {/* 🔥 موبایل هدر - کوچک‌تر شده */}
            <div className="lg:hidden flex items-center justify-between w-full">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-xl bg-white/80 backdrop-blur-md text-gray-600 border border-gray-200/80 shadow-md hover:shadow-lg transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link href="/" className="flex items-center group cursor-pointer">
                <div className="relative">
                  <h1 className="text-xl font-haftad text-[#399918] tracking-wide leading-none font-semibold">
                    <span className="transition-all duration-300 group-hover:text-green-700">
                      علم و هنر
                    </span>
                  </h1>
                  <p className="text-xs font-medium text-gray-400 tracking-[0.1em] mt-0.5 text-center group-hover:text-gray-600 transition-colors duration-300">
                    SCIENCE & ART
                  </p>
                </div>
              </Link>
              {user ? (
                <button
                  onClick={goToPanel}
                  className="flex items-center justify-center px-3 h-9 bg-gradient-to-br from-green-600 to-[#399918] rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ring-1 ring-[#399918]/20 hover:ring-[#399918]/40 font-bold text-white text-sm"
                >
                  {user.firstName} | پنل
                </button>
              ) : (
                <button 
                  onClick={onLoginClick}
                  className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#399918] to-green-600 rounded-xl shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 ring-1 ring-[#399918]/20 hover:ring-[#399918]/40"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        </div>
        {/* 🔥 موبایل منو - کوچک‌تر شده */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-xl">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-gray-200/80 shadow-sm focus-within:border-[#399918]/50 focus-within:shadow-md transition-all duration-300">
                  <Search className="w-4 h-4 text-gray-400 ml-2" />
                  <input
                    type="text"
                    placeholder="جستجو کنید..."
                    className="bg-transparent flex-1 outline-none text-gray-700 text-right font-medium placeholder:text-gray-400 text-sm"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>
              <nav className="flex flex-col space-y-1 mb-4">
                {menuItems.map((item) => {
                  // بررسی فعال بودن برای موبایل هم - شامل /workshops و /workshops/[id]
                  const isActive = pathname === item.href || 
                    (item.href === '/workshops' && pathname.startsWith('/workshops'));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`group px-4 py-3 text-right font-bold rounded-xl transition-all duration-300 relative overflow-hidden text-sm ${
                        isActive 
                          ? 'bg-gradient-to-r from-[#399918] to-green-600 text-white shadow-md' 
                          : 'text-gray-700 hover:bg-[#399918]/5 hover:text-[#399918]'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#399918]/0 via-[#399918]/5 to-[#399918]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
        <div className="h-1 bg-gradient-to-r from-[#399918] via-green-500 to-[#399918]"></div>
      </header>
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </>
  );
}