"use client";

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Calendar, Clock, Search, Filter, Eye, 
  Sparkles, BookOpen, Users, Camera, ArrowRight,
  ChevronUp, Star, NewspaperIcon, Grid3X3, List,
  X
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // واکشی اخبار عمومی
  useEffect(() => {
    const fetchPublicNews = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          // فیلتر اخبار فقط عمومی و برای همه دانش‌آموزان
          const publicNews = data.news.filter(item => 
            item.target_type === 'public' || 
            item.target_type === 'students'
          );
          setNews(publicNews);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicNews();
  }, []);

  // فیلتر اخبار بر اساس جستجو
  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // تشخیص اسکرول
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

  // باز کردن مودال جزئیات خبر
  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
    setShowModal(true);
  };

  // بستن مودال
  const closeModal = () => {
    setShowModal(false);
    setSelectedNews(null);
  };

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
      <section className="relative py-20 bg-gradient-to-br from-[#399918] via-[#22c55e] to-[#16a34a] overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-20 h-20 bg-white/10 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute -bottom-5 -left-5 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center text-white max-w-3xl mx-auto">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-8 border border-white/30 shadow-2xl animate-fade-in">
              <NewspaperIcon className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight drop-shadow-lg animate-fade-in-up delay-100">
              خبرنامه مدرسه
            </h1>
            <p className="text-xl mb-8 text-white/90 leading-relaxed animate-fade-in-up delay-200">
              آخرین اخبار و اطلاعیه‌های عمومی مدرسه
            </p>
            
            {/* جستجو */}
            <div className="max-w-md mx-auto relative animate-fade-in-up delay-300">
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="جستجو در اخبار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 rounded-full bg-white/90 backdrop-blur-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 text-gray-800 placeholder-gray-500"
              />
            </div>

            {/* آمار */}
            <div className="mt-8 flex justify-center items-center gap-6 animate-fade-in-up delay-400">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
                <span className="text-xl font-bold">{filteredNews.length}</span>
                <span className="text-xl mr-2">خبر</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Content */}
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
          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white rounded-xl shadow-lg p-1 border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-[#399918] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-[#399918] text-white shadow-md' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-gray-600 font-medium">
                {filteredNews.length} خبر یافت شد
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 bg-white text-[#399918] px-6 py-3 rounded-xl hover:bg-[#399918] hover:text-white transition-all duration-300 shadow-lg font-medium border border-[#399918]/20"
            >
              <ArrowRight className="w-5 h-5" />
              بازگشت به خانه
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            // Empty State
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <NewspaperIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                {searchTerm ? 'خبری یافت نشد' : 'خبری موجود نیست'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'جستجوی خود را تغییر دهید' : 'هنوز خبری منتشر نشده است'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-[#399918] text-white px-6 py-3 rounded-xl hover:bg-[#16a34a] transition-colors"
                >
                  نمایش همه اخبار
                </button>
              )}
            </div>
          ) : (
            // News Grid/List
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6"
            }>
              {filteredNews.map((item, index) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 animate-fade-in-up ${
                    viewMode === 'list' ? 'flex flex-col md:flex-row' : ''
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => openNewsModal(item)}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden ${
                    viewMode === 'list' ? 'md:w-80 h-48 md:h-auto' : 'h-48'
                  }`}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#399918] to-[#22c55e] flex items-center justify-center">
                        <Camera className="w-12 h-12 text-white opacity-80" />
                      </div>
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Date Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
                        <div className="flex items-center text-gray-700 text-sm font-medium">
                          <Calendar className="w-4 h-4 ml-1" />
                          {new Date(item.created_at || item.publish_date).toLocaleDateString("fa-IR")}
                        </div>
                      </div>
                    </div>

                    {/* Target Type Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                        item.target_type === 'public' 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {item.target_type === 'public' ? 'عمومی' : 'دانش‌آموزان'}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-6 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 leading-tight line-clamp-2 flex-1">
                        {item.title}
                      </h3>
                      <Star className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0" />
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                      {item.content}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-4 h-4 ml-1" />
                        {item.publish_date ? 
                          new Date(item.publish_date).toLocaleDateString("fa-IR") :
                          new Date(item.created_at).toLocaleDateString("fa-IR")
                        }
                      </div>
                      
                      <button className="group flex items-center text-[#399918] hover:text-[#16a34a] font-medium transition-colors text-sm">
                        <Eye className="w-4 h-4 ml-1" />
                        مشاهده جزئیات
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News Detail Modal */}
      {showModal && selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#399918] to-[#22c55e] p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  <NewspaperIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">جزئیات کامل خبر</h3>
                  <p className="text-sm opacity-90">
                    {selectedNews.target_type === 'public' ? 'عمومی' : 'دانش‌آموزان'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X className="w-5 h-5 text-white rotate-180" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Image */}
              {selectedNews.image_url && (
                <div className="mb-6 rounded-xl overflow-hidden">
                  <img
                    src={selectedNews.image_url}
                    alt={selectedNews.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-800 leading-tight mb-4">
                {selectedNews.title}
              </h2>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 ml-1" />
                  تاریخ انتشار: {new Date(selectedNews.publish_date || selectedNews.created_at).toLocaleDateString("fa-IR")}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 ml-1" />
                  {selectedNews.target_type === 'public' ? 'همه افراد' : 'همه دانش‌آموزان'}
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {selectedNews.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    آخرین بروزرسانی: {new Date(selectedNews.updated_at || selectedNews.created_at).toLocaleDateString("fa-IR")}
                  </div>
                  <button
                    onClick={closeModal}
                    className="bg-[#399918] text-white px-6 py-2 rounded-xl hover:bg-[#16a34a] transition-colors"
                  >
                    بستن
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      {isMounted && (
        <button 
          onClick={scrollToTop}
          className={`fixed bottom-8 left-8 w-12 h-12 bg-gradient-to-r from-[#399918] to-[#22c55e] rounded-full shadow-lg flex items-center justify-center text-white z-40 transition-all duration-300 hover:shadow-xl hover:scale-110 ${
            isScrolled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default NewsPage;