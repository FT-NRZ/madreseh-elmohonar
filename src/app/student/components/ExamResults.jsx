'use client'
import { useEffect, useState } from 'react';
import { Award, Clock, FileText, ChevronDown, ChevronUp, Eye, Calendar } from 'lucide-react';

export default function ExamResults({ studentId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/student/${studentId}/exam-results`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setResults(data.results || []);
        } else {
          console.error('خطا در دریافت نتایج:', data.error);
          setResults([]);
        }
      } catch (error) {
        console.error('خطا در دریافت نتایج:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [studentId]);

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
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
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
      // نمایش پیام خطا به جای sample data
      setDetail({
        success: false,
        error: `خطا در دریافت جزئیات: ${error.message}`,
        exam: null,
        quizResult: null,
        fileAnswers: []
      });
    } finally {
      setDetailLoading(false);
    }
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
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-green-600">در حال دریافت نتایج...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            هنوز در هیچ آزمونی شرکت نکرده‌اید یا نتیجه‌ای ثبت نشده است.
          </p>
        </div>
      )}
      
      {results.map(res => (
        <div key={res.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${
                  res.exam?.type === 'quiz' ? 'bg-purple-100 text-purple-600' :
                  res.exam?.type === 'pdf' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
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
              {/* نمایش نمره عددی برای تستی */}
              {res.marks_obtained !== null && (
                <div className="font-bold text-green-700 text-xl mb-2">
                  {res.marks_obtained} / {res.exam?.total_marks || '---'}
                </div>
              )}
              
              {/* نمایش وضعیت */}
              <div className={`text-sm px-3 py-1 rounded-full ${
                res.grade_desc ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {res.grade_desc ? 'نتیجه اعلام شد' : 'در انتظار بررسی'}
              </div>
            </div>
          </div>

          {/* نمایش نتیجه نهایی اگر موجود باشد */}
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
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
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

          {/* نمایش جزئیات */}
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
                  {/* پاسخ‌های تستی */}
                  {detail.quizResult && detail.quizResult.student_answers?.length > 0 ? (
                    <div className="mb-6">
                      <div className="font-bold mb-4 text-green-700 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        پاسخ‌های تستی شما:
                      </div>
                      <div className="space-y-3">
                        {detail.quizResult.student_answers.map((ans, idx) => (
                          <div key={ans.id || idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="font-medium mb-2 text-gray-800">
                              سوال {idx + 1}: {ans.exam_questions?.question_text || `شناسه سوال: ${ans.question_id}`}
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-gray-600">پاسخ شما:</span>
                              <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                                ans.is_correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {ans.question_options?.option_text || `گزینه ${ans.selected_option_id}`}
                              </span>
                              <span className={`text-sm font-medium ${
                                ans.is_correct ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {ans.is_correct ? '✅ صحیح' : '❌ غلط'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mb-4 text-center py-4">
                      پاسخ تستی ثبت نشده است.
                    </div>
                  )}

                  {/* پاسخ‌های فایل */}
                  {detail.fileAnswers && detail.fileAnswers.length > 0 && (
                    <div>
                      <div className="font-bold mb-4 text-green-700 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        فایل‌های ارسالی شما:
                      </div>
                      <div className="space-y-3">
                        {detail.fileAnswers.map((fa, idx) => (
                          <div key={fa.id || idx} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-gray-600">فایل ارسالی:</span>
                              <a 
                                href={fa.file_url} 
                                className="text-blue-600 hover:text-blue-800 underline font-medium" 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                دانلود فایل
                              </a>
                            </div>
                            {fa.teacher_feedback && (
                              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <span className="font-medium text-sm text-yellow-800 block mb-1">نظر معلم:</span>
                                <p className="text-sm text-gray-700">{fa.teacher_feedback}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!detail.quizResult?.student_answers?.length && !detail.fileAnswers?.length && (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      هیچ جزئیاتی موجود نیست.
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}