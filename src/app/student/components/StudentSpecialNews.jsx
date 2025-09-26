'use client'
import React, { useEffect, useState } from 'react';
import { Newspaper, Calendar, Star, ChevronLeft } from 'lucide-react';
import moment from 'jalali-moment';

export default function StudentSpecialNews({ studentId }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpecialNews() {
      try {
        setLoading(true);
        
        const token = localStorage?.getItem?.('token');
        if (!token) return;

        const params = new URLSearchParams({
          role: 'student',
          userId: studentId || '',
        });
        
        const res = await fetch(`/api/news?${params.toString()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            // فقط اخبار ویژه دانش‌آموز را فیلتر کن
            const specialNews = data.news.filter(
              item => item.target_type === 'specific_student' && item.target_user_id == studentId
            );
            setNews(specialNews.slice(0, 3)); // فقط 3 خبر آخر
          }
        }
      } catch (error) {
        console.error('Error fetching special news:', error);
      } finally {
        setLoading(false);
      }
    }
    
    if (studentId) {
      fetchSpecialNews();
    }
  }, [studentId]);

  if (loading) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-bold text-gray-800">اخبار ویژه شما</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!news.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-green-100">
        <div className="flex items-center gap-3 mb-4">
          <Star className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-bold text-gray-800">اخبار ویژه شما</h3>
        </div>
        <div className="text-center py-6">
          <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">خبر ویژه‌ای برای شما ثبت نشده</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-green-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-orange-500" />
          <h3 className="text-lg font-bold text-gray-800">اخبار ویژه شما</h3>
        </div>
        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">
          {news.length} خبر
        </span>
      </div>
      
      <div className="space-y-3">
        {news.map((item) => (
          <div
            key={item.id}
            className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-xl p-4 hover:shadow-md transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <h4 className="font-bold text-gray-800 text-sm leading-tight flex-1 group-hover:text-orange-700 transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Calendar className="w-3 h-3" />
                <span>
                  {moment(item.publish_date || item.created_at).format('jMM/jDD')}
                </span>
              </div>
            </div>
            
            <p className="text-gray-600 text-xs leading-relaxed mb-3 line-clamp-2">
              {item.content.length > 80 
                ? `${item.content.substring(0, 80)}...` 
                : item.content
              }
            </p>
            
            <div className="flex items-center justify-between">
              <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star className="w-3 h-3" />
                ویژه شما
              </span>
              <button className="flex items-center text-orange-600 hover:text-orange-700 text-xs font-medium transition-colors">
                مطالعه
                <ChevronLeft className="w-3 h-3 mr-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {news.length >= 3 && (
        <div className="text-center mt-4">
          <button 
            onClick={() => setActiveTab('classnews')}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium transition-colors"
          >
            مشاهده همه اخبار ویژه
          </button>
        </div>
      )}
    </div>
  );
}