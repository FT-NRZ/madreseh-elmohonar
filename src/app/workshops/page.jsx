'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowLeft, ChevronUp, Star } from 'lucide-react';

export default function WorkshopsPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const workshops = [
    {
      id: 1,
      name: 'ورزش',
      description: 'تقویت آمادگی جسمانی، چابکی و روحیه تیمی',
      icon: '🏃‍♂️',
      color: 'from-green-500 to-green-700'
    },
    {
      id: 2,
      name: 'کامپیوتر',
      description: 'آموزش برنامه‌نویسی و کار با رایانه',
      icon: '💻',
      color: 'from-green-600 to-green-500'
    },
    {
      id: 3,
      name: 'هنر',
      description: 'نقاشی، کاردستی و بیان خلاقیت',
      icon: '🎨',
      color: 'from-green-600 to-green-400'
    },
    {
      id: 4,
      name: 'آشپزی',
      description: 'یادگیری آشپزی و تغذیه سالم',
      icon: '👨‍🍳',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 5,
      name: 'تئاتر',
      description: 'آموزش بازیگری و اعتماد به نفس',
      icon: '🎭',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 6,
      name: 'خوشنویسی',
      description: 'یادگیری هنر خوشنویسی و تقویت دست‌خط',
      icon: '✍️',
      color: 'from-green-600 to-green-400'
    },
    {
      id: 7,
      name: 'شاهنامه‌خوانی',
      description: 'آموزش هنر زیبای شاهنامه‌خوانی',
      icon: '📜',
      color: 'from-green-700 to-green-500'
    }
  ];

  // ذرات پس‌زمینه
  const particles = [
    { top: '10%', left: '15%', size: '12px', color: 'rgba(57, 153, 24, 0.1)', delay: '0s' },
    { top: '20%', left: '80%', size: '8px', color: 'rgba(57, 153, 24, 0.15)', delay: '2s' },
    { top: '60%', left: '10%', size: '15px', color: 'rgba(57, 153, 24, 0.08)', delay: '4s' },
    { top: '80%', left: '85%', size: '10px', color: 'rgba(57, 153, 24, 0.12)', delay: '1s' },
    { top: '40%', left: '50%', size: '14px', color: 'rgba(57, 153, 24, 0.1)', delay: '3s' },
    { top: '70%', left: '30%', size: '11px', color: 'rgba(57, 153, 24, 0.15)', delay: '5s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Header Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-700 via-green-500 to-green-300 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30 shadow-2xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight drop-shadow-lg">
              کارگاه‌های آموزشی
            </h1>
            <p className="text-lg mb-6 text-white/90 leading-relaxed">
              با استعدادهای خود آشنا شوید و مهارت‌های جدید بیاموزید
            </p>
            
            {/* آمار */}
            <div className="flex justify-center items-center gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <span className="text-xl font-bold">{workshops.length}</span>
                <span className="text-lg mr-2">کارگاه</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Content */}
      <section className="py-16 relative overflow-hidden">
        {/* Background Particles */}
        {isMounted && (
          <div className="absolute inset-0">
            {particles.map((particle, i) => (
              <div 
                key={i}
                className="absolute rounded-full animate-pulse"
                style={{
                  top: particle.top,
                  left: particle.left,
                  width: particle.size,
                  height: particle.size,
                  background: particle.color,
                  animationDelay: particle.delay,
                  animationDuration: '4s'
                }}
              />
            ))}
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          {/* Workshops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workshops.map((workshop, index) => (
              <div
                key={workshop.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-green-100 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image/Icon Header */}
                <div className={`relative h-48 bg-gradient-to-br ${workshop.color} overflow-hidden`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full translate-x-12 -translate-y-12"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full -translate-x-8 translate-y-8"></div>
                  </div>
                  
                  {/* Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-6xl drop-shadow-lg">
                      {workshop.icon}
                    </div>
                  </div>

                  {/* Floating Star */}
                  <div className="absolute top-4 left-4">
                    <Star className="w-5 h-5 text-white/80" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">
                      کارگاه {workshop.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {workshop.description}
                  </p>

                  {/* دکمه زیبا */}
                  <Link
                    href={`/workshops/${workshop.id}`}
                    className="group relative flex items-center justify-center w-full bg-gradient-to-r from-green-600 via-green-500 to-green-400 text-white py-3.5 px-6 rounded-2xl hover:from-green-700 hover:via-green-600 hover:to-green-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden"
                  >
                    {/* پس‌زمینه متحرک */}
                    <div className="absolute inset-0 bg-gradient-to-r from-green-300 via-green-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    
                    {/* افکت نوری */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                    </div>
                    
                    {/* محتوای دکمه */}
                    <span className="relative z-10 text-sm">مشاهده جزئیات</span>
                    <ArrowLeft className="relative z-10 w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    
                    {/* درخشش */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 bg-white/30 rounded-full blur-sm group-hover:animate-ping"></div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {isMounted && (
        <button 
          onClick={scrollToTop}
          className={`fixed bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-all duration-300 hover:shadow-xl hover:scale-110 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}