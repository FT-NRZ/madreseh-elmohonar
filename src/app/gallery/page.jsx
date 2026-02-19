'use client'
import React, { useState, useEffect, useRef } from "react";
import { Download, Lock, ChevronLeft, ChevronRight, Calendar, Image, Trophy, BookOpen, Users, Heart, Camera, Loader2, Maximize2, X } from "lucide-react";

const GalleryPage = () => {
  const [categories, setCategories] = useState([]);
  const [grades, setGrades] = useState([]);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [currentImage, setCurrentImage] = useState(0);
  const [bgSlideIndex, setBgSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const slideInterval = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // همه useEffect ها باید قبل از شرطی return باشند
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    setIsLoggedIn(!!token && !!user);
  }, []);

  // دریافت دسته‌بندی‌ها
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/gallery_categories', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
        const data = await response.json();
        if (data.success) {
          const allCategories = [
            { id: "all", name: "همه تصاویر", color: getColorByIndex(0) },
            ...data.categories.map((cat, index) => ({
              id: cat.id,
              name: cat.name,
              color: getColorByIndex(index + 1),
              description: cat.description
            }))
          ];
          setCategories(allCategories);
          if (!selectedCategory) setSelectedCategory("all");
        } else {
          throw new Error(data.message || 'خطا در دریافت دسته‌بندی‌ها');
        }
      } catch (err) {
        console.error('خطا در بارگذاری دسته‌بندی‌ها:', err);
        setError('خطا در بارگذاری دسته‌بندی‌ها. لطفاً ابتدا وارد شوید.');
      }
    };
    
    if (isLoggedIn) {
      fetchCategories();
    }
  }, [isLoggedIn]);

  // دریافت پایه‌های تحصیلی
  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/grades', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGrades(data.grades);
          }
        }
      } catch (err) {
        console.error('خطا در دریافت پایه‌ها:', err);
      }
    };
    
    if (isLoggedIn) {
      fetchGrades();
    }
  }, [isLoggedIn]);

  // دریافت تصاویر
  useEffect(() => {
    const fetchImages = async () => {
      if (!isLoggedIn) return;
      
      setLoading(true);
      try {
        let url = '/api/gallery';
        const params = [];
        if (selectedCategory && selectedCategory !== "all") {
          params.push(`categoryId=${selectedCategory}`);
        }
        if (selectedGrade) {
          params.push(`gradeId=${selectedGrade}`);
        }
        if (params.length > 0) {
          url += '?' + params.join('&');
        }

        const token = localStorage.getItem('token');
        const response = await fetch(url, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (!response.ok) throw new Error('خطا در دریافت تصاویر');
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
          setFilteredImages(data.images);
          setCurrentImage(0);
          if (data.images.length > 0) {
            const shuffled = [...data.images].sort(() => 0.5 - Math.random());
            setBackgroundImages(shuffled.slice(0, 5).map(img => img.image_path));
          }
        } else {
          throw new Error(data.message || 'خطا در دریافت تصاویر');
        }
      } catch (err) {
        console.error('خطا در بارگذاری تصاویر:', err);
        setError('خطا در بارگذاری تصاویر. لطفاً ابتدا وارد شوید.');
        setImages([]);
        setFilteredImages([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (selectedCategory !== null && isLoggedIn) {
      fetchImages();
    }
  }, [selectedCategory, selectedGrade, isLoggedIn]);

  // تغییر خودکار اسلاید پس‌زمینه
  useEffect(() => {
    if (backgroundImages.length > 0) {
      slideInterval.current = setInterval(() => {
        setBgSlideIndex(prev => (prev + 1) % backgroundImages.length);
      }, 6000);
    }
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [backgroundImages]);

  // رنگ و آیکون دسته‌بندی - تبدیل به useCallback یا قرار دادن خارج از کامپوننت
  const getColorByIndex = (index) => {
    const colors = [
      { bg: "bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600", text: "text-white", shadow: "shadow-emerald-200" },
      { bg: "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600", text: "text-white", shadow: "shadow-blue-200" },
      { bg: "bg-gradient-to-br from-pink-500 via-rose-500 to-red-500", text: "text-white", shadow: "shadow-pink-200" },
      { bg: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500", text: "text-white", shadow: "shadow-orange-200" },
      { bg: "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600", text: "text-white", shadow: "shadow-violet-200" },
      { bg: "bg-gradient-to-br from-cyan-500 via-teal-500 to-green-500", text: "text-white", shadow: "shadow-cyan-200" },
      { bg: "bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600", text: "text-white", shadow: "shadow-lime-200" },
      { bg: "bg-gradient-to-br from-slate-600 via-gray-600 to-zinc-700", text: "text-white", shadow: "shadow-gray-200" }
    ];
    return colors[index % colors.length];
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "جشن‌ها": Calendar,
      "ورزشی": Trophy,
      "آموزشی": BookOpen,
      "اجتماعی": Users,
      "خیریه": Heart
    };
    const keywords = {
      "جشن": Calendar,
      "مراسم": Calendar,
      "ورزش": Trophy,
      "آموزش": BookOpen,
      "درس": BookOpen,
      "کلاس": BookOpen,
      "اجتماع": Users,
      "گروه": Users,
      "خیریه": Heart
    };
    if (iconMap[categoryName]) return iconMap[categoryName];
    for (const [keyword, icon] of Object.entries(keywords)) {
      if (categoryName.includes(keyword)) return icon;
    }
    return Image;
  };

  // باقی توابع...
  function getLastImageByCategory(categoryId) {
    const imgs = images.filter(img => img.gallery_categories?.id === categoryId);
    return imgs.length > 0 ? imgs[0] : null;
  }

  function getCategoryImageCount(categoryId) {
    return images.filter(img => img.gallery_categories?.id === categoryId).length;
  }

  const handleNext = () => {
    if (filteredImages.length > 0) {
      setCurrentImage((prev) => (prev + 1) % filteredImages.length);
    }
  };

  const handlePrev = () => {
    if (filteredImages.length > 0) {
      setCurrentImage((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    }
  };

  const handleDownload = (src, title) => {
    const imagePath = src.startsWith('/') ? src.substring(1) : src;
    const fullUrl = `${window.location.origin}/${imagePath}`;
    const link = document.createElement("a");
    link.href = fullUrl;
    link.download = `${title || 'تصویر_گالری'}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleGradeChange = (gradeId) => {
    setSelectedGrade(gradeId);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // اکنون شرطی return قرار می‌گیرد
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 relative overflow-hidden">
        {/* پس‌زمینه تزئینی */}
        <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
          <FloatingParticles />
        </div>

        {/* موج و تزئینات بالا */}
        <div className="relative w-full">
          <div className="absolute top-8 left-8 w-32 h-32 bg-gradient-to-br from-emerald-400/30 via-green-300/20 to-teal-200/10 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute top-12 right-8 w-24 h-24 bg-gradient-to-bl from-green-500/25 via-emerald-300/15 to-green-100/10 rounded-full blur-xl animate-pulse delay-1000"></div>
          
          <div className="w-full overflow-hidden" style={{height: "md:72px"}}>
            <svg viewBox="0 0 1200 50" className="w-full h-full block">
              <path fill="#22c55e" fillOpacity="0.12" d="M0,0V25c47.79,10,103.59,15,158,13,70.36-2,136.33-16,206.8-18C438.64,18,512.34,29,583,35c69.27,6,138.3,8,209.4,4,36.15-2,69.85-6,104.45-10C989.49,8,1113-5,1200,22V0Z"/>
              <path fill="#22c55e" fillOpacity="0.20" d="M0,0V8C13,15,27.64,23,47.69,30,99.41,47,165,47,224.58,38c31.15-4,60.09-11,89.67-17,40.92-8,84.73-19,130.83-21,36.26-1,70.9,4,98.6,13,31.77,11,62.32,26,103.63,30,40.44,4,81.35-3,119.13-10s75.16-17,116.92-18c59.73-2,113.28,10,168.9,17,30.2,3,59,2,87.09-3,22.43-4,48-11,60.65-20V0Z"/>
              <path fill="#22c55e" fillOpacity="0.35" d="M0,0V3C149.93,25,314.09,30,475.83,18c43-3,84.23-8,127.61-11,59-3,112.48,5,165.56,14C827.93,32,886,39,951.2,37c86.53-2,172.46-18,248.8-34V0Z"/>
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col items-center mt-6 mb-4">
            <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-3 tracking-tight">گالری تصاویر</h1>
            <p className="text-base mt-2 md:text-lg font-medium text-green-700 bg-white/70 px-6 py-2 rounded-full shadow-sm inline-block">
              مجموعه‌ای از زیباترین لحظات و خاطرات مدرسه علم و هنر
            </p>
          </div>
        </div>

        {/* پیام لاگین */}
        <main className="max-w-4xl mx-auto px-4 py-12 relative z-10">
          <div className="text-center py-20">
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-3xl p-12 max-w-lg mx-auto shadow-2xl">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
                <Lock className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-amber-800 mb-4">دسترسی محدود</h2>
              <p className="text-lg text-amber-700 font-medium mb-8 leading-relaxed">
                برای مشاهده گالری تصاویر و دسته‌بندی‌ها، ابتدا وارد حساب کاربری خود شوید.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.href = '/Login'}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl text-lg"
                >
                  ورود به حساب کاربری
                </button>
                <p className="text-sm text-amber-600">
                  حساب کاربری ندارید؟ با مدیریت مدرسه تماس بگیرید.
                </p>
              </div>
            </div>
          </div>

          {/* کارت‌های نمایشی */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">تصاویر با کیفیت</h3>
              <p className="text-gray-600 text-sm">مجموعه‌ای از بهترین تصاویر فعالیت‌های مدرسه</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">دسته‌بندی هوشمند</h3>
              <p className="text-gray-600 text-sm">تصاویر بر اساس موضوع و پایه تحصیلی دسته‌بندی شده</p>
            </div>
            
            <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">دانلود آسان</h3>
              <p className="text-gray-600 text-sm">امکان دانلود تصاویر با یک کلیک ساده</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // باقی کد گالری...
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50 relative overflow-hidden">
      {/* پس‌زمینه اسلایدشو */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
        {backgroundImages.map((bgImage, index) => (
          <div
            key={index}
            className={`absolute inset-0 w-full h-full transition-all duration-2000 ease-in-out ${
              index === bgSlideIndex ? 'opacity-15 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-green-50/95 to-emerald-50/90 backdrop-blur-[1px]"></div>
            <img
              src={bgImage}
              alt="Background"
              className="w-full h-full object-cover blur-xl scale-110 saturate-50"
            />
          </div>
        ))}
        <FloatingParticles />
      </div>

      {/* موج و تزئینات بالا */}
      <div className="relative w-full">
        <div className="absolute top-8 left-8 w-32 h-32 bg-gradient-to-br from-emerald-400/30 via-green-300/20 to-teal-200/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute top-12 right-8 w-24 h-24 bg-gradient-to-bl from-green-500/25 via-emerald-300/15 to-green-100/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-16 left-1/4 w-16 h-16 bg-gradient-to-br from-teal-400/20 to-green-300/15 rounded-full blur-lg animate-bounce delay-500"></div>
        <div className="absolute top-20 right-1/3 w-20 h-20 bg-gradient-to-bl from-emerald-300/25 to-green-200/10 rounded-full blur-xl animate-pulse delay-2000"></div>
        
        <div className="w-full overflow-hidden" style={{height: "md:72px"}}>
          <svg viewBox="0 0 1200 50" className="w-full h-full block">
            <path fill="#22c55e" fillOpacity="0.12" d="M0,0V25c47.79,10,103.59,15,158,13,70.36-2,136.33-16,206.8-18C438.64,18,512.34,29,583,35c69.27,6,138.3,8,209.4,4,36.15-2,69.85-6,104.45-10C989.49,8,1113-5,1200,22V0Z"/>
            <path fill="#22c55e" fillOpacity="0.20" d="M0,0V8C13,15,27.64,23,47.69,30,99.41,47,165,47,224.58,38c31.15-4,60.09-11,89.67-17,40.92-8,84.73-19,130.83-21,36.26-1,70.9,4,98.6,13,31.77,11,62.32,26,103.63,30,40.44,4,81.35-3,119.13-10s75.16-17,116.92-18c59.73-2,113.28,10,168.9,17,30.2,3,59,2,87.09-3,22.43-4,48-11,60.65-20V0Z"/>
            <path fill="#22c55e" fillOpacity="0.35" d="M0,0V3C149.93,25,314.09,30,475.83,18c43-3,84.23-8,127.61-11,59-3,112.48,5,165.56,14C827.93,32,886,39,951.2,37c86.53-2,172.46-18,248.8-34V0Z"/>
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center mt-6 mb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-green-800 mb-3 tracking-tight">گالری تصاویر</h1>
          <p className="text-base mt-2 md:text-lg font-medium text-green-700 bg-white/70 px-6 py-2 rounded-full shadow-sm inline-block">
            مجموعه‌ای از زیباترین لحظات و خاطرات مدرسه علم و هنر
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        {error ? (
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        ) : (
          <>
            {/* دسته‌بندی‌ها */}
            <section className="mb-10">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-2">دسته‌بندی تصاویر</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
              </div>
              {categories.length > 0 ? (
                <div className="relative">
                  {/* دکمه اسکرول چپ */}
                  {categories.length > 6 && (
                    <button
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-green-100 border border-gray-200 rounded-full p-2 shadow transition"
                      onClick={() => {
                        document.getElementById('category-scroll').scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                    >
                      <ChevronLeft className="w-5 h-5 text-green-700" />
                    </button>
                  )}
                  {/* دکمه اسکرول راست */}
                  {categories.length > 6 && (
                    <button
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-green-100 border border-gray-200 rounded-full p-2 shadow transition"
                      onClick={() => {
                        document.getElementById('category-scroll').scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                    >
                      <ChevronRight className="w-5 h-5 text-green-700" />
                    </button>
                  )}
                  <div
                    id="category-scroll"
                    className={`flex gap-3 justify-start overflow-x-auto scrollbar-thin scrollbar-thumb-green-300 scrollbar-track-gray-100 py-2 px-1`}
                    style={{ scrollBehavior: "smooth" }}
                  >
                    {categories.map((category, index) => {
                      const IconComponent = getCategoryIcon(category.name);
                      const isSelected = selectedCategory === category.id;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryChange(category.id)}
                          className={`group relative min-w-[140px] px-5 py-3 rounded-xl transition-all duration-500 flex items-center gap-2 hover:scale-105 ${
                            isSelected
                              ? `${category.color.bg} ${category.color.text} shadow-xl ${category.color.shadow} scale-105`
                              : "bg-white hover:bg-gray-50 text-gray-700 shadow-md hover:shadow-xl border border-gray-200"
                          }`}
                        >
                          <div className={`p-2 rounded-lg transition-all duration-300 ${
                            isSelected ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
                          }`}>
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-semibold">{category.name}</span>
                          {isSelected && (
                            <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto mb-4" />
                  <span className="text-gray-600">در حال بارگذاری دسته‌بندی‌ها...</span>
                </div>
              )}
            </section>

            {/* فیلتر پایه تحصیلی */}
            <section className="mb-8 flex flex-wrap gap-4 justify-center">
              <select
                className="px-5 py-2 rounded-xl border border-gray-200 bg-white text-green-700 font-semibold"
                value={selectedGrade}
                onChange={e => handleGradeChange(e.target.value)}
              >
                <option value="">همه پایه‌ها</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.name || grade.grade_name}
                  </option>
                ))}
              </select>
            </section>

            {/* تصویر اصلی */}
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-12 h-12 animate-spin text-green-500 mx-auto mb-4" />
                <p className="text-gray-600">در حال بارگذاری تصاویر...</p>
              </div>
            ) : (
              <>
                {filteredImages.length > 0 ? (
                  <section className="mb-12">
                    <div className="relative max-w-5xl mx-auto">
                      <div className="flex justify-center mb-6">
                        <button
                          onClick={toggleFullscreen}
                          className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-full shadow-lg transition-all duration-300 border border-gray-200"
                        >
                          <Maximize2 className="w-4 h-4" />
                          <span className="text-sm font-medium">تمام صفحه</span>
                        </button>
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                          <div className="relative h-[400px] md:h-[500px]">
                            <img
                              src={filteredImages[currentImage]?.image_path}
                              alt={filteredImages[currentImage]?.alt_text || filteredImages[currentImage]?.title}
                              className="w-full h-full object-contain transition-all duration-500"
                            />
                            
                            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg p-6 border-t border-gray-100 rounded-b-3xl">
                              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                  <h3 className="text-lg font-bold text-green-900 mb-2">{filteredImages[currentImage]?.title || 'بدون عنوان'}</h3>
                                  <div className="flex flex-wrap gap-2">
                                    <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs">
                                      {filteredImages[currentImage]?.gallery_categories?.name || ''}
                                    </span>
                                    {filteredImages[currentImage]?.grade_id && (
                                      <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                                        {grades.find(g => g.id === filteredImages[currentImage]?.grade_id)?.name || 
                                         grades.find(g => g.id === filteredImages[currentImage]?.grade_id)?.grade_name || ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownload(
                                    filteredImages[currentImage]?.image_path,
                                    filteredImages[currentImage]?.title
                                  )}
                                  className="flex items-center bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-5 py-2 rounded-full transition-all duration-300 text-white shadow-lg font-semibold"
                                >
                                  <Download className="w-4 h-4 ml-2" />
                                  دانلود تصویر
                                </button>
                              </div>
                              {filteredImages[currentImage]?.description && (
                                <p className="text-gray-700 mt-4 text-xs leading-relaxed">{filteredImages[currentImage]?.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {filteredImages.length > 1 && (
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-between px-4 pointer-events-none">
                            <button
                              onClick={handlePrev}
                              className="bg-white hover:bg-gray-50 text-green-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto opacity-80 hover:opacity-100"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                            <button
                              onClick={handleNext}
                              className="bg-white hover:bg-gray-50 text-green-700 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 pointer-events-auto opacity-80 hover:opacity-100"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                        
                        <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-lg px-4 py-2 rounded-full text-xs text-green-900 shadow-md">
                          {currentImage + 1} / {filteredImages.length}
                        </div>
                      </div>

                      {filteredImages.length > 1 && (
                        <div className="flex justify-center gap-2 mt-6">
                          {filteredImages.slice(0, Math.min(10, filteredImages.length)).map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImage(index)}
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                currentImage === index
                                  ? 'bg-green-500 scale-125'
                                  : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                              }`}
                            />
                          ))}
                          {filteredImages.length > 10 && (
                            <span className="text-gray-400 text-xs self-center">...</span>
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                ) : null}

                {/* تصاویر کوچک */}
                {filteredImages.length > 0 ? (
                  <>
                    <h2 className="text-lg font-bold text-green-900 mb-6 inline-block border-b border-green-200 pb-1">همه تصاویر</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {filteredImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => setCurrentImage(index)}
                        >
                          <div className={`overflow-hidden rounded-2xl transition-all duration-300 shadow-lg border border-gray-100 ${
                            currentImage === index
                              ? "ring-2 ring-green-600 shadow-xl"
                              : "hover:shadow-xl"
                          }`}>
                            <div className="relative aspect-[4/3]">
                              <img
                                src={image.image_path}
                                alt={image.alt_text || image.title}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-r from-green-600/60 to-emerald-400/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-green-900 font-semibold mt-2 text-center line-clamp-1">{image.title || 'بدون عنوان'}</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white/70 rounded-3xl shadow-lg border border-gray-100">
                    <Camera className="w-20 h-20 text-green-200 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-green-900 mb-2">تصویری در این دسته‌بندی موجود نیست</h3>
                    <p className="text-gray-500 max-w-md mx-auto">لطفاً دسته‌بندی دیگری را انتخاب کنید یا بعداً مراجعه فرمایید</p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* مودال تمام صفحه */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={filteredImages[currentImage]?.image_path}
            alt={filteredImages[currentImage]?.title}
            className="max-w-full max-h-full object-contain"
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-center">
            <p className="text-lg font-semibold mb-2">{filteredImages[currentImage]?.title}</p>
            <p className="text-sm opacity-75">{currentImage + 1} از {filteredImages.length}</p>
          </div>
        </div>
      )}
    </div>
  );
};

function FloatingParticles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const arr = [...Array(18)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${15 + Math.random() * 10}s`
    }));
    setParticles(arr);
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle, i) => (
        <div
          key={i}
          className="absolute animate-float opacity-10"
          style={{
            left: particle.left,
            top: particle.top,
            animationDelay: particle.animationDelay,
            animationDuration: particle.animationDuration
          }}
        >
          <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
        </div>
      ))}
    </div>
  );
}

export default GalleryPage;