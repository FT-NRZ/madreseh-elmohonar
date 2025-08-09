'use client'
import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User } from 'lucide-react';
import Link from 'next/link';

// کامپوننت onLoginClick را به عنوان prop دریافت می‌کند
export default function Header({ onLoginClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Effect for scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'خانه', href: '/', active: true },
    { name: 'خبرنامه', href: '#' },
    { name: 'پیش ثبت نام', href: '/pre-registration' },
    { name: 'گالری', href: '#' },
    { name: 'کارگاه', href: '#' },
    { name: 'آزمونک', href: '#' },
    { name: 'ارتباط با ما', href: '#' },
    { name: 'درباره ما', href: '#' }
  ];

  const headerClasses = `
    sticky top-0 z-50 transition-all duration-500 ease-in-out
    ${isScrolled ? 'bg-white/85 backdrop-blur-xl shadow-2xl' : 'bg-white/95'}
  `;

  return (
    <>
      <header className={headerClasses}>
        {/* هلال‌های تزئینی پس‌زمینه */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className={`absolute -top-1/2 -right-1/4 w-1/2 h-[150%] bg-gradient-to-bl from-[#399918]/15 to-transparent rounded-full blur-3xl transition-opacity duration-1000 ${isScrolled ? 'opacity-40' : 'opacity-100'}`}></div>
          <div className={`absolute -bottom-1/2 -left-1/4 w-1/2 h-[150%] bg-gradient-to-tr from-green-200/15 to-transparent rounded-full blur-3xl transition-opacity duration-1000 ${isScrolled ? 'opacity-20' : 'opacity-70'}`}></div>
        </div>

        <div className="w-full px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between h-24">
            
            {/* Layout برای دسکتاپ */}
            <div className="hidden lg:flex items-center justify-between w-full">
              {/* لوگوی متنی ساده و جذاب - سمت راست دسکتاپ */}
      
               <Link href="/" className="flex items-center group cursor-pointer">
                <div className="relative">
                  {/* لوگوی حرفه‌ای و ساده */}
                  <h1 className="text-2xl font-haftad text-[#399918] tracking-wide leading-none font-semibold">
                    <span className="transition-all duration-300 group-hover:text-green-700">
                      علم و هنر
                    </span>
                  </h1>
                  
                  {/* متن انگلیسی ساده */}
                  <p className="text-sm font-medium text-gray-400 tracking-[0.15em] mt-1 text-right group-hover:text-gray-600 transition-colors duration-300">
                    SCIENCE & ART
                  </p>
                </div>
              </Link>

              {/* منو - وسط دسکتاپ */}
              <nav className="flex items-center justify-center">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/60 backdrop-blur-md rounded-full px-4 py-3 border border-gray-200/80 shadow-xl hover:shadow-2xl transition-all duration-300">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative px-5 py-2.5 text-sm font-bold transition-all duration-300 rounded-full group overflow-hidden ${
                        item.active 
                          ? 'text-white bg-gradient-to-r from-[#399918] to-green-600 shadow-lg' 
                          : 'text-gray-700 hover:text-[#399918] hover:bg-white/80'
                      }`}
                    >
                      <span className="relative z-10">{item.name}</span>
                      {!item.active && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-r from-[#399918]/10 to-green-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-[#399918] group-hover:w-3/4 transition-all duration-300 rounded-full"></span>
                        </>
                      )}
                      {item.active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 rounded-full"></div>
                      )}
                    </Link>
                  ))}
                </div>
              </nav>

              {/* جستجو و ورود - سمت چپ دسکتاپ */}
              <div className="flex items-center space-x-4">
                
                {/* نوار جستجوی پیشرفته */}
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
                
                {/* دکمه ورود دسکتاپ */}
                <button 
                  onClick={onLoginClick}
                  className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#399918] to-green-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ring-2 ring-[#399918]/20 hover:ring-[#399918]/40"
                >
                  <User className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Layout برای موبایل */}
            <div className="lg:hidden flex items-center justify-between w-full">
              {/* دکمه منوی موبایل - سمت راست */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-3 rounded-2xl bg-white/80 backdrop-blur-md text-gray-600 border border-gray-200/80 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* لوگو در وسط موبایل */}
                 <Link href="/" className="flex items-center group cursor-pointer">
                <div className="relative">
                  <h1 className="text-3xl font-haftad text-[#399918] tracking-wide leading-none font-semibold">
                    <span className="transition-all duration-300 group-hover:text-green-700">
                      علم و هنر
                    </span>
                  </h1>
                  <p className="text-xs font-medium text-gray-400 tracking-[0.15em] mt-1 text-center group-hover:text-gray-600 transition-colors duration-300">
                    SCIENCE & ART
                  </p>
                </div>
              </Link>

              {/* دکمه ورود موبایل - سمت چپ */}
              <button 
                onClick={onLoginClick}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#399918] to-green-600 rounded-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 ring-2 ring-[#399918]/20 hover:ring-[#399918]/40"
              >
                <User className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* منوی بازشونده موبایل */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200/80 shadow-2xl">
            <div className="p-6">
              
              {/* جستجوی موبایل */}
              <div className="mb-6">
                <div className="flex items-center bg-gray-50/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-gray-200/80 shadow-md focus-within:border-[#399918]/50 focus-within:shadow-lg transition-all duration-300">
                  <Search className="w-5 h-5 text-gray-400 ml-3" />
                  <input
                    type="text"
                    placeholder="جستجو کنید..."
                    className="bg-transparent flex-1 outline-none text-gray-700 text-right font-medium placeholder:text-gray-400"
                    style={{ direction: 'rtl' }}
                  />
                </div>
              </div>

              <nav className="flex flex-col space-y-2 mb-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`group px-5 py-4 text-right font-bold rounded-xl transition-all duration-300 relative overflow-hidden ${
                      item.active 
                        ? 'bg-gradient-to-r from-[#399918] to-green-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-[#399918]/5 hover:text-[#399918]'
                    }`}
                  >
                    <span className="relative z-10">{item.name}</span>
                    {!item.active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#399918]/0 via-[#399918]/5 to-[#399918]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* خط ساده زیر هدر */}
        <div className="h-1 bg-gradient-to-r from-[#399918] via-green-500 to-[#399918]"></div>
      </header>
    </>
  );
}