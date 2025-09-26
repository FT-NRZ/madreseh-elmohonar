'use client';
import React, { useState, useEffect } from 'react';
import {
  Award, AlertTriangle, Star, Shield, Calendar, Clock, 
  RefreshCw, Search, Filter, Eye, X, TrendingUp, TrendingDown,
  Sparkles, Target, User
} from 'lucide-react';
import moment from 'jalali-moment';

export default function Disciplinary({ teacherId }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedAction, setSelectedAction] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // دریافت توبیخی و تشویقی های معلم
  const fetchActions = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/disciplinary?teacherId=${userData.id}`);
      const data = await response.json();
      if (data.success) {
        setActions(data.actions || []);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchActions();
    }
  }, [teacherId]);

  // فیلتر اعمال
  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         action.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return action.type === filterType && matchesSearch;
  });

  // گرفتن اطلاعات نوع عمل
  const getTypeInfo = (action) => {
    if (action.type === 'reward') {
      const levelColors = {
        normal: 'bg-green-100 text-green-700 border-green-200',
        high: 'bg-blue-100 text-blue-700 border-blue-200',
        excellent: 'bg-purple-100 text-purple-700 border-purple-200'
      };
      return {
        color: levelColors[action.level] || levelColors.normal,
        icon: action.level === 'excellent' ? Star : Award,
        text: action.level === 'excellent' ? 'تشویق ویژه' : action.level === 'high' ? 'تشویق بالا' : 'تشویق',
        bgGradient: 'from-green-500 via-green-600 to-green-700'
      };
    } else {
      const severityColors = {
        mild: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        normal: 'bg-orange-100 text-orange-700 border-orange-200',
        severe: 'bg-red-100 text-red-700 border-red-200'
      };
      return {
        color: severityColors[action.severity] || severityColors.normal,
        icon: AlertTriangle,
        text: action.severity === 'severe' ? 'توبیخ شدید' : action.severity === 'mild' ? 'هشدار' : 'توبیخ',
        bgGradient: action.severity === 'severe' ? 'from-red-500 via-red-600 to-red-700' : 
                   action.severity === 'mild' ? 'from-yellow-500 via-yellow-600 to-orange-500' :
                   'from-orange-500 via-orange-600 to-red-500'
      };
    }
  };

  // آمار
  const stats = {
    total: actions.length,
    rewards: actions.filter(a => a.type === 'reward').length,
    warnings: actions.filter(a => a.type === 'warning').length,
    thisMonth: actions.filter(a => moment(a.date).isSame(moment(), 'month')).length
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
                توبیخی و تشویقی من
              </h2>
              <p className="text-white/90 text-sm md:text-base">مشاهده سوابق توبیخی و تشویقی شما</p>
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-white/80">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
              <Shield className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{stats.total}</p>
            <p className="text-xs md:text-sm text-gray-600">کل موارد</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-200 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <p className="text-lg md:text-2xl font-bold text-green-700">{stats.rewards}</p>
            </div>
            <p className="text-xs md:text-sm text-gray-600">تشویقی</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-orange-200 shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="w-4 h-4 text-orange-600" />
              <p className="text-lg md:text-2xl font-bold text-orange-700">{stats.warnings}</p>
            </div>
            <p className="text-xs md:text-sm text-gray-600">توبیخی</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-blue-200 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-blue-700">{stats.thisMonth}</p>
            <p className="text-xs md:text-sm text-gray-600">این ماه</p>
          </div>
        </div>
      </div>

      {/* فیلترها و جستجو */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Target className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">فیلتر و جستجو</h3>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          </div>
          
          <button
            onClick={fetchActions}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 transition text-sm md:text-base"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden md:inline">بروزرسانی</span>
          </button>
        </div>

        {/* جستجو */}
        <div className="mt-4 relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="جستجو در سوابق..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 border border-green-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 text-sm md:text-base"
          />
        </div>

        {/* فیلترها */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
              filterType === 'all'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            همه
          </button>
          <button
            onClick={() => setFilterType('reward')}
            className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
              filterType === 'reward'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            تشویقی
          </button>
          <button
            onClick={() => setFilterType('warning')}
            className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
              filterType === 'warning'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            توبیخی
          </button>
        </div>
      </div>

      {/* لیست اعمال */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 md:py-12">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100">
            <Shield className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">سابقه‌ای یافت نشد</h3>
            <p className="text-sm md:text-base text-gray-500">هیچ توبیخی یا تشویقی برای شما ثبت نشده است</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredActions.map((action) => {
              const typeInfo = getTypeInfo(action);
              const IconComponent = typeInfo.icon;

              return (
                <div
                  key={action.id}
                  className="group bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 overflow-hidden hover:scale-[1.02]"
                >
                  {/* عکس یا پس‌زمینه */}
                  <div className={`relative h-32 md:h-48 overflow-hidden bg-gradient-to-br ${typeInfo.bgGradient}`}>
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <IconComponent className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 opacity-80" />
                        <div className="text-xl md:text-3xl font-bold opacity-90">
                          {action.type === 'reward' ? '🏆' : '⚠️'}
                        </div>
                      </div>
                    </div>
                    
                    {/* برچسب نوع */}
                    <div className="absolute top-2 md:top-3 right-2 md:right-3">
                      <span className={`px-2 md:px-3 py-1 text-xs rounded-full font-semibold border backdrop-blur-lg shadow-lg ${typeInfo.color}`}>
                        {typeInfo.text}
                      </span>
                    </div>

                    {/* تاریخ */}
                    <div className="absolute bottom-2 md:bottom-3 right-2 md:right-3 bg-white/90 px-2 md:px-3 py-1 rounded-full text-xs font-bold text-gray-800">
                      {moment(action.date).format('jMM/jDD')}
                    </div>
                  </div>

                  {/* محتوا */}
                  <div className="p-3 md:p-6">
                    <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                      {action.title}
                    </h3>
                    
                    {action.description && (
                      <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                        {action.description.substring(0, 100)}
                        {action.description.length > 100 && '...'}
                      </p>
                    )}

                    {/* تاریخ کامل */}
                    <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500 mb-2 md:mb-4">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                      <span>تاریخ: {moment(action.date).format('jYYYY/jMM/jDD')}</span>
                    </div>

                    {/* دکمه مشاهده جزئیات */}
                    <button 
                      onClick={() => {
                        setSelectedAction(action);
                        setShowModal(true);
                      }}
                      className="w-full flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-600 rounded-lg md:rounded-xl transition-all duration-300 font-medium text-sm md:text-base group-hover:shadow-lg transform hover:scale-105"
                    >
                      <Eye className="w-3 h-3 md:w-4 md:h-4" />
                      مشاهده جزئیات
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* مودال مشاهده جزئیات */}
      {showModal && selectedAction && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-green-100">
            {/* Header مودال */}
            <div className={`sticky top-0 bg-gradient-to-r ${getTypeInfo(selectedAction).bgGradient} p-4 md:p-6 text-white flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                  {React.createElement(getTypeInfo(selectedAction).icon, { className: "w-5 h-5" })}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold">جزئیات کامل</h3>
                  <p className="text-sm opacity-90">{getTypeInfo(selectedAction).text}</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* محتوای مودال */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* عنوان */}
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-tight mb-2">
                  {selectedAction.title}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getTypeInfo(selectedAction).color}`}>
                  {getTypeInfo(selectedAction).text}
                </span>
              </div>

              {/* توضیحات */}
              {selectedAction.description && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-bold text-gray-700 mb-2">توضیحات:</h4>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                    {selectedAction.description}
                  </p>
                </div>
              )}

              {/* اطلاعات اضافی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span className="font-bold">تاریخ ثبت</span>
                  </div>
                  <p className="text-green-800 font-medium">
                    {moment(selectedAction.date).format('jYYYY/jMM/jDD')}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <User className="w-4 h-4" />
                    <span className="font-bold">ثبت کننده</span>
                  </div>
                  <p className="text-blue-800 font-medium">
                    {selectedAction.users ? `${selectedAction.users.first_name} ${selectedAction.users.last_name}` : 'مدیریت مدرسه'}
                  </p>
                </div>
              </div>

              {/* تاریخ ایجاد */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    ثبت شده در تاریخ: {moment(selectedAction.created_at).format('jYYYY/jMM/jDD - HH:mm')}
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