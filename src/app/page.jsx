"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Users, BookOpen, Camera, Utensils, Award, Phone, MapPin, Mail, Star, Sparkles, ChevronUp, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

// استفاده از تابع ساده برای نمایش عکس‌ها
const makeImageUrl = (url) => {
  if (!url) return null;
  // اگر لینک کامل لیارا هست
  if (url.startsWith('http')) return url;
  // اگر مسیر محلی قدیمی هست
  if (url.startsWith('/')) return url;
  return `/${url}`;
};

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [gallery, setGallery] = useState([]);
  const [classes, setClasses] = useState([]);
  const [news, setNews] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [foodSchedule, setFoodSchedule] = useState([]);
  const [selectedScheduleDay, setSelectedScheduleDay] = useState('all');
  const [selectedMenuDay, setSelectedMenuDay] = useState('all');
  const [currentSchedulePage, setCurrentSchedulePage] = useState(0);
  const [currentMenuPage, setCurrentMenuPage] = useState(0);
  const newsScrollRef = useRef(null);
  const galleryRef = useRef(null);
  const router = useRouter();

  // تنظیمات صفحه‌بندی
  const ITEMS_PER_PAGE = 2; // تعداد روزها در هر صفحه

  // فرمت روزهای هفته فارسی
  const persianDays = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنجشنبه',
    'friday': 'جمعه'
  };

  // آرایه روزهای هفته برای فیلتر
  const weekDays = [
    { value: 'all', label: 'همه روزها' },
    { value: 'saturday', label: 'شنبه' },
    { value: 'sunday', label: 'یکشنبه' },
    { value: 'monday', label: 'دوشنبه' },
    { value: 'tuesday', label: 'سه‌شنبه' },
    { value: 'wednesday', label: 'چهارشنبه' },
    { value: 'thursday', label: 'پنجشنبه' },
    { value: 'friday', label: 'جمعه' }
  ];

  // تبدیل رنگ کلاس به کد رنگ
  const getClassColor = (classId) => {
    const colors = [
      'border-[#399918]', 
      'border-[#22c55e]', 
      'border-[#16a34a]', 
      'border-[#15803d]',
      'border-[#4ade80]'
    ];
    return colors[classId % colors.length];
  };

  const fallbackMenuItems = [
    { day: 'saturday',   persianDay: persianDays.saturday,   breakfast: '-', lunch: '-', color: getClassColor(0) },
    { day: 'sunday',     persianDay: persianDays.sunday,     breakfast: '-', lunch: '-', color: getClassColor(1) },
    { day: 'monday',     persianDay: persianDays.monday,     breakfast: '-', lunch: '-', color: getClassColor(2) },
    { day: 'tuesday',    persianDay: persianDays.tuesday,    breakfast: '-', lunch: '-', color: getClassColor(3) },
    { day: 'wednesday',  persianDay: persianDays.wednesday,  breakfast: '-', lunch: '-', color: getClassColor(4) },
  ];

  // فیلتر کردن برنامه درسی بر اساس روز انتخابی
  const getFilteredSchedule = () => {
    if (selectedScheduleDay === 'all') {
      return weeklySchedule;
    }
    return weeklySchedule.filter(day => day.day === selectedScheduleDay);
  };

  // فیلتر کردن برنامه غذایی بر اساس روز انتخابی
  const getFilteredMenu = () => {
    if (selectedMenuDay === 'all') {
      return foodSchedule.length > 0 ? foodSchedule : fallbackMenuItems;
    }
    const menuData = foodSchedule.length > 0 ? foodSchedule : fallbackMenuItems;
    return menuData.filter(day => day.day === selectedMenuDay);
  };

  // صفحه‌بندی برنامه درسی
  const getPaginatedSchedule = () => {
    const filtered = getFilteredSchedule();
    const startIndex = currentSchedulePage * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // صفحه‌بندی برنامه غذایی
  const getPaginatedMenu = () => {
    const filtered = getFilteredMenu();
    const startIndex = currentMenuPage * ITEMS_PER_PAGE;
    return filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // محاسبه تعداد صفحات برنامه درسی
  const getScheduleTotalPages = () => {
    const filtered = getFilteredSchedule();
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  };

  // محاسبه تعداد صفحات برنامه غذایی
  const getMenuTotalPages = () => {
    const filtered = getFilteredMenu();
    return Math.ceil(filtered.length / ITEMS_PER_PAGE);
  };

  // ریست کردن صفحه هنگام تغییر فیلتر
  useEffect(() => {
    setCurrentSchedulePage(0);
  }, [selectedScheduleDay, selectedClass]);

  useEffect(() => {
    setCurrentMenuPage(0);
  }, [selectedMenuDay]);

  // واکشی گالری
  useEffect(() => {
    async function fetchGallery() {
      try {
        const token = localStorage?.getItem?.('token');
        const res = await fetch('/api/gallery', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          const data = await res.json();
          setGallery(
            (data.images || data.gallery || []).map((item, idx) => ({
              id: item.id ?? idx + 1,
              rawPath: item.image_path || '',
              title: item.title || "بدون عنوان",
              category: item.category || item.gallery_categories?.name || "بدون دسته‌بندی",
              color: "bg-gradient-to-r from-[#399918] to-[#22c55e]"
            }))
          );
        } else setGallery([]);
      } catch {
        setGallery([]);
      }
    }
    fetchGallery();
  }, []);

  useEffect(() => {
    async function fetchClasses() {
      try {
        const res = await fetch('/api/classes');
        if (res.ok) {
          const data = await res.json();
          setClasses(data.classes || []);
          if (data.classes && data.classes.length > 0) {
            setSelectedClass(data.classes[0].id.toString());
          }
        } else {
          setClasses([]);
        }
      } catch (error) {
        setClasses([]);
      }
    }
    fetchClasses();
  }, []);

  useEffect(() => {
    async function fetchWeeklySchedule() {
      if (!selectedClass) return;
      
      try {
        const res = await fetch(`/api/schedule?class_id=${selectedClass}`);
        if (res.ok) {
          const data = await res.json();
          
          const groupedByDay = {};
          
          (data.schedules || []).forEach(item => {
            const day = item.day_of_week;
            if (!groupedByDay[day]) {
              groupedByDay[day] = [];
            }
            
            groupedByDay[day].push({
              ...item,
              subject: item.subject || 'نامشخص'
            });
          });
          
          const orderedDays = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
          
          const formattedSchedule = orderedDays
            .filter(day => groupedByDay[day] && groupedByDay[day].length > 0)
            .map(day => ({
              day,
              persianDay: persianDays[day] || day,
              activities: groupedByDay[day].map(item => item.subject),
              scheduleItems: groupedByDay[day],
              color: getClassColor(parseInt(selectedClass))
            }));
          
          setWeeklySchedule(formattedSchedule);
        } else {
          setWeeklySchedule([]);
        }
      } catch (error) {
        console.error("خطا در دریافت برنامه هفتگی:", error);
        setWeeklySchedule([]);
      }
    }
    
    fetchWeeklySchedule();
  }, [selectedClass]);

  // واکشی اخبار - تغییر اصلی
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const userData = localStorage.getItem('user');
        let url = '/api/news';
        if (userData) {
          const user = JSON.parse(userData);
          url += `?role=${user.role}&userId=${user.id}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        if (data.success) {
          setNews(
            (data.news || []).map(n => ({
              ...n,
              image_url: makeImageUrl(n.image_url) // تغییر اینجا
            }))
          );
        }
      } catch {}
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (!news.length) return;
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % news.length);
    }, 4000);
    return () => clearInterval(newsTimer);
  }, [news.length]);

  useEffect(() => {
    async function fetchFoodSchedule() {
      try {
        const res = await fetch('/api/food-schedule');
        if (res.ok) {
          const data = await res.json();
          if (!data.schedules || data.schedules.length === 0) {
            return;
          }

          const days = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday'];
          const grouped = {};
          days.forEach((day, idx) => {
            grouped[day] = {
              day,
              persianDay: persianDays[day],
              breakfast: '-',
              lunch: '-',
              color: getClassColor(idx)
            };
          });

          data.schedules.forEach(item => {
            if (grouped[item.weekday]) {
              grouped[item.weekday].breakfast = item.breakfast || '-';
              grouped[item.weekday].lunch = item.lunch || '-';
            }
          });

          setFoodSchedule(days.map(day => grouped[day]));
        } else {
        }
      } catch (error) {
      }
    }
    fetchFoodSchedule();
  }, []);

  
  useEffect(() => {
    const galleryEl = galleryRef.current;
    if (!galleryEl || gallery.length <= 2) return;
    let scrollAmount = 0;
    let scrollDirection = 1;

    const scrollGallery = () => {
      if (galleryEl) {
        scrollAmount += 1 * scrollDirection;
        galleryEl.scrollLeft = scrollAmount;
        if (scrollAmount >= galleryEl.scrollWidth - galleryEl.clientWidth) {
          scrollDirection = -1;
        }
        if (scrollAmount <= 0) {
          scrollDirection = 1;
        }
      }
    };

    const scrollInterval = setInterval(scrollGallery, 40);
    return () => clearInterval(scrollInterval);
  }, [gallery.length]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    const newsTimer = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % news.length);
    }, 4000);
    
    return () => clearInterval(newsTimer);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const heroSlides = [
    {
      image: "/api/placeholder/800/400",
      title: "مدرسه پیشرو در آموزش نوین",
      subtitle: "با روش‌های مدرن تعلیم و تربیت",
      gradient: "from-[#399918] via-[#4ade80] to-[#22c55e]"
    },
    {
      image: "/api/placeholder/800/400",
      title: "محیطی امن و دوستانه",
      subtitle: "برای رشد فکری و جسمی کودکان",
      gradient: "from-[#399918] via-[#16a34a] to-[#15803d]"
    },
    {
      image: "/api/placeholder/800/400",
      title: "کادر مجرب و متخصص",
      subtitle: "همراه با فعالیت‌های فوق برنامه",
      gradient: "from-[#15803d] via-[#399918] to-[#22c55e]"
    }
  ];

  const particles = [
    { top: '10%', left: '15%', size: '12px', color: 'rgba(57, 153, 24, 0.1)', delay: '0s' },
    { top: '20%', left: '80%', size: '8px', color: 'rgba(57, 153, 24, 0.15)', delay: '2s' },
    { top: '60%', left: '10%', size: '15px', color: 'rgba(57, 153, 24, 0.08)', delay: '4s' },
    { top: '80%', left: '85%', size: '10px', color: 'rgba(57, 153, 24, 0.12)', delay: '1s' },
    { top: '40%', left: '50%', size: '14px', color: 'rgba(57, 153, 24, 0.1)', delay: '3s' },
    { top: '70%', left: '30%', size: '11px', color: 'rgba(57, 153, 24, 0.15)', delay: '5s' },
    { top: '30%', left: '70%', size: '9px', color: 'rgba(57, 153, 24, 0.1)', delay: '2.5s' },
    { top: '15%', left: '40%', size: '13px', color: 'rgba(57, 153, 24, 0.12)', delay: '1.5s' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50">
      {/* Hero Section - بدون تغییر */}
      <section className={`relative h-[500px] md:h-[600px] overflow-hidden transition-all duration-1000`}>
        {heroSlides.map((slide, index) => (
          <div 
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 z-10' 
                : 'opacity-0 z-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-[10000ms] ${
              index === currentSlide ? 'scale-100' : 'scale-110'
            }`}>
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-300"></div>
                <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-700"></div>
                <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
              </div>
              
              <div className="absolute inset-0 bg-[#399918]/20"></div>
            </div>
            
            <div className="container mx-auto px-4 h-full flex items-center justify-center relative z-10">
              <div className="text-center text-white max-w-3xl">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/30 shadow-2xl animate-fade-in">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg animate-fade-in-up delay-100">
                  {slide.title}
                </h1>
                <p className="text-xl mb-8 text-white/90 leading-relaxed animate-fade-in-up delay-200">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}
        
        <div className="absolute bottom-8 left-0 right-0 z-20">
          <div className="container mx-auto px-4">
            <div className="flex justify-center space-x-3 space-x-reverse">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`transition-all duration-300 ${
                    index === currentSlide 
                      ? 'w-8 h-2 bg-white rounded-full' 
                      : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats - بدون تغییر */}
      <section className="py-16 bg-white relative overflow-hidden">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">آمار مدرسه</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#399918] to-[#22c55e] mx-auto rounded-full animate-scale-x"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-[#399918]/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#399918]/20 animate-fade-in-up delay-100">
              <div className="w-16 h-16 bg-gradient-to-br from-[#399918] to-[#22c55e] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">۵۱</h3>
              <p className="text-gray-600 font-medium">دانش‌آموز</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-[#399918]/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#399918]/20 animate-fade-in-up delay-200">
              <div className="w-16 h-16 bg-gradient-to-br from-[#16a34a] to-[#399918] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">۴</h3>
              <p className="text-gray-600 font-medium">کلاس درس</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-[#399918]/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#399918]/20 animate-fade-in-up delay-300">
              <div className="w-16 h-16 bg-gradient-to-br from-[#399918] to-[#15803d] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">۱۵</h3>
              <p className="text-gray-600 font-medium">معلم مجرب</p>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-[#399918]/10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-[#399918]/20 animate-fade-in-up delay-400">
              <div className="w-16 h-16 bg-gradient-to-br from-[#22c55e] to-[#399918] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">۲</h3>
              <p className="text-gray-600 font-medium">سال فعالیت</p>
            </div>
          </div>
        </div>
      </section>

      {/* News & Announcements - تغییر نحوه نمایش عکس */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-[#399918]/10 to-[#22c55e]/10 rounded-full -translate-x-32 -translate-y-32 opacity-50 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-br from-[#16a34a]/10 to-[#399918]/10 rounded-full translate-x-24 translate-y-24 opacity-50 animate-pulse-slow delay-2s"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4 animate-fade-in">
              <Sparkles className="w-8 h-8 text-[#399918] ml-2 animate-pulse" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                اخبار و اطلاعیه‌ها
              </h2>
              <Sparkles className="w-8 h-8 text-[#399918] mr-2 animate-pulse" />
            </div>
            <div className="w-24 h-1 bg-gradient-to-r from-[#399918] to-[#22c55e] mx-auto rounded-full animate-scale-x"></div>
          </div>

          <div className="overflow-x-auto pb-6">
            <div className="flex gap-8 min-w-max">
            {news.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-96 bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
                <div className="relative w-full h-56">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none';
                        // نمایش placeholder
                        const placeholder = e.currentTarget.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Placeholder */}
                  <div 
                    className={`image-placeholder w-full h-full bg-gradient-to-br from-[#399918] to-[#22c55e] flex items-center justify-center ${
                      item.image_url ? 'hidden' : 'flex'
                    }`}
                  >
                    <Camera className="w-12 h-12 text-white opacity-80" />
                  </div>
                  
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 ml-1" />
                        {new Date(item.created_at).toLocaleDateString("fa-IR")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {(item.content || '').length > 100
                      ? `${(item.content || '').substring(0, 100)}...`
                      : (item.content || '')}
                  </p>
                  <button className="group flex items-center text-[#399918] hover:text-[#16a34a] font-medium transition-colors">
                    ادامه مطلب
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
          
          {news.length > 3 && (
            <div className="text-center mt-8">
              <button
                onClick={() => router.push('/News')}
                className="bg-gradient-to-r from-[#399918] to-[#22c55e] text-white px-6 py-3 rounded-full hover:from-[#16a34a] hover:to-[#399918] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                مشاهده همه اخبار
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Gallery - تغییر نحوه نمایش عکس */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#399918]/5 via-transparent to-green-50 opacity-30"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">گالری تصاویر</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#399918] to-[#22c55e] mx-auto rounded-full animate-scale-x"></div>
            <p className="text-gray-600 mt-4 text-lg animate-fade-in">نگاهی به فضاهای زیبای مدرسه</p>
          </div>
          <div
            ref={galleryRef}
            className="flex overflow-x-auto pb-8 -mb-8 scrollbar-hide gap-6 pr-2"
          >
            {gallery.map((item) => {
              const imgUrl = makeImageUrl(item.rawPath); // تغییر اینجا
              return (
                <div
                  key={item.id}
                  className="flex-shrink-0 relative group overflow-hidden rounded-2xl shadow-lg w-80 h-96 transition-all duration-500 hover:shadow-2xl cursor-pointer bg-gray-100"
                  onClick={() => router.push(`/gallery/${item.id}`)}
                >
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => { 
                        e.currentTarget.style.display = 'none';
                        // نمایش placeholder
                        const placeholder = e.currentTarget.parentElement.querySelector('.image-placeholder');
                        if (placeholder) {
                          placeholder.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Placeholder */}
                  <div 
                    className={`image-placeholder w-full h-full bg-gradient-to-br from-[#399918] to-[#22c55e] flex items-center justify-center ${
                      imgUrl ? 'hidden' : 'flex'
                    }`}
                  >
                    <Camera className="w-12 h-12 text-white opacity-80" />
                  </div>
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70"></div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="text-center text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3 border border-white/30">
                        <Camera className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-sm text-gray-200">{item.category}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transition-transform duration-300 group-hover:-translate-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-lg drop-shadow">{item.title}</h4>
                        <p className="text-gray-200 text-sm">{item.category}</p>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#399918] to-[#22c55e]"></div>
                    </div>
                  </div>
                </div>
              );
            })}
            {gallery.length === 0 && (
              <div className="text-gray-500 flex items-center justify-center w-full py-12">
                تصویری یافت نشد
              </div>
            )}
          </div>
          <div className="text-center mt-12 animate-fade-in">
            <button
              className="bg-gradient-to-r from-[#399918] to-[#22c55e] text-white px-8 py-4 rounded-full hover:from-[#16a34a] hover:to-[#399918] transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              onClick={() => router.push('/gallery')}
            >
              مشاهده همه تصاویر
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Schedule & Menu با paging - بدون تغییر */}
      <section className="py-16 bg-gradient-to-br from-slate-100 to-green-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#399918]/10 to-[#22c55e]/10 rounded-full translate-x-36 -translate-y-36 opacity-40 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-br from-[#16a34a]/10 to-[#399918]/10 rounded-full -translate-x-28 translate-y-28 opacity-40 animate-pulse-slow delay-3s"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 animate-fade-in">برنامه‌های هفتگی</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#399918] to-[#22c55e] mx-auto rounded-full animate-scale-x"></div>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-10">
            {/* Weekly Schedule */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-fade-in-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#399918] to-[#22c55e] rounded-full flex items-center justify-center ml-4 shadow-lg">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">برنامه درسی</h3>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* فیلتر کلاس */}
                  {classes.length > 0 && (
                    <div className="flex items-center bg-green-50 rounded-xl p-2">
                      <Filter className="w-5 h-5 text-green-600 ml-2" />
                      <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="bg-transparent text-green-700 text-sm focus:outline-none border-none"
                      >
                        {classes.map(cls => (
                          <option key={cls.id} value={cls.id}>
                            {cls.class_name || cls.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* فیلتر روز */}
                  <div className="flex items-center bg-blue-50 rounded-xl p-2">
                    <Calendar className="w-5 h-5 text-blue-600 ml-2" />
                    <select 
                      value={selectedScheduleDay} 
                      onChange={(e) => setSelectedScheduleDay(e.target.value)}
                      className="bg-transparent text-blue-700 text-sm focus:outline-none border-none"
                    >
                      {weekDays.map(day => (
                        <option key={day.value} value={day.value}>
                          {day.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6 min-h-[300px]">
                {getPaginatedSchedule().length > 0 ? (
                  getPaginatedSchedule().map((day, index) => (
                    <div 
                      key={day.day} 
                      className={`border-r-4 ${day.color} pr-6 py-4 bg-gradient-to-l from-green-50 to-transparent rounded-r-xl hover:from-[#399918]/5 transition-colors duration-300 animate-fade-in-up delay-${index * 100}`}
                    >
                      <h4 className="font-bold text-gray-800 mb-3 text-lg">{day.persianDay}</h4>
                      <div className="flex flex-wrap gap-2">
                        {day.activities.map((activity, actIndex) => {
                          const colors = ['bg-[#399918]', 'bg-[#22c55e]', 'bg-[#16a34a]', 'bg-[#15803d]'];
                          return (
                            <span 
                              key={actIndex} 
                              className={`${colors[actIndex % colors.length]} text-white px-4 py-2 rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200`}
                            >
                              {activity}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                    <p>برنامه‌ای برای این فیلتر یافت نشد</p>
                  </div>
                )}
              </div>

              {/* Pagination برای برنامه درسی */}
              {getScheduleTotalPages() > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentSchedulePage(Math.max(0, currentSchedulePage - 1))}
                    disabled={currentSchedulePage === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-sm">قبلی</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: getScheduleTotalPages() }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSchedulePage(i)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentSchedulePage === i
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentSchedulePage(Math.min(getScheduleTotalPages() - 1, currentSchedulePage + 1))}
                    disabled={currentSchedulePage === getScheduleTotalPages() - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm">بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Weekly Menu */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 animate-fade-in-right">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#399918] to-[#16a34a] rounded-full flex items-center justify-center ml-4 shadow-lg">
                    <Utensils className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">برنامه غذایی</h3>
                </div>
                
                {/* فیلتر روز برای برنامه غذایی */}
                <div className="flex items-center bg-orange-50 rounded-xl p-2">
                  <Utensils className="w-5 h-5 text-orange-600 ml-2" />
                  <select 
                    value={selectedMenuDay} 
                    onChange={(e) => setSelectedMenuDay(e.target.value)}
                    className="bg-transparent text-orange-700 text-sm focus:outline-none border-none"
                  >
                    {weekDays.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-6 min-h-[300px]">
                {getPaginatedMenu().map((menu, index) => (
                  <div 
                    key={menu.day} 
                    className={`border-r-4 ${menu.color} pr-6 py-4 bg-gradient-to-l from-green-50 to-transparent rounded-r-xl hover:from-[#399918]/5 transition-colors duration-300 animate-fade-in-up delay-${index * 100}`}
                  >
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">{menu.persianDay}</h4>
                    <div className="text-sm text-gray-600 space-y-2">
                      <p className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-[#399918] rounded-full ml-2 animate-pulse"></span>
                        <span className="font-medium text-gray-700">صبحانه:</span> 
                        <span className="mr-2">{menu.breakfast}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="inline-block w-2 h-2 bg-[#22c55e] rounded-full ml-2 animate-pulse delay-100"></span>
                        <span className="font-medium text-gray-700">ناهار:</span> 
                        <span className="mr-2">{menu.lunch}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination برای برنامه غذایی */}
              {getMenuTotalPages() > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setCurrentMenuPage(Math.max(0, currentMenuPage - 1))}
                    disabled={currentMenuPage === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-sm">قبلی</span>
                  </button>
                  
                  <div className="flex items-center gap-2">
                    {Array.from({ length: getMenuTotalPages() }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentMenuPage(i)}
                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                          currentMenuPage === i
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-orange-100'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentMenuPage(Math.min(getMenuTotalPages() - 1, currentMenuPage + 1))}
                    disabled={currentMenuPage === getMenuTotalPages() - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="text-sm">بعدی</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {isMounted && (
        <button 
          onClick={scrollToTop}
          className={`fixed bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-[#399918] to-[#22c55e] rounded-full shadow-lg flex items-center justify-center text-white z-50 transition-all duration-300 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default HomePage;