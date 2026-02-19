'use client'

import React, { useEffect, useState } from 'react';
import { Newspaper, Calendar, AlertCircle, Eye, Clock, Users } from 'lucide-react';
import moment from 'jalali-moment';

export default function NewsPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [gradeId, setGradeId] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // تنظیم کاربر و studentId
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
        setGradeId(userObj.grade_id || userObj.gradeId);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  // دریافت اخبار
  useEffect(() => {
    async function fetchNews() {
      if (!studentId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage?.getItem?.('token');
        if (!token) {
          throw new Error('توکن احراز هویت یافت نشد');
        }

        console.log('Fetching news with params:', { studentId, gradeId });
        
        const params = new URLSearchParams({
          role: 'student',
          userId: studentId || '',
          gradeId: gradeId || ''
        });
        
        const url = `/api/news?${params.toString()}`;
        console.log('Request URL:', url);
        
        const res = await fetch(url, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!res.ok) {
          // در صورت خطای API، اخبار نمونه نمایش داده می‌شود
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        
        const data = await res.json();
        console.log('News API response:', data);
        
        if (data.success) {
          setNews(data.news || []);
        } else {
          throw new Error(data.error || 'خطا در دریافت اخبار');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (studentId) {
      fetchNews();
    } else {
      setLoading(false);
    }
  }, [studentId, gradeId]);


  // تعیین نوع خبر برای نمایش بهتر
  const getNewsTypeInfo = (item) => {
    switch (item.target_type) {
      case 'public':
        return { 
          label: 'عمومی', 
          color: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
          icon: '🌐'
        };
      case 'students':
        return { 
          label: 'دانش‌آموزان', 
          color: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
          icon: '🎓'
        };
      case 'specific_grade':
        return { 
          label: item.target_grade?.grade_name ? `پایه ${item.target_grade.grade_name}` : 'پایه من', 
          color: 'bg-gradient-to-r from-green-500 to-green-600 text-white',
          icon: '📚'
        };
      case 'specific_student':
        return { 
          label: 'ویژه من', 
          color: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
          icon: '⭐'
        };
      default:
        return { 
          label: 'نامشخص', 
          color: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white',
          icon: '❓'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری اخبار...</p>
        </div>
      </div>
    );
  }

  // حالت عدم وجود خبر
  if (!news.length) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Newspaper className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">اخبار و اطلاعیه‌ها</h2>
              <p className="text-gray-100 text-sm">آخرین اخبار مدرسه و کلاس</p>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Newspaper className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">هیچ خبری موجود نیست</h3>
            <p className="text-gray-500">اخبار جدید به محض انتشار در اینجا نمایش داده خواهد شد</p>
          </div>
        </div>
      </div>
    );
  }

  // نمایش اخبار
  return (
    <div className="bg-gradient-to-br mb-5 from-green-50 to-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-8 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Newspaper className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">اخبار و اطلاعیه‌ها</h2>
              <p className="text-green-100 text-sm">آخرین اخبار مدرسه و کلاس</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold">{news.length}</span>
            </div>
            <p className="text-xs text-green-100 mt-1">خبر</p>
          </div>
        </div>
      </div>

      {/* News List */}
      <div className="p-8">
        <div className="space-y-6">
          {news.map((item) => {
            const typeInfo = getNewsTypeInfo(item);
            
            return (
              <div key={item.id} className="group">
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden transform hover:scale-[1.02]">
                  {/* News Header */}
                  <div className="p-6 border-b border-gray-50">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight flex-1 group-hover:text-green-700 transition-colors">
                        {item.title}
                      </h3>
                      <div className={`px-3 py-1.5 text-xs font-bold rounded-full shadow-md flex items-center gap-1 ${typeInfo.color}`}>
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {item.publish_date 
                            ? moment(item.publish_date).format('jYYYY/jMM/jDD') 
                            : moment(item.created_at).format('jYYYY/jMM/jDD')
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {item.publish_date 
                            ? moment(item.publish_date).format('HH:mm') 
                            : moment(item.created_at).format('HH:mm')
                          }
                        </span>
                      </div>
                      
                      {item.is_published && (
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                            منتشر شده
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* News Content */}
                  <div className="p-6">
                    {item.image_url && (
                      <div className="mb-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center" style={{ minHeight: '200px' }}>
                        <img 
                          src={item.image_url} 
                          alt={item.title}
                          className="max-w-full max-h-full object-contain"
                          style={{ width: 'auto', height: 'auto' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {item.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}