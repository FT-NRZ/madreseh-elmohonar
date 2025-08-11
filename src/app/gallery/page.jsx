'use client'
import React, { useState, useEffect, useRef } from "react";
import { Download, ChevronLeft, ChevronRight, Calendar, Image, Trophy, BookOpen, Users, Heart, Camera, Loader2 } from "lucide-react";

const GalleryPage = () => {
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [backgroundImages, setBackgroundImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [bgSlideIndex, setBgSlideIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const slideInterval = useRef(null);

  // دریافت دسته‌بندی‌ها
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/gallery_categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
        
        const data = await response.json();
        
        if (data.success) {
          // افزودن دسته‌بندی "همه" به ابتدای لیست
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
          
          // انتخاب دسته‌بندی "همه" به صورت پیش‌فرض
          if (!selectedCategory) {
            setSelectedCategory("all");
          }
        } else {
          throw new Error(data.message || 'خطا در دریافت دسته‌بندی‌ها');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('خطا در بارگذاری دسته‌بندی‌ها');
      }
    };

    fetchCategories();
  }, []);

  // دریافت تصاویر
  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      try {
        let url = '/api/gallery';
        
        // اگر دسته‌بندی خاصی انتخاب شده باشد (به جز "همه")
        if (selectedCategory && selectedCategory !== "all") {
          url += `?categoryId=${selectedCategory}`;
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
                
        if (!response.ok) throw new Error('خطا در دریافت تصاویر');
        
        const data = await response.json();
        
        if (data.success) {
          setImages(data.images);
          setFilteredImages(data.images);
          setCurrentImage(0); // برگشت به اولین تصویر بعد از تغییر فیلتر
          
          // انتخاب 3 تصویر تصادفی برای پس‌زمینه اسلایدشو
          if (data.images.length > 0) {
            const shuffled = [...data.images].sort(() => 0.5 - Math.random());
            setBackgroundImages(shuffled.slice(0, 3).map(img => img.image_path));
          }
        } else {
          throw new Error(data.message || 'خطا در دریافت تصاویر');
        }
      } catch (err) {
        console.error('Error fetching images:', err);
        setError('خطا در بارگذاری تصاویر');
        setImages([]);
        setFilteredImages([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedCategory) {
      fetchImages();
    }
  }, [selectedCategory]);

  // تغییر خودکار اسلاید پس‌زمینه
  useEffect(() => {
    if (backgroundImages.length > 0) {
      slideInterval.current = setInterval(() => {
        setBgSlideIndex(prev => (prev + 1) % backgroundImages.length);
      }, 8000);
    }
    
    return () => {
      if (slideInterval.current) {
        clearInterval(slideInterval.current);
      }
    };
  }, [backgroundImages]);

  // تولید رنگ براساس شاخص
  const getColorByIndex = (index) => {
    const colors = [
      "bg-[#4B6043]", "bg-[#7FB685]", "bg-[#DAE2B6]", "bg-[#CCD5AE]", 
      "bg-[#E9EDC9]", "bg-[#4B6043]", "bg-[#7FB685]", "bg-[#DAE2B6]"
    ];
    
    const textColors = {
      "bg-[#4B6043]": "text-white",
      "bg-[#7FB685]": "text-white",
      "bg-[#DAE2B6]": "text-[#4B6043]",
      "bg-[#CCD5AE]": "text-[#4B6043]",
      "bg-[#E9EDC9]": "text-[#4B6043]"
    };
    
    const bgColor = colors[index % colors.length];
    return {
      bg: bgColor,
      text: textColors[bgColor]
    };
  };

  // یافتن آیکون مناسب برای دسته‌بندی
  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      "جشن‌ها": Calendar,
      "ورزشی": Trophy,
      "آموزشی": BookOpen,
      "اجتماعی": Users,
      "خیریه": Heart
    };
    
    // جستجو در نام دسته‌بندی برای یافتن کلمات کلیدی
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
    
    // ابتدا بررسی تطابق دقیق
    if (iconMap[categoryName]) {
      return iconMap[categoryName];
    }
    
    // سپس بررسی کلمات کلیدی
    for (const [keyword, icon] of Object.entries(keywords)) {
      if (categoryName.includes(keyword)) {
        return icon;
      }
    }
    
    // آیکون پیش‌فرض
    return Image;
  };

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
    // حذف '/' اول از مسیر تصویر برای ایجاد URL کامل
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

  return (
    <div className="min-h-screen bg-[#F8F9F3] relative overflow-hidden">
      {/* اسلاید شو پس‌زمینه از تصاویر گالری */}
      <div className="fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-0">
        {backgroundImages.map((bgImage, index) => (
          <div 
            key={index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1500 ease-in-out ${
              index === bgSlideIndex ? 'opacity-20' : 'opacity-0'
            }`}
            style={{ position: 'fixed' }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#F8F9F3]/70 to-[#F8F9F3]/90"></div>
            <img 
              src={bgImage} 
              alt="Background" 
              className="w-full h-full object-cover blur-md"
              style={{ minWidth: '100vw', minHeight: '100vh' }}
            />
            
            {/* خطوط دکوراتیو */}
            <div className="absolute top-0 right-0 w-1/2 h-48 overflow-hidden">
              <div className="absolute top-10 right-32 w-32 h-1 bg-[#4B6043] opacity-30 rotate-45 transform origin-right"></div>
              <div className="absolute top-20 right-40 w-48 h-1 bg-[#7FB685] opacity-30 rotate-45 transform origin-right"></div>
            </div>
            
            <div className="absolute bottom-0 right-0 w-1/2 h-48 overflow-hidden">
              <div className="absolute bottom-20 right-20 w-64 h-1 bg-[#CCD5AE] opacity-30 rotate-[-30deg] transform origin-right"></div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="relative z-10">
      {/* هدر */}
      <div className="bg-gradient-to-r from-[#314828] via-[#28b739] to-[#88bd7f] text-white py-12 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-right mb-6 md:mb-0">
              <h1 className="text-4xl font-bold mb-2">
                گالری تصاویر
              </h1>
              <p className="text-lg text-[#F8F9F3]/90">
                مجموعه لحظات به یادماندنی مدرسه
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm p-6 rounded-2xl">
              <Camera className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        {/* دسته‌بندی‌ها */}
        {error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-12">
              <h2 className="text-xl font-medium text-[#4B6043] mb-6 inline-block border-b-2 border-[#CCD5AE] pb-2">
                دسته‌بندی تصاویر
              </h2>
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  {categories.map((category) => {
                    const IconComponent = getCategoryIcon(category.name);
                    return (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.id)}
                        className={`px-4 py-3 rounded-full transition-all duration-300 flex items-center shadow-sm ${
                          selectedCategory === category.id
                            ? `${category.color.bg} ${category.color.text} shadow-md`
                            : "bg-white text-[#4B6043] hover:bg-[#F0F3E6]"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span className="text-sm font-medium mr-2">
                          {category.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Loader2 className="w-10 h-10 animate-spin text-[#4B6043] mx-auto mb-4" />
                  <p>در حال بارگذاری دسته‌بندی‌ها...</p>
                </div>
              )}
            </div>

            {/* تصویر اصلی */}
            {loading ? (
              <div className="text-center py-20">
                <Loader2 className="w-16 h-16 animate-spin text-[#7FB685] mx-auto mb-4" />
                <p className="text-[#4B6043]">در حال بارگذاری تصاویر...</p>
              </div>
            ) : (
              <>
                {filteredImages.length > 0 ? (
                  <div className="mb-16">
                    <div className="relative max-w-5xl mx-auto">
                      <div className="relative overflow-hidden rounded-2xl shadow-xl bg-white">
                        <div className="relative h-[500px] md:h-[600px]">
                          <img
                            src={filteredImages[currentImage]?.image_path}
                            alt={filteredImages[currentImage]?.alt_text || filteredImages[currentImage]?.title}
                            className="w-full h-full object-contain transition-all duration-500"
                          />
                          
                          {/* نوار مشخصات */}
                          <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-6 border-t border-gray-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h3 className="text-xl font-bold text-[#4B6043] mb-2">
                                  {filteredImages[currentImage]?.title || 'بدون عنوان'}
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  <span className="inline-block bg-[#DAE2B6] text-[#4B6043] px-3 py-1 rounded-full text-sm">
                                    {filteredImages[currentImage]?.gallery_categories?.name || ''}
                                  </span>
                                  {filteredImages[currentImage]?.classes?.class_name && (
                                    <span className="inline-block bg-[#E9EDC9] text-[#4B6043] px-3 py-1 rounded-full text-sm">
                                      {filteredImages[currentImage]?.classes?.class_name}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() => handleDownload(
                                  filteredImages[currentImage]?.image_path,
                                  filteredImages[currentImage]?.title
                                )}
                                className="flex items-center bg-[#4B6043] hover:bg-[#3D5035] px-5 py-2 rounded-full transition-all duration-300 text-white shadow-sm"
                              >
                                <Download className="w-4 h-4 ml-2" />
                                دانلود تصویر
                              </button>
                            </div>
                            {filteredImages[currentImage]?.description && (
                              <p className="text-gray-700 mt-4 text-sm leading-relaxed">
                                {filteredImages[currentImage]?.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* دکمه‌های ناوبری */}
                      {filteredImages.length > 1 && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full flex justify-between px-4 pointer-events-none">
                          <button
                            onClick={handlePrev}
                            className="bg-white hover:bg-[#F0F3E6] text-[#4B6043] p-3 rounded-full shadow-md transition-all duration-300 hover:scale-105 pointer-events-auto opacity-70 hover:opacity-100"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                          <button
                            onClick={handleNext}
                            className="bg-white hover:bg-[#F0F3E6] text-[#4B6043] p-3 rounded-full shadow-md transition-all duration-300 hover:scale-105 pointer-events-auto opacity-70 hover:opacity-100"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                      
                      {/* شماره تصویر */}
                      <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-[#4B6043]">
                        {currentImage + 1} / {filteredImages.length}
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* تصاویر کوچک */}
                {filteredImages.length > 0 ? (
                  <>
                    <h2 className="text-xl font-medium text-[#4B6043] mb-6 inline-block border-b-2 border-[#CCD5AE] pb-2">
                      همه تصاویر
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                      {filteredImages.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative group cursor-pointer"
                          onClick={() => setCurrentImage(index)}
                        >
                          <div className={`overflow-hidden rounded-xl transition-all duration-300 shadow-sm ${
                            currentImage === index
                              ? "ring-2 ring-[#4B6043] shadow-md"
                              : "hover:shadow-md"
                          }`}>
                            <div className="relative aspect-[4/3]">
                              <img
                                src={image.image_path}
                                alt={image.alt_text || image.title}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                              />
                              
                              {/* اورلی هاور */}
                              <div className="absolute inset-0 bg-[#4B6043]/50 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                                <div className="text-white text-sm font-medium">
                                  {index + 1}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* عنوان تصویر */}
                          <p className="text-sm text-gray-700 font-medium mt-2 text-center line-clamp-1">
                            {image.title || 'بدون عنوان'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-white/50 rounded-3xl shadow-sm border border-[#DAE2B6]">
                    <Camera className="w-20 h-20 text-[#CCD5AE] mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-[#4B6043] mb-2">
                      تصویری در این دسته‌بندی موجود نیست
                    </h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      لطفاً دسته‌بندی دیگری را انتخاب کنید یا بعداً مراجعه فرمایید
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
      
      {/* فوتر */}
      <div className="bg-[#4B6043]/10 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-[#4B6043]">
          <p className="text-sm">تمامی حقوق برای مدرسه محفوظ است &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;