"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'

const initialForm = {
  title: '',
  type: 'pdf',
  pdf_url: '',
  image_url: '',
  class_id: '',
  questions: [
    { question: '', options: ['', '', '', ''], answer: 0 }
  ]
}

export default function ExamsList() {
  const [form, setForm] = useState(initialForm)
  const [exams, setExams] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const fixedClasses = [
    { id: 1, name: "اول ابتدایی" },
    { id: 2, name: "دوم ابتدایی" },
    { id: 3, name: "سوم ابتدایی" },
    { id: 4, name: "چهارم ابتدایی" }
  ];

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams', { cache: 'no-store' });
      if (!res.ok) throw new Error('خطا در دریافت لیست آزمون‌ها');
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : (data.exams || data.data || []);
      setExams(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('fetchExams error:', err);
      setExams([]);
      setError(err.message || 'خطا در دریافت لیست آزمون‌ها');
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  }

  const handleFileUpload = async (file, fileType) => {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.url) {
        if (fileType === 'pdf') {
          setForm(f => ({ ...f, pdf_url: data.url }));
        } else if (fileType === 'image') {
          setForm(f => ({ ...f, image_url: data.url }));
        }
      } else {
        setError(data.error || 'خطا در آپلود فایل');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      setError('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const examData = {
      title: form.title,
      type: form.type,
      class_id: form.class_id ? Number(form.class_id) : undefined,
      pdf_url: form.type === 'pdf' ? form.pdf_url : undefined,
      image_url: form.type === 'image' ? form.image_url : undefined,
      questions: form.type === 'quiz' ? form.questions : undefined
    };

    try {
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
        setForm(initialForm);
        setShowForm(false);
        await fetchExams();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || 'خطا در ثبت آزمون');
      }
    } catch (error) {
      console.error('submit error:', error);
      setError('خطا در ارتباط با سرور');
    }
  };

  const handleQuizQuestionChange = (idx, field, value) => {
    const questions = [...form.questions];
    if (field === 'question') {
      questions[idx].question = value;
    } else if (field.startsWith('option')) {
      const optionIdx = Number(field.replace('option', ''));
      questions[idx].options[optionIdx] = value;
    } else if (field === 'answer') {
      questions[idx].answer = Number(value);
    }
    setForm(f => ({ ...f, questions }));
  };

  const handleAddQuizQuestion = () => {
    setForm(f => ({
      ...f,
      questions: [...f.questions, { question: '', options: ['', '', '', ''], answer: 0 }]
    }));
  };

  const handleRemoveQuizQuestion = (idx) => {
    setForm(f => ({
      ...f,
      questions: f.questions.filter((_, i) => i !== idx)
    }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('آیا مطمئن هستید که می‌خواهید این آزمون را حذف کنید؟')) return;
    try {
      const res = await fetch(`/api/teacher/exams/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchExams();
      } else {
        setError('خطا در حذف آزمون');
      }
    } catch (e) {
      console.error('delete error:', e);
      setError('خطا در ارتباط با سرور');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const res = await fetch(`/api/teacher/exams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchExams();
      } else {
        setError('خطا در تغییر وضعیت آزمون');
      }
    } catch (e) {
      console.error('toggle error:', e);
      setError('خطا در ارتباط با سرور');
    }
  };

  const getClassName = (classId) => {
    const cls = fixedClasses.find(c => c.id === Number(classId));
    return cls ? cls.name : "بدون کلاس";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-green-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Page Header */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg mb-8">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
                  مدیریت آزمون‌ها
                </h1>
                <p className="text-slate-600 text-sm">
                  ایجاد، ویرایش و مدیریت آزمون‌های دانش آموزان
                </p>
              </div>
              
              <button
                onClick={() => { 
                  setShowForm(s => !s); 
                  setError(''); 
                  setSuccess(false); 
                  if (!showForm) setForm(initialForm);
                }}
                className={`
                  px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-200
                  ${showForm 
                    ? 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200' 
                    : 'bg-green-600 text-white shadow-md hover:bg-green-700 hover:shadow-lg'
                  }
                `}
              >
                {showForm ? 'لغو' : 'آزمون جدید +'}
              </button>
            </div>
          </div>
        </div>

        {/* Notification Messages */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="text-green-600 text-sm font-medium">
                آزمون با موفقیت ثبت شد ✓
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
            <div className="flex">
              <div className="text-red-700 text-sm font-medium">
                {error}
              </div>
            </div>
          </div>
        )}

        {/* Create Exam Form */}
        {showForm && (
          <div className="bg-white shadow-sm border border-slate-200 rounded-lg mb-8">
            <div className="border-b border-slate-200 px-8 py-4">
              <h2 className="text-xl font-semibold text-slate-800">ایجاد آزمون جدید</h2>
              <p className="text-slate-600 text-sm mt-1">فیلدهای ضروری را تکمیل کنید</p>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    عنوان آزمون
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    placeholder="مثال: آزمون ریاضی فصل اول"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    نوع آزمون
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  >
                    <option value="pdf">فایل PDF</option>
                    <option value="image">تصویر</option>
                    <option value="quiz">تست چهار گزینه‌ای</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    کلاس
                  </label>
                  <select
                    name="class_id"
                    value={form.class_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                    required
                  >
                    <option value="">انتخاب کلاس</option>
                    {fixedClasses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(form.type === 'pdf' || form.type === 'image') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {form.type === 'pdf' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        آپلود فایل PDF
                      </label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={e => handleFileUpload(e.target.files[0], 'pdf')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {form.pdf_url && (
                        <p className="text-sm text-green-600">✓ فایل با موفقیت آپلود شد</p>
                      )}
                    </div>
                  )}

                  {form.type === 'image' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        آپلود تصویر
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleFileUpload(e.target.files[0], 'image')}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {form.image_url && (
                        <p className="text-sm text-green-600">✓ تصویر با موفقیت آپلود شد</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {uploading && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center mb-6">
                  <div className="text-slate-600">در حال آپلود...</div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}

              {form.type === 'quiz' && (
                <div className="space-y-6 mb-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-slate-800">سوالات تست</h3>
                    <button
                      type="button"
                      onClick={handleAddQuizQuestion}
                      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                    >
                      افزودن سوال +
                    </button>
                  </div>

                  <div className="space-y-4">
                    {form.questions.map((q, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-slate-700">
                            سوال {idx + 1}
                          </span>
                          {form.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuizQuestion(idx)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              حذف
                            </button>
                          )}
                        </div>

                        <div className="space-y-4">
                          <input
                            value={q.question}
                            onChange={e => handleQuizQuestionChange(idx, 'question', e.target.value)}
                            placeholder="متن سوال"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            required
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {q.options.map((opt, oIdx) => (
                              <input
                                key={oIdx}
                                value={opt}
                                onChange={e => handleQuizQuestionChange(idx, `option${oIdx}`, e.target.value)}
                                placeholder={`گزینه ${oIdx + 1}`}
                                className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                required
                              />
                            ))}
                          </div>

                          <div className="flex items-center space-x-4 space-x-reverse">
                            <label className="text-sm font-medium text-slate-700">
                              پاسخ صحیح:
                            </label>
                            <select
                              value={q.answer}
                              onChange={e => handleQuizQuestionChange(idx, 'answer', e.target.value)}
                              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            >
                              {q.options.map((_, oIdx) => (
                                <option key={oIdx} value={oIdx}>
                                  گزینه {oIdx + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-4 space-x-reverse pt-6 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  ثبت آزمون
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setForm(initialForm); }}
                  className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exams Table */}
        <div className="bg-white shadow-sm border border-slate-200 rounded-lg">
          <div className="border-b border-slate-200 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">لیست آزمون‌ها</h2>
                <p className="text-slate-600 text-sm mt-1">
                  {exams.length} آزمون ثبت شده
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {exams.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  هیچ آزمونی یافت نشد
                </h3>
                <p className="text-slate-600 mb-6">
                  برای شروع اولین آزمون خود را ایجاد کنید
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-8 py-4 text-right text-sm font-medium text-slate-700">
                      عنوان
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-slate-700">
                      نوع
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-slate-700">
                      کلاس
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-medium text-slate-700">
                      وضعیت
                    </th>
                    <th className="px-8 py-4 text-center text-sm font-medium text-slate-700">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exams.map((exam, index) => (
                    <tr key={exam.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="px-8 py-6">
                        <div>
                          <div className="text-sm font-medium text-slate-900">
                            {exam.title}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {exam.description || 'بدون توضیحات'}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-6 text-center">
                        <span className={`
                          inline-flex px-3 py-1 rounded-full text-xs font-medium
                          ${exam.type === 'pdf' ? 'bg-blue-100 text-blue-800' : 
                            exam.type === 'image' ? 'bg-purple-100 text-purple-800' : 
                            'bg-green-100 text-green-800'}
                        `}>
                          {exam.type === 'pdf' ? 'PDF' : exam.type === 'image' ? 'تصویر' : 'تست'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-6 text-center">
                        <span className="text-sm text-slate-700">
                          {getClassName(exam.class_id)}
                        </span>
                      </td>
                      
                      <td className="px-4 py-6 text-center">
                        <button
                          onClick={() => handleToggleActive(exam.id, exam.is_active)}
                          className={`
                            inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors
                            ${exam.is_active 
                              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                          `}
                        >
                          {exam.is_active ? 'فعال' : 'غیرفعال'}
                        </button>
                      </td>
                      
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center space-x-2 space-x-reverse">
                          <Link
                            href={`/teacher/exams/${exam.id}`}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            نتایج
                          </Link>
                          <button
                            onClick={() => handleDelete(exam.id)}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}