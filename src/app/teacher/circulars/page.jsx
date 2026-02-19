'use client';
import React, { useState, useEffect } from 'react';
import {
  FileText, Calendar, Clock, AlertTriangle, CheckCircle, Eye, 
  RefreshCw, Search, Shield, Sparkles, X, Target, User, Users
} from 'lucide-react';
import moment from 'jalali-moment';

export default function Circulars({ teacherId }) {
  const [circulars, setCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showExpired, setShowExpired] = useState(false);
  const [selectedCircular, setSelectedCircular] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // دریافت بخشنامه‌ها
  const fetchCirculars = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/circulars?role=teacher&teacherId=${userData.id}&showExpired=${showExpired}`);
      const data = await response.json();
      if (data.success) {
        setCirculars(data.circulars || []);
      }
    } catch (error) {
      console.error('Error fetching circulars:', error);
      setCirculars([]);
    } finally {
      setLoading(false);
    }
  };

  // علامت‌گذاری به عنوان خوانده شده
  const markAsRead = async (circularId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/api/circulars/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          circular_id: circularId,
          teacher_id: userData.id
        }),
      });
      
      if (response.ok) {
        // به‌روزرسانی لیست بخشنامه‌ها
        setCirculars(prev => 
          prev.map(circular => 
            circular.id === circularId 
              ? { ...circular, is_read: true }
              : circular
          )
        );
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  useEffect(() => {
    fetchCirculars();
  }, [teacherId, showExpired]);

  // فیلتر بخشنامه‌ها
  const filteredCirculars = circulars.filter(circular => {
    const matchesSearch = circular.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circular.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = !filterPriority || circular.priority === filterPriority;
    const matchesType = !filterType || 
                       (filterType === 'personal' && circular.target_type === 'specific_teacher') ||
                       (filterType === 'general' && circular.target_type === 'all_teachers') ||
                       (filterType === 'unread' && !circular.is_read) ||
                       (filterType === 'important' && circular.priority === 'urgent');
    
    return matchesSearch && matchesPriority && matchesType;
  });

  // تعیین رنگ اولویت
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'normal': return 'bg-green-100 text-green-700 border-green-200';
      case 'low': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'urgent': return 'فوری';
      case 'high': return 'مهم';
      case 'normal': return 'عادی';
      case 'low': return 'کم‌اهمیت';
      default: return 'عادی';
    }
  };

  const openCircularModal = (circular) => {
    setSelectedCircular(circular);
    setShowModal(true);
    if (!circular.is_read) {
      markAsRead(circular.id);
    }
  };

  const closeCircularModal = () => {
    setSelectedCircular(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-4 mb-10 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                بخشنامه‌های داخلی
              </h2>
              <p className="text-white/90 text-sm md:text-base">مشاهده بخشنامه‌های اداری و آموزشی</p>
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-white/80">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
              <FileText className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{circulars.length}</p>
            <p className="text-xs md:text-sm text-gray-600">کل بخشنامه</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-red-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-red-700">{circulars.filter(c => !c.is_read).length}</p>
            <p className="text-xs md:text-sm text-gray-600">خوانده نشده</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-orange-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-orange-700">{circulars.filter(c => c.priority === 'urgent').length}</p>
            <p className="text-xs md:text-sm text-gray-600">فوری</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-blue-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-blue-700">{circulars.filter(c => c.target_type === 'specific_teacher').length}</p>
            <p className="text-xs md:text-sm text-gray-600">شخصی</p>
          </div>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Shield className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">فیلتر و جستجو</h3>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchCirculars}
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
            placeholder="جستجو در بخشنامه‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 border border-green-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 text-sm md:text-base"
          />
        </div>

        {/* فیلترها */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-green-50"
          >
            <option value="">همه اولویت‌ها</option>
            <option value="urgent">فوری</option>
            <option value="high">مهم</option>
            <option value="normal">عادی</option>
            <option value="low">کم‌اهمیت</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-green-50"
          >
            <option value="">همه انواع</option>
            <option value="personal">شخصی</option>
            <option value="general">عمومی</option>
            <option value="unread">خوانده نشده</option>
            <option value="important">فوری</option>
          </select>

          <label className="flex items-center gap-2 cursor-pointer px-3 py-2">
            <input
              type="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium">منقضی شده</span>
          </label>
        </div>
      </div>

      {/* لیست بخشنامه‌ها */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 md:py-12">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredCirculars.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100">
            <FileText className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">بخشنامه‌ای یافت نشد</h3>
            <p className="text-sm md:text-base text-gray-500">در حال حاضر بخشنامه‌ای وجود ندارد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredCirculars.map((circular) => (
              <div
                key={circular.id}
                className={`group bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border overflow-hidden hover:scale-[1.02] ${
                  !circular.is_read ? 'ring-2 ring-green-400 ring-opacity-50' : 'border-green-100'
                } ${circular.is_expired ? 'opacity-60' : ''}`}
              >
                {/* عکس یا پس‌زمینه */}
                <div className="relative h-32 md:h-48 overflow-hidden">
                  {circular.image_url ? (
                    <img
                      src={circular.image_url}
                      alt={circular.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 text-center text-white">
                        <FileText className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 opacity-80" />
                        <div className="text-xl md:text-3xl font-bold opacity-90">
                          {circular.circular_number || circular.title?.[0] || "ب"}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* برچسب‌ها */}
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1 md:gap-2">
                    {/* اولویت */}
                    <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-semibold border backdrop-blur-lg shadow-lg ${getPriorityColor(circular.priority)}`}>
                      {getPriorityText(circular.priority)}
                    </span>
                    
                    {/* نوع مخاطب */}
                    <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-blue-100 text-blue-700 border border-blue-200 backdrop-blur-lg shadow-lg flex items-center gap-1">
                      {circular.target_type === 'specific_teacher' ? (
                        <><User className="w-2 h-2 md:w-3 md:h-3" /><span className="hidden md:inline">شخصی</span></>
                      ) : (
                        <><Users className="w-2 h-2 md:w-3 md:h-3" /><span className="hidden md:inline">عمومی</span></>
                      )}
                    </span>

                    {/* وضعیت خواندن */}
                    {!circular.is_read && (
                      <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-700 border border-red-200 backdrop-blur-lg shadow-lg">
                        جدید
                      </span>
                    )}
                  </div>

                  {/* شماره بخشنامه */}
                  {circular.circular_number && (
                    <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-white/90 px-2 md:px-3 py-1 rounded-full text-xs font-bold text-green-900">
                      {circular.circular_number}
                    </div>
                  )}
                </div>

                {/* محتوا */}
                <div className="p-3 md:p-6">
                  <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-green-700 transition-colors leading-tight">
                    {circular.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {circular.content.substring(0, 100)}
                    {circular.content.length > 100 && '...'}
                  </p>

                  {/* تاریخ‌ها */}
                  <div className="space-y-1 mb-2 md:mb-4">
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>صدور: {moment(circular.issue_date).format('jYYYY/jMM/jDD')}</span>
                    </div>
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>انقضا: {moment(circular.expiry_date).format('jYYYY/jMM/jDD')}</span>
                    </div>
                  </div>

                  {/* بخش مربوطه */}
                  {circular.department && (
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-green-600 mb-2 md:mb-4">
                      <Target className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{circular.department}</span>
                    </div>
                  )}

                  {/* دکمه مشاهده کامل */}
                  <button 
                    onClick={() => openCircularModal(circular)}
                    className="w-full flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 rounded-lg md:rounded-xl transition-all duration-300 font-medium text-sm md:text-base group-hover:shadow-lg transform hover:scale-105"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    مشاهده کامل
                    {circular.is_read_required && (
                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-500" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال مشاهده کامل بخشنامه */}
      {showModal && selectedCircular && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
            {/* Header مودال */}
            <div className="sticky top-0 bg-gradient-to-r from-green-100 to-green-50 p-4 md:p-6 border-b border-green-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-green-800">جزئیات بخشنامه</h3>
                  {selectedCircular.circular_number && (
                    <p className="text-sm text-green-600">شماره: {selectedCircular.circular_number}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeCircularModal}
                className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* عکس بخشنامه */}
              {selectedCircular.image_url && (
                <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={selectedCircular.image_url}
                    alt={selectedCircular.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* عنوان */}
              <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                {selectedCircular.title}
              </h2>

              {/* اطلاعات بخشنامه */}
              <div className="flex flex-wrap gap-2 md:gap-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedCircular.priority)}`}>
                  {getPriorityText(selectedCircular.priority)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {moment(selectedCircular.issue_date).format('jYYYY/jMM/jDD')}
                </div>
                {selectedCircular.department && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <Target className="w-3 h-3" />
                    {selectedCircular.department}
                  </div>
                )}
                {selectedCircular.is_read_required && (
                  <div className="flex items-center gap-1 text-xs text-orange-600">
                    <CheckCircle className="w-3 h-3" />
                    خواندن اجباری
                  </div>
                )}
              </div>

              {/* متن کامل */}
              <div className="prose prose-sm md:prose max-w-none">
                <p className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedCircular.content}
                </p>
              </div>

              {/* تاریخ انقضا */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" /> {/* جایگزین شد */}
                  <span className="text-sm font-medium">
                    این بخشنامه تا {moment(selectedCircular.expiry_date).format('jYYYY/jMM/jDD')} معتبر است
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}