'use client'
import { useEffect, useState } from 'react';

export default function ExamResults({ studentId }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDetailId, setOpenDetailId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    setLoading(true);
    // تغییر API به مسیر صحیح
    fetch(`/api/student/${studentId}/exam-results`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setResults(data.results || []);
        } else {
          console.error('خطا در دریافت نتایج:', data.error);
          setResults([]);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('خطا در دریافت نتایج:', error);
        setResults([]);
        setLoading(false);
      });
  }, [studentId]);

  const handleShowDetail = async (examId) => {
    setOpenDetailId(openDetailId === examId ? null : examId);
    if (openDetailId === examId) return;
    
    setDetailLoading(true);
    setDetail(null);
    
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/answers/${studentId}`);
      const data = await res.json();
      setDetail(data);
    } catch (error) {
      console.error('خطا در دریافت جزئیات:', error);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <div className="text-center text-green-600">در حال دریافت نتایج...</div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="font-bold mb-3 text-green-700">نتایج آزمون‌های من</h2>
      
      {results.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          هنوز در هیچ آزمونی شرکت نکرده‌اید یا نتیجه‌ای ثبت نشده است.
        </div>
      )}
      
      <ul className="space-y-3">
        {results.map(res => (
          <li key={res.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-bold text-gray-800">{res.exam?.title || 'آزمون'}</h3>
                <div className="text-xs text-gray-500 mt-1">
                  تاریخ: {new Date(res.completed_at || res.created_at).toLocaleDateString('fa-IR')}
                  <span className="mx-2">•</span>
                  نوع: {res.exam?.type === 'quiz' ? 'تستی' : 
                        res.exam?.type === 'pdf' ? 'PDF' : 
                        res.exam?.type === 'image' ? 'تصویری' : 'نامشخص'}
                </div>
              </div>
              
              <div className="text-left">
                {/* نمایش نمره عددی برای تستی */}
                {res.marks_obtained !== null && (
                  <div className="font-bold text-green-700 text-lg">
                    {res.marks_obtained} / {res.exam?.total_marks || '---'}
                  </div>
                )}
                
                {/* نمایش وضعیت */}
                <div className={`text-xs px-2 py-1 rounded-full ${
                  res.grade_desc ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {res.grade_desc ? 'نتیجه اعلام شد' : 'در انتظار بررسی'}
                </div>
              </div>
            </div>

            {/* نمایش نتیجه نهایی اگر موجود باشد */}
            {res.grade_desc && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">نمره توصیفی:</span>
                    <div className="font-bold text-green-800 text-lg">{res.grade_desc}</div>
                  </div>
                </div>
                
                {/* بازخورد معلم */}
                {res.teacher_feedback && (
                  <div className="mt-2 pt-2 border-t border-green-200">
                    <span className="text-sm text-gray-600 block mb-1">نظر معلم:</span>
                    <p className="text-gray-800 bg-white rounded p-2 text-sm">
                      {res.teacher_feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* دکمه مشاهده جزئیات */}
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                className="text-blue-600 text-sm underline hover:text-blue-800"
                onClick={() => handleShowDetail(res.exam?.id)}
              >
                {openDetailId === res.exam?.id ? 'بستن جزئیات' : 'مشاهده جزئیات پاسخ‌ها'}
              </button>
            </div>

            {/* نمایش جزئیات */}
            {openDetailId === res.exam?.id && (
              <div className="bg-gray-50 rounded-lg p-3 mt-3">
                {detailLoading && (
                  <div className="text-center text-gray-500">در حال دریافت جزئیات...</div>
                )}
                
                {detail && !detailLoading && (
                  <>
                    {/* پاسخ‌های تستی */}
                    {detail.quizResult && detail.quizResult.student_answers?.length > 0 ? (
                      <div className="mb-4">
                        <div className="font-bold mb-2 text-green-700">پاسخ‌های تستی شما:</div>
                        <ul className="space-y-2">
                          {detail.quizResult.student_answers.map((ans, idx) => (
                            <li key={ans.id || idx} className="text-sm bg-white rounded p-2">
                              <div className="font-medium mb-1">
                                سوال {idx + 1}: {ans.exam_questions?.question_text || `شناسه سوال: ${ans.question_id}`}
                              </div>
                              <div className="flex items-center gap-2">
                                <span>پاسخ شما:</span>
                                <span className={`font-bold px-2 py-1 rounded text-xs ${
                                  ans.is_correct ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}>
                                  {ans.question_options?.option_text || `گزینه ${ans.selected_option_id}`}
                                </span>
                                <span className="text-xs">
                                  {ans.is_correct ? '✅ صحیح' : '❌ غلط'}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 mb-4">پاسخ تستی ثبت نشده است.</div>
                    )}

                    {/* پاسخ‌های فایل */}
                    {detail.fileAnswers && detail.fileAnswers.length > 0 && (
                      <div>
                        <div className="font-bold mb-2 text-green-700">فایل‌های ارسالی شما:</div>
                        <ul className="space-y-2">
                          {detail.fileAnswers.map((fa, idx) => (
                            <li key={fa.id || idx} className="text-sm bg-white rounded p-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span>فایل ارسالی:</span>
                                <a 
                                  href={fa.file_url} 
                                  className="text-blue-600 underline hover:text-blue-800" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                >
                                  دانلود فایل
                                </a>
                              </div>
                              {fa.teacher_feedback && (
                                <div className="mt-1 p-2 bg-yellow-50 rounded">
                                  <span className="font-medium text-xs">نظر معلم:</span>
                                  <p className="text-xs text-gray-700 mt-1">{fa.teacher_feedback}</p>
                                </div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {!detail.quizResult?.student_answers?.length && !detail.fileAnswers?.length && (
                      <div className="text-center text-gray-500">هیچ جزئیاتی موجود نیست.</div>
                    )}
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}