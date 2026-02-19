'use client';
import React, { useState, useEffect } from 'react';
import {
  NewspaperIcon, Calendar, RefreshCw, Eye, Bell, Target, User, Users,
  Search, Filter, Sparkles, Clock, X, Menu
} from 'lucide-react';
import moment from 'jalali-moment';

export default function News({ teacherId }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, teachers, personal
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      // دریافت اطلاعات کاربر از localStorage
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = userData.id;
      
      const response = await fetch(`/api/news?role=teacher&userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setNews(data.news || []);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [teacherId]);

  const formatPersianDate = (dateString) => {
    if (!dateString) return 'تعیین نشده';
    try {
      return moment(dateString).format('jYYYY/jMM/jDD');
    } catch {
      return 'تاریخ نامعتبر';
    }
  };

  const getNewsTypeInfo = (item) => {
    if (item.target_type === 'public') {
      return {
        label: 'عمومی',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Target
      };
    } else if (item.target_type === 'teachers') {
      return {
        label: 'همه معلمین',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: Users
      };
    } else if (item.target_type === 'specific_teacher') {
      return {
        label: 'شخصی',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: User
      };
    }
    return {
      label: 'نامشخص',
      color: 'bg-gray-100 text-gray-600 border-gray-200',
      icon: Target
    };
  };

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'public') return item.target_type === 'public' && matchesSearch;
    if (filter === 'teachers') return item.target_type === 'teachers' && matchesSearch;
    if (filter === 'personal') return item.target_type === 'specific_teacher' && matchesSearch;
    return matchesSearch;
  });

  const getFilterCount = (type) => {
    if (type === 'all') return news.length;
    if (type === 'public') return news.filter(n => n.target_type === 'public').length;
    if (type === 'teachers') return news.filter(n => n.target_type === 'teachers').length;
    if (type === 'personal') return news.filter(n => n.target_type === 'specific_teacher').length;
    return 0;
  };

  const openNewsModal = (newsItem) => {
    setSelectedNews(newsItem);
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
  };

  return (
    <div className="space-y-4 mb-10 md:space-y-6">
      {/* Header - ریسپانسیو */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                اخبار و اطلاعیه‌ها
              </h2>
              <p className="text-white/90 text-sm md:text-base">مشاهده اخبار عمومی، اخبار معلمین و اطلاعیه‌های شخصی</p>
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-white/80">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
              <NewspaperIcon className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع - ریسپانسیو */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{getFilterCount('all')}</p>
            <p className="text-xs md:text-sm text-gray-600">کل اخبار</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-blue-700">{getFilterCount('public')}</p>
            <p className="text-xs md:text-sm text-gray-600">عمومی</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-orange-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-orange-700">{getFilterCount('teachers')}</p>
            <p className="text-xs md:text-sm text-gray-600">معلمین</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{getFilterCount('personal')}</p>
            <p className="text-xs md:text-sm text-gray-600">شخصی</p>
          </div>
        </div>
      </div>

      {/* فیلترها و جستجو - ریسپانسیو */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">فیلتر و جستجو</h3>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm"
            >
              <Filter className="w-4 h-4" />
              فیلتر
            </button>
            <button
              onClick={fetchNews}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 transition text-sm md:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">بروزرسانی</span>
            </button>
          </div>
        </div>

        {/* جستجو */}
        <div className="mt-4 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="جستجو در اخبار..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 border border-green-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 text-sm md:text-base"
          />
        </div>

        {/* دکمه‌های فیلتر - ریسپانسیو */}
        <div className={`mt-4 ${showFilters || 'hidden md:block'}`}>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filter === 'all'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              همه ({getFilterCount('all')})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filter === 'public'
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              عمومی ({getFilterCount('public')})
            </button>
            <button
              onClick={() => setFilter('teachers')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filter === 'teachers'
                  ? 'bg-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              معلمین ({getFilterCount('teachers')})
            </button>
            <button
              onClick={() => setFilter('personal')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filter === 'personal'
                  ? 'bg-green-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              شخصی ({getFilterCount('personal')})
            </button>
          </div>
        </div>
      </div>

      {/* لیست اخبار - ریسپانسیو */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 md:py-12">
            <div className="relative">
              <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-8 h-8 md:w-12 md:h-12 border-4 border-green-300 border-t-transparent rounded-full animate-spin" style={{ animationDelay: '0.15s', animationDuration: '1s' }}></div>
            </div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100">
            <div className="relative">
              <NewspaperIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">خبری یافت نشد</h3>
            <p className="text-sm md:text-base text-gray-500">در حال حاضر خبری در این دسته‌بندی وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredNews.map((item) => {
              const typeInfo = getNewsTypeInfo(item);
              const IconComponent = typeInfo.icon;
              
              return (
                <div
                  key={item.id}
                  className="group bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 overflow-hidden hover:scale-[1.02] hover:-translate-y-1"
                >
                  {/* عکس یا پس‌زمینه */}
                  <div className="relative h-32 md:h-48 overflow-hidden">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/20"></div>
                        <div className="absolute top-0 right-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full -translate-y-8 md:-translate-y-12 translate-x-8 md:translate-x-12"></div>
                        <div className="relative z-10 text-center text-white">
                          <NewspaperIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 opacity-80" />
                          <div className="text-xl md:text-3xl font-bold opacity-90">
                            {item.title?.[0] || "خ"}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* برچسب‌ها */}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1 md:gap-2">
                      {/* وضعیت انتشار */}
                      <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-green-100/90 text-green-700 border border-green-200 backdrop-blur-lg shadow-lg">
                        منتشر شده
                      </span>
                      
                      {/* نوع خبر */}
                      <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-semibold border backdrop-blur-lg shadow-lg ${typeInfo.color}/90 flex items-center gap-1`}>
                        <IconComponent className="w-2 h-2 md:w-3 md:h-3" />
                        <span className="hidden md:inline">{typeInfo.label}</span>
                      </span>
                    </div>
                  </div>

                  {/* محتوا */}
                  <div className="p-3 md:p-6">
                    <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-green-700 transition-colors leading-tight">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                      {item.content.substring(0, 100)}
                      {item.content.length > 100 && '...'}
                    </p>

                    {/* تاریخ انتشار */}
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500 mb-2 md:mb-4">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="text-xs">تاریخ: {formatPersianDate(item.publish_date)}</span>
                    </div>

                    {/* دکمه مشاهده کامل */}
                    <button 
                      onClick={() => openNewsModal(item)}
                      className="w-full flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 rounded-lg md:rounded-xl transition-all duration-300 font-medium text-sm md:text-base group-hover:shadow-lg transform hover:scale-105"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      مشاهده کامل
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال مشاهده کامل خبر */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
            {/* Header مودال */}
            <div className="sticky top-0 bg-gradient-to-r from-green-100 to-green-50 p-4 md:p-6 border-b border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <NewspaperIcon className="w-6 h-6 text-green-600" />
                <h3 className="text-lg md:text-xl font-bold text-green-800">جزئیات خبر</h3>
              </div>
              <button
                onClick={closeNewsModal}
                className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* عکس خبر */}
              {selectedNews.image_url && (
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={selectedNews.image_url}
                    alt={selectedNews.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* عنوان */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                {selectedNews.title}
              </h2>

              {/* اطلاعات خبر */}
              <div className="flex flex-wrap gap-2 md:gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getNewsTypeInfo(selectedNews).color}`}>
                  {getNewsTypeInfo(selectedNews).label}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatPersianDate(selectedNews.publish_date)}
                </div>
              </div>

              {/* متن کامل */}
              <div className="prose prose-sm md:prose max-w-none">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedNews.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}