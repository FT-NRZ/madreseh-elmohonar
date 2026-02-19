'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function StudentExamPage() {
  const { examId } = useParams();
  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [studentId, setStudentId] = useState(1);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const studentStr = localStorage.getItem('student');
      const userStr = localStorage.getItem('user');

      if (studentStr) {
        const s = JSON.parse(studentStr);
        if (s?.id) return setStudentId(Number(s.id));
        if (s?.student_id) return setStudentId(Number(s.student_id));
      }
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u?.studentId) return setStudentId(Number(u.studentId));
        if (u?.student_id) return setStudentId(Number(u.student_id));
        if (u?.role === 'student' && u?.id) return setStudentId(Number(u.id));
      }
    } catch {}
  }, []);

  useEffect(() => {
    async function fetchExam() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('لطفاً وارد سیستم شوید');
          window.location.href = '/login';
          return;
        }

        const res = await fetch(`/api/exams/student/${examId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!res.ok) {
          if (res.status === 401) {
            setError('جلسه شما منقضی شده. لطفاً مجدداً وارد شوید');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return;
          }
          throw new Error('آزمون یافت نشد');
        }

        const data = await res.json();
        if (data.success) {
          setExam(data.exam);
        } else {
          setError(data.error || 'خطا در دریافت آزمون');
        }
      } catch (err) {
        console.error('خطا در دریافت آزمون:', err);
        setError(err.message || 'خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    }
    if (examId) fetchExam();
  }, [examId]);

  const handleQuizChange = (idx, value) => {
    setAnswers(a => ({ ...a, [idx]: value }));
  };

  const getFileName = (url) => {
    try {
      const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
      return (u.pathname || '').split('/').pop() || 'file';
    } catch {
      return (url.split('/').pop() || 'file');
    }
  };

  // ✅ فقط یک تابع makeFileUrl
  const makeFileUrl = (url, disposition = 'attachment') => {
    if (!url) return null;

    // اگر URL کامل است، مستقیم استفاده کن
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // هر مسیر نسبی یا نام فایل را از API دانلود بده
    // API خودش اگر uploads/ نباشد، اضافه می‌کند
    const raw = url.replace(/^\/+/, ''); // حذف / اول
    const name = getFileName(url);
    return `/api/files/download?path=${encodeURIComponent(raw)}&disposition=${disposition}&name=${encodeURIComponent(name)}`;
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    if (exam?.is_active === false) {
      setMessage('این آزمون غیرفعال است.');
      return;
    }

    console.log('🔍 Debug info:', {
      examId,
      studentId,
      answers,
      answersCount: Object.keys(answers).length,
      user: JSON.parse(localStorage.getItem('user') || '{}'),
      token: localStorage.getItem('token') ? 'موجود' : 'ناموجود'
    });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('لطفاً وارد سیستم شوید');
        window.location.href = '/login';
        return;
      }

      const submitData = { 
        student_id: studentId, 
        answers 
      };
      
      console.log('📤 Sending data:', submitData);

      const res = await fetch(`/api/exams/student/${examId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      console.log('📡 Response status:', res.status);
      
      const data = await res.json();
      console.log('📊 Response data:', data);

      if (!res.ok) {
        if (res.status === 401) {
          setMessage('جلسه شما منقضی شده. لطفاً مجدداً وارد شوید');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        throw new Error(data.error || 'خطا در ارسال پاسخ');
      }

      if (data.success) {
        setMessage('پاسخ شما با موفقیت ثبت شد!');
        setAnswers({});
      } else {
        setMessage(data.error || 'خطا در ثبت پاسخ');
      }
    } catch (error) {
      console.error('💥 Submit error:', error);
      setMessage('خطا در ارتباط با سرور: ' + error.message);
    }
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (exam?.is_active === false) {
      setMessage('این آزمون غیرفعال است.');
      return;
    }
    if (!file) {
      setMessage('لطفاً فایل پاسخ را انتخاب کنید.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('لطفاً وارد سیستم شوید');
        window.location.href = '/login';
        return;
      }

      // 🔥 تغییر: آپلود فایل مستقیماً به storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'student-exam-answers'); // فولدر مخصوص پاسخ‌های دانش‌آموزان
      
      console.log('🚀 Uploading student answer file:', file.name);

      const uploadRes = await fetch('/api/storage/upload', { // ← تغییر از /api/upload به /api/storage/upload
        method: 'POST', 
        body: formData
        // حذف Authorization header چون storage/upload نیاز نداره
      });

      const uploadData = await uploadRes.json();
      console.log('📊 Upload response:', uploadData);
      
      if (!uploadData.success || !uploadData.url) {
        setMessage(uploadData.error || 'خطا در آپلود فایل');
        return;
      }

      console.log('✅ File uploaded successfully:', uploadData.url);

      // ارسال URL فایل آپلود شده
      const res = await fetch(`/api/exams/student/${examId}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          student_id: studentId, 
          file_url: uploadData.url 
        })
      });

      console.log('📡 Submit response status:', res.status);

      if (!res.ok) {
        if (res.status === 401) {
          setMessage('جلسه شما منقضی شده. لطفاً مجدداً وارد شوید');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return;
        }
        const errorData = await res.json();
        throw new Error(errorData.error || 'خطا در ارسال پاسخ');
      }

      const data = await res.json();
      console.log('📊 Submit response data:', data);
      
      if (data.success) {
        setMessage('پاسخ شما با موفقیت ثبت شد!');
        setFile(null);
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        setMessage(data.error || 'خطا در ثبت پاسخ');
      }
    } catch (error) {
      console.error('💥 Submit file error:', error);
      setMessage('خطا در ارتباط با سرور: ' + error.message);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>در حال بارگذاری آزمون...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="text-red-600 text-center">
            <h3 className="font-bold mb-2">خطا</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-md text-center">
          <h3 className="font-bold text-yellow-800 mb-2">آزمون یافت نشد</h3>
          <p className="text-yellow-600">آزمون مورد نظر در دسترس نیست.</p>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  if (exam.is_active === false) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
          <h2 className="text-xl font-bold mb-4 text-center">{exam.title}</h2>
          <div className="text-yellow-800 bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
            <h3 className="font-bold mb-2">آزمون غیرفعال</h3>
            <p>این آزمون در حال حاضر غیرفعال است.</p>
          </div>
          <button 
            onClick={() => window.history.back()}
            className="mt-4 w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  let quizQuestions = [];
  if (exam.type === 'quiz') {
    if (Array.isArray(exam.questions)) {
      quizQuestions = exam.questions;
    } else if (typeof exam.questions === 'string') {
      try {
        quizQuestions = JSON.parse(exam.questions);
      } catch {
        quizQuestions = [];
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{exam.title}</h2>
            {exam.description && (
              <p className="text-gray-600 mt-2">{exam.description}</p>
            )}
            <div className="flex gap-4 mt-3 text-sm text-gray-500">
              {exam.duration_minutes && (
                <span>⏱️ مدت: {exam.duration_minutes} دقیقه</span>
              )}
              {exam.max_marks && (
                <span>📊 نمره: {exam.max_marks}</span>
              )}
              <span>📝 نوع: {exam.type === 'quiz' ? 'تستی' : exam.type === 'pdf' ? 'PDF' : 'تصویری'}</span>
            </div>
          </div>

          {exam.type === 'pdf' && (
            <>
              {exam.pdf_url ? (
                <div className="mb-6 space-y-3">
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 text-gray-700">
                    این آزمون PDF است. می‌توانید در تب جدید باز کنید یا دانلود کنید.
                  </div>
                  <div className="flex gap-3 justify-end">
                    <a
                      href={makeFileUrl(exam.pdf_url, 'inline')}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      🔎 مشاهده در تب جدید
                    </a>
                    <a
                      href={makeFileUrl(exam.pdf_url, 'attachment')}
                      download={getFileName(exam.pdf_url)}
                      className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      ⬇️ دانلود PDF
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg">
                  فایل PDF برای این آزمون ثبت نشده است.
                </div>
              )}
              <form onSubmit={handleSubmitFile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آپلود پاسخ (عکس یا PDF):
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => setFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                  disabled={!file}
                >
                  ثبت پاسخ
                </button>
                {message && (
                  <div className={`p-3 rounded-lg ${message.includes('موفقیت') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </div>
                )}
              </form>
            </>
          )}

          {exam.type === 'image' && (
            <>
              {exam.image_url ? (
                <div className="mb-6 space-y-3">
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 text-gray-700">
                    این آزمون تصویری است. می‌توانید در تب جدید باز کنید یا دانلود کنید.
                  </div>
                  <div className="flex gap-3 justify-end">
                    <a
                      href={makeFileUrl(exam.image_url, 'inline')}
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      🔎 مشاهده در تب جدید
                    </a>
                    <a
                      href={makeFileUrl(exam.image_url, 'attachment')}
                      download={getFileName(exam.image_url)}
                      className="inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      ⬇️ دانلود تصویر
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-gray-600 mb-6 p-4 bg-gray-50 rounded-lg">
                  تصویر آزمون موجود نیست.
                </div>
              )}
              <form onSubmit={handleSubmitFile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    آپلود پاسخ (عکس یا PDF):
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={e => setFile(e.target.files[0])}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                <button 
                  type="submit" 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                  disabled={!file}
                >
                  ثبت پاسخ
                </button>
                {message && (
                  <div className={`p-3 rounded-lg ${message.includes('موفقیت') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                  </div>
                )}
              </form>
            </>
          )}

          {exam.type === 'quiz' && (
            <form onSubmit={handleSubmitQuiz} className="space-y-6">
              <h4 className="text-lg font-semibold text-gray-800">سوالات تستی:</h4>
              {quizQuestions.map((q, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-3">
                    {idx + 1}. {q.question}
                  </h5>
                  <div className="space-y-2">
                    {(q.options || []).map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition">
                        <input
                          type="radio"
                          name={`q${idx}`}
                          value={oIdx}
                          checked={answers[idx] == oIdx}
                          onChange={() => handleQuizChange(idx, oIdx)}
                          className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button 
                type="submit" 
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
              >
                ثبت پاسخ‌ها
              </button>
              {message && (
                <div className={`p-3 rounded-lg ${message.includes('موفقیت') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message}
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}