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
  const studentId = 1; // مقدار 1 باید در جدول students وجود داشته باشد

  useEffect(() => {
    async function fetchExam() {
      try {
        const res = await fetch(`/api/exams/student/${examId}`);
        if (!res.ok) {
          throw new Error('آزمون یافت نشد');
        }
        const data = await res.json();
        setExam(data.exam);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchExam();
  }, [examId]);

  const handleQuizChange = (idx, value) => {
    setAnswers(a => ({ ...a, [idx]: value }));
  };

  const handleSubmitQuiz = async (e) => {
    e.preventDefault();
    const res = await fetch(`/api/exams/student/${examId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        answers: answers
      })
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      setMessage('خطا در ارتباط با سرور یا ثبت پاسخ!');
      return;
    }
    if (data.success) setMessage('پاسخ شما ثبت شد!');
    else setMessage(data.error || 'خطا در ثبت پاسخ');
  };

  const handleSubmitFile = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('لطفاً فایل پاسخ را انتخاب کنید.');
      return;
    }
    // آپلود فایل به سرور
    const formData = new FormData();
    formData.append('file', file);
    const uploadRes = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    let uploadData = {};
    try {
      uploadData = await uploadRes.json();
    } catch {
      setMessage('خطا در ارتباط با سرور یا آپلود فایل!');
      return;
    }
    if (!uploadData.url) {
      setMessage('خطا در آپلود فایل');
      return;
    }
    // ثبت پاسخ فایل
    const res = await fetch(`/api/exams/student/${examId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: studentId,
        file_url: uploadData.url
      })
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      setMessage('خطا در ارتباط با سرور یا ثبت پاسخ!');
      return;
    }
    if (data.success) setMessage('پاسخ شما ثبت شد!');
    else setMessage(data.error || 'خطا در ثبت پاسخ');
  };

  if (loading) return <div>در حال بارگذاری آزمون...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!exam) return <div>آزمون یافت نشد.</div>;

  // --- اصلاح بخش سوالات تستی برای جلوگیری از خطای JSON.parse ---
  let quizQuestions = [];
  if (exam.type === 'quiz') {
    if (Array.isArray(exam.questions)) {
      quizQuestions = exam.questions;
    } else if (typeof exam.questions === "string") {
      try {
        quizQuestions = JSON.parse(exam.questions);
      } catch {
        quizQuestions = [];
      }
    } else {
      quizQuestions = [];
    }
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-bold mb-4">{exam.title}</h2>
      {exam.type === 'pdf' && (
        <>
          <iframe
            src={exam.pdf_url}
            width="100%"
            height="600px"
            title="PDF آزمون"
            className="border border-gray-300 rounded"
          />
          <form onSubmit={handleSubmitFile} className="mt-4">
            <label className="block mb-2">آپلود پاسخ (عکس یا PDF):</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="block my-2"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              ثبت پاسخ
            </button>
            <div className="mt-2 text-green-700">{message}</div>
          </form>
        </>
      )}
      {exam.type === 'image' && (
        <>
          <img
            src={exam.image_url}
            alt="آزمون تصویری"
            className="max-w-full border border-gray-300 rounded"
          />
          <form onSubmit={handleSubmitFile} className="mt-4">
            <label className="block mb-2">آپلود پاسخ (عکس یا PDF):</label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={e => setFile(e.target.files[0])}
              className="block my-2"
            />
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
              ثبت پاسخ
            </button>
            <div className="mt-2 text-green-700">{message}</div>
          </form>
        </>
      )}
      {exam.type === 'quiz' && (
        <form onSubmit={handleSubmitQuiz}>
          <h4 className="mb-2">سوالات تستی:</h4>
          {quizQuestions.map((q, idx) => (
            <div key={idx} className="mb-3">
              <label className="block mb-1">{q.question}</label>
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`q${idx}`}
                    value={oIdx}
                    checked={answers[idx] == oIdx}
                    onChange={() => handleQuizChange(idx, oIdx)}
                  />
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          ))}
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
            ثبت پاسخ
          </button>
          <div className="mt-2 text-green-700">{message}</div>
        </form>
      )}
    </div>
  );
}