'use client';

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Clock, Target, Award, 
  FileText, Calendar, TrendingUp,
  Sparkles, BookOpen, AlertCircle
} from 'lucide-react';
import ExamsList from '../components/ExamsList';
import ExamResults from '../components/ExamResults';

export default function ExamsPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // active, results
  const [examStats, setExamStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    averageScore: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
        fetchExamStats(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
    setLoading(false);
  }, []);

  const fetchExamStats = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/student/${userId}/exam-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExamStats(data.stats);
        }
      } else {
        // مقادیر پیش‌فرض
        setExamStats({ total: 12, completed: 8, pending: 4, averageScore: 17.5 });
      }
    } catch (error) {
      console.error('Error fetching exam stats:', error);
      setExamStats({ total: 12, completed: 8, pending: 4, averageScore: 17.5 });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری آزمون‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-5">
      {/* Header - تم سبز */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">آزمون‌های من</h1>
                <p className="text-green-100">
                  شرکت در آزمون‌ها و مشاهده نتایج - {user?.firstName} {user?.lastName}
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="text-green-100">
                {new Date().toLocaleDateString('fa-IR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              آزمون‌های فعال
            </div>
          </button>
          <button
            onClick={() => setActiveTab('results')}
            className={`flex-1 px-6 py-4 text-center font-semibold transition-all ${
              activeTab === 'results'
                ? 'bg-green-50 text-green-700 border-b-2 border-green-600'
                : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Award className="w-5 h-5" />
              نتایج آزمون‌ها
            </div>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'active' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Target className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">آزمون‌های فعال</h3>
              </div>
              <ExamsList studentId={studentId} activeOnly={true} />
            </div>
          )}

          {activeTab === 'results' && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Award className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-gray-800">نتایج آزمون‌ها</h3>
              </div>
              <ExamResults studentId={studentId} />
            </div>
          )}
        </div>
      </div>

      {/* راهنمای سریع - تم سبز */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-2">راهنمای شرکت در آزمون</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• ابتدا پایه (کلاس) خود را انتخاب کنید</li>
              <li>• آزمون‌های موجود نمایش داده می‌شود</li>
              <li>• روی "شرکت در آزمون" کلیک کنید</li>
              <li>• بسته به نوع آزمون، پاسخ‌ها را ثبت کنید</li>
              <li>• نتایج در تب "نتایج آزمون‌ها" قابل مشاهده است</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}