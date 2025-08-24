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
    fetch(`/api/exam-results?student_id=${studentId}`)
      .then(res => res.json())
      .then(data => {
        setResults(data.results || []);
        setLoading(false);
      });
  }, [studentId]);

  const handleShowDetail = async (examId) => {
    setOpenDetailId(openDetailId === examId ? null : examId);
    if (openDetailId === examId) return;
    setDetailLoading(true);
    setDetail(null);
    // فرض: API زیر پاسخ‌های دانش‌آموز را برمی‌گرداند
    const res = await fetch(`/api/exams/${examId}/student/${studentId}/answers`);
    const data = await res.json();
    setDetail(data);
    setDetailLoading(false);
  };

  if (loading) return <div>در حال دریافت نتایج...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-4 mt-4">
      <h2 className="font-bold mb-3 text-green-700">نتایج آزمون‌های من</h2>
      {results.length === 0 && <div>هنوز نتیجه‌ای ثبت نشده است.</div>}
      <ul>
        {results.map(res => (
          <li key={res.id} className="border-b py-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span>{res.exams?.title || 'آزمون'}</span>
              <span className="font-bold text-green-700">{res.marks_obtained} / {res.exams?.total_marks}</span>
              <span className="text-xs text-gray-500">{res.status === 'completed' ? 'پایان یافته' : 'در انتظار تصحیح'}</span>
              <button
                className="text-blue-600 text-xs underline"
                onClick={() => handleShowDetail(res.exam_id)}
              >
                {openDetailId === res.exam_id ? 'بستن جزئیات' : 'مشاهده جزئیات'}
              </button>
            </div>
            {openDetailId === res.exam_id && (
              <div className="bg-gray-50 rounded p-3 mt-2">
                {detailLoading && <div className="text-xs text-gray-400">در حال دریافت جزئیات...</div>}
                {detail && (
                  <>
                    {detail.quizResult && detail.quizResult.student_answers?.length > 0 ? (
                      <div>
                        <div className="font-bold mb-2 text-green-700">پاسخ‌های تستی:</div>
                        <ul className="text-sm">
                          {detail.quizResult.student_answers.map((ans, idx) => (
                            <li key={ans.id || idx} className="mb-2">
                              <span>سوال: {ans.exam_questions?.question_text || ans.question_id}</span>
                              <br />
                              <span>
                                پاسخ شما: <b className={ans.is_correct ? "text-green-600" : "text-red-600"}>
                                  {ans.question_options?.option_text || ans.selected_option_id}
                                </b>
                                {ans.is_correct !== undefined && (
                                  <span className="ml-2">
                                    {ans.is_correct ? '✅ صحیح' : '❌ غلط'}
                                  </span>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">پاسخ تستی ثبت نشده است.</div>
                    )}
                    {detail.fileAnswers && detail.fileAnswers.length > 0 && (
                      <div className="mt-3">
                        <div className="font-bold mb-2 text-green-700">پاسخ‌های فایل:</div>
                        <ul className="text-sm">
                          {detail.fileAnswers.map((fa, idx) => (
                            <li key={fa.id || idx} className="mb-2">
                              <span>فایل: <a href={fa.file_url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">دانلود</a></span>
                              {fa.teacher_comment && (
                                <div className="text-xs text-gray-600 mt-1">نظر معلم: {fa.teacher_comment}</div>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
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