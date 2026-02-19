'use client'

import React, { useEffect, useState } from 'react';
import { 
  Award, Clock, FileText, ChevronDown, ChevronUp, 
  Eye, Calendar, TrendingUp, Target, Sparkles,
  BookOpen, AlertCircle
} from 'lucide-react';

export default function ExamResultsPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState({
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
        fetchResults(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleShowDetail = async (examId) => {
    setOpenDetailId(openDetailId === examId ? null : examId);
    if (openDetailId === examId) return;
    
    setDetailLoading(true);
    setDetail(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching details for exam:', examId, 'student:', studentId);
      
      const res = await fetch(`/api/student/exams/${examId}/answers/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ API Error:', res.status, errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('📊 Exam details received:', data);
      
      if (data.success) {
        setDetail(data);
      } else {
        throw new Error(data.error || 'خطا در دریافت جزئیات');
      }
    } catch (error) {
      console.error('💥 خطا در دریافت جزئیات:', error);
      setDetail({
        success: false,
        error: error.message,
        exam: null,
        quizResult: null,
        fileAnswers: []
      });
    } finally {
      setDetailLoading(false);
    }
  };

const fetchResults = async (userId) => {
  try {
    const token = localStorage.getItem('token');
    
    console.log('🔍 Fetching results for student ID:', userId);
    
    // 🔥 اصلاح: فقط از endpoint درست استفاده می‌کنیم
    const response = await fetch(`/api/student/${userId}/exam-results`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 API Response status:', response.status);
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
        return;
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log('📊 API Response data:', data);
    
    if (data.success && data.results) {
      console.log('✅ Results found:', data.results.length);
      
      // 🔥 استفاده مستقیم از داده‌های API (بدون پردازش اضافی)
      setResults(data.results);
      calculateStats(data.results);
    } else {
      console.log('❌ No results or unsuccessful response');
      setResults([]);
      setStats({ total: 0, completed: 0, pending: 0, averageScore: 0 });
    }
    
  } catch (error) {
    console.error('💥 خطا در دریافت نتایج:', error);
    setResults([]);
    setStats({ total: 0, completed: 0, pending: 0, averageScore: 0 });
  } finally {
    setLoading(false);
  }
};

const calculateStats = (resultsData) => {
  if (!Array.isArray(resultsData)) {
    setStats({ total: 0, completed: 0, pending: 0, averageScore: 0 });
    return;
  }

  const total = resultsData.length;
  const completed = resultsData.filter(r => r.grade_desc || r.marks_obtained !== null).length;
  const pending = total - completed;
  
  // محاسبه میانگین برای آزمون‌های عددی
  const numericResults = resultsData.filter(r => 
    r.marks_obtained !== null && 
    r.exam?.total_marks && 
    r.exam.total_marks > 0
  );
  
  const averageScore = numericResults.length > 0 
    ? (numericResults.reduce((sum, r) => {
        const percentage = (r.marks_obtained / r.exam.total_marks) * 100;
        return sum + percentage;
      }, 0) / numericResults.length).toFixed(1)
    : 0;

  console.log('📊 Stats calculated:', { total, completed, pending, averageScore });
  setStats({ total, completed, pending, averageScore });
};

  const getGradeColor = (grade) => {
    if (!grade) return 'text-gray-500';
    if (grade.includes('عالی') || grade.includes('A')) return 'text-green-600';
    if (grade.includes('خوب') || grade.includes('B')) return 'text-blue-600';
    if (grade.includes('متوسط') || grade.includes('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getExamTypeName = (type) => {
    switch (type) {
      case 'quiz': return 'تستی';
      case 'pdf': return 'PDF';
      case 'image': return 'تصویری';
      default: return 'نامشخص';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری نتایج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-5">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl p-6 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">نتایج آزمون‌ها</h1>
                <p className="text-green-100">
                  مشاهده نتایج و عملکرد آزمون‌ها - {user?.firstName} {user?.lastName}
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

      {/* عملکرد کلی */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Target className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900">عملکرد کلی شما</h3>
            <p className="text-green-700 text-sm">
              {stats.completed > 0 
                ? `از ${stats.total} آزمون، ${stats.completed} نتیجه اعلام شده  `
                : 'هنوز نتیجه‌ای اعلام نشده است'
              }
            </p>
          </div>
        </div>
      </div>

      {/* لیست نتایج */}
      <div className="bg-white rounded-2xl shadow-lg border border-green-100 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-green-600" />
          <h3 className="text-xl font-bold text-gray-800">نتایج آزمون‌های من</h3>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">
              هنوز در هیچ آزمونی شرکت نکرده‌اید یا نتیجه‌ای ثبت نشده است.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map(res => (
              <div key={res.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        res.exam?.type === 'quiz' ? 'bg-green-100 text-green-600' :
                        res.exam?.type === 'pdf' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">{res.exam?.title || 'آزمون'}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(res.completed_at || res.created_at).toLocaleDateString('fa-IR')}
                          </div>
                          <span>نوع: {getExamTypeName(res.exam?.type)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-left">
                    {/* نمایش وضعیت */}
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      res.grade_desc ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {res.grade_desc ? 'نتیجه اعلام شد' : 'در انتظار بررسی'}
                    </div>
                  </div>
                </div>

                {/* نمایش نتیجه نهایی */}
                {res.grade_desc && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <span className="text-sm text-gray-600">نمره توصیفی:</span>
                        <div className={`font-bold text-lg ${getGradeColor(res.grade_desc)}`}>
                          {res.grade_desc}
                        </div>
                      </div>
                      <Award className="w-8 h-8 text-green-500" />
                    </div>
                    
                    {/* بازخورد معلم */}
                    {res.teacher_feedback && (
                      <div className="pt-3 border-t border-green-200">
                        <span className="text-sm text-gray-600 block mb-2">نظر معلم:</span>
                        <p className="text-gray-800 bg-white rounded-lg p-3 text-sm">
                          {res.teacher_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* دکمه مشاهده جزئیات */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    className="flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
                    onClick={() => handleShowDetail(res.exam?.id)}
                  >
                    <Eye className="w-4 h-4" />
                    {openDetailId === res.exam?.id ? 'بستن جزئیات' : 'مشاهده جزئیات پاسخ‌ها'}
                    {openDetailId === res.exam?.id ? 
                      <ChevronUp className="w-4 h-4" /> : 
                      <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>

                {/* نمایش جزئیات بهبود یافته */}
                {openDetailId === res.exam?.id && (
                  <div className="bg-gray-50 rounded-xl p-4 mt-4">
                    {detailLoading && (
                      <div className="text-center text-gray-500 py-8">
                        <div className="animate-spin w-6 h-6 border-4 border-gray-300 border-t-transparent rounded-full mx-auto mb-2"></div>
                        در حال دریافت جزئیات...
                      </div>
                    )}
                    
                    {detail && !detailLoading && (
                      <>
                        {/* اطلاعات کلی آزمون */}
                        {detail.exam && (
                          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <h4 className="font-bold text-blue-900 mb-2">📋 {detail.exam.title}</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p>نوع: {getExamTypeName(detail.exam.type)}</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* راهنما */}
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-2">راهنمای مشاهده نتایج</h3>
            <ul className="text-green-700 space-y-1 text-sm">
              <li>• نتایج آزمون‌های شما پس از تصحیح معلم نمایش داده می‌شود</li>
              <li>• برای مشاهده جزئیات پاسخ‌ها روی "مشاهده جزئیات" کلیک کنید</li>
              <li>• نمره توصیفی و نظر معلم در این بخش قابل مشاهده است</li>
              <li>• فایل‌های ارسالی شما و بازخورد معلم نیز نمایش داده می‌شود</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// کامپوننت آمار
function StatsCard({ title, value, icon: Icon, gradient, iconGradient }) {
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-4 md:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-r ${iconGradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
        </div>
        <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
      </div>
      <div>
        <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{value}</p>
        <p className="text-sm md:text-base text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
}