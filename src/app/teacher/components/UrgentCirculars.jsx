'use client';
import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Clock, Eye, X } from 'lucide-react';
import moment from 'jalali-moment';

export default function UrgentCirculars({ teacherId }) {
  const [urgentCirculars, setUrgentCirculars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCircular, setSelectedCircular] = useState(null);

  const fetchUrgentCirculars = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/circulars?role=teacher&teacherId=${userData.id}&showExpired=false`);
      const data = await response.json();
      if (data.success) {
        // فقط 3 بخشنامه اخیر با اولویت فوری یا مهم
        const urgent = data.circulars
          .filter(c => c.priority === 'urgent' || c.priority === 'high')
          .slice(0, 3);
        setUrgentCirculars(urgent);
      }
    } catch (error) {
      console.error('Error fetching urgent circulars:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacherId) {
      fetchUrgentCirculars();
    }
  }, [teacherId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (urgentCirculars.length === 0) {
    return (
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
        <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
          بخشنامه‌های مهم
        </h4>
        <p className="text-sm text-gray-500">بخشنامه مهمی وجود ندارد</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-3 md:p-6 border border-gray-100">
      <h4 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 md:w-5 md:h-5 text-red-500" />
        بخشنامه‌های مهم
        {urgentCirculars.some(c => !c.is_read) && (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
            جدید
          </span>
        )}
      </h4>
      <div className="space-y-2 md:space-y-3">
        {urgentCirculars.map((circular) => (
          <div 
            key={circular.id}
            className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg border transition-colors hover:bg-gray-50 cursor-pointer ${
              !circular.is_read 
                ? 'bg-red-50 border-red-200' 
                : circular.priority === 'urgent'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}
            onClick={() => setSelectedCircular(circular)}
          >
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              circular.priority === 'urgent' ? 'bg-red-500' : 'bg-orange-500'
            }`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs md:text-sm text-gray-700 font-medium line-clamp-1">
                  {circular.title}
                </span>
                {circular.priority === 'urgent' && (
                  <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                )}
                {!circular.is_read && (
                  <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {moment(circular.issue_date).format('jMM/jDD')}
                </span>
                {circular.circular_number && (
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded">
                    {circular.circular_number}
                  </span>
                )}
              </div>
            </div>
            <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </div>
        ))}
      </div>
      {/* Modal نمایش جزئیات بخشنامه */}
      {selectedCircular && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
              <h2 className="text-lg font-bold text-green-700">جزئیات بخشنامه مهم</h2>
              <button onClick={() => setSelectedCircular(null)} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <h3 className="font-bold text-gray-800">{selectedCircular.title}</h3>
              <p className="text-gray-700">{selectedCircular.content}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{moment(selectedCircular.issue_date).format('jYYYY/jMM/jDD')}</span>
              </div>
              {selectedCircular.circular_number && (
                <div className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded inline-block mt-2">
                  شماره بخشنامه: {selectedCircular.circular_number}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}