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
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes');
      const data = await res.json();
      if (data.success) setClasses(data.classes);
      else setClasses([]);
    } catch (err) {
      console.error('💥 Error fetching classes:', err);
      setClasses([]);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/teacher/exams')
      if (!res.ok) throw new Error('خطا در دریافت لیست آزمون‌ها')
      const data = await res.json()
      setExams(data)
    } catch (err) { setError(err.message) }
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
      if (data.success) {
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
      class_id: form.class_id,
      pdf_url: form.type === 'pdf' ? form.pdf_url : undefined,
      image_url: form.type === 'image' ? form.image_url : undefined,
      questions: form.type === 'quiz' ? form.questions : undefined
    };

    try {
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(examData)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm(initialForm);
        fetchExams();
        setShowForm(false);
      } else {
        setError(data.error || 'خطا در ثبت آزمون');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="max-w-screen-lg mx-auto bg-gradient-to-br from-green-100 to-green-50 rounded-lg shadow-lg p-6 border border-green-300">
      <h2 className="text-center mb-6 text-green-700 font-bold text-xl border-b border-green-300 pb-2">
        مدیریت آزمون‌ها
      </h2>
      <div className="text-center mb-6">
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg px-6 py-2 font-bold shadow-md hover:shadow-lg transition"
        >
          + ثبت آزمون جدید
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-6 shadow-md border border-green-300">
          <div className="mb-4">
            <label className="text-green-700 font-bold text-sm">عنوان آزمون:</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 rounded border border-green-300 mt-2 text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="text-green-700 font-bold text-sm">نوع آزمون:</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-2 rounded border border-green-300 mt-2 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="image">تصویری</option>
              <option value="quiz">تستی</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-green-700 font-bold text-sm">کلاس:</label>
            <select
              name="class_id"
              value={form.class_id}
              onChange={handleChange}
              className="w-full p-2 rounded border border-green-300 mt-2 text-sm"
            >
              <option value="">انتخاب کنید</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.class_name} {cls.grades ? `(${cls.grades.grade_name})` : ""}
                </option>
              ))}
            </select>
          </div>
          {form.type === "pdf" && (
            <div className="mb-4">
              <label className="text-green-700 font-bold text-sm">انتخاب فایل PDF:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
                className="w-full p-2 rounded border border-green-300 mt-2 text-sm"
              />
              {uploading && <div className="text-green-600 text-xs mt-2">در حال آپلود...</div>}
              {form.pdf_url && <div className="text-green-600 text-xs mt-2">✅ فایل آپلود شد: {form.pdf_url}</div>}
            </div>
          )}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition"
            >
              {uploading ? "در حال ارسال..." : "ثبت آزمون"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gradient-to-r from-red-600 to-red-800 text-white rounded-lg px-4 py-2 shadow-md hover:shadow-lg transition"
            >
              انصراف
            </button>
          </div>
        </form>
      )}
      <h3 className="mt-6 text-green-700 text-lg border-b border-green-300 pb-2">
        لیست آزمون‌ها
      </h3>
      <ul className="list-none mt-4">
        {exams.map(exam => (
          <li key={exam.id} className="bg-white rounded-lg mb-4 p-4 shadow-md border border-green-300 flex items-center justify-between">
            <span className="font-bold text-green-700 text-sm">{exam.title}</span>
            <span className="bg-green-600 text-white rounded-lg px-3 py-1 text-xs font-bold">
              {exam.type === "pdf" ? "PDF" : exam.type === "image" ? "تصویری" : "تستی"}
            </span>
            <span className="bg-green-100 text-green-700 border border-green-600 rounded-lg px-3 py-1 text-xs font-bold">
              {classes.find(cls => cls.id == exam.class_id)?.class_name || "بدون کلاس"}{" "}
              {classes.find(cls => cls.id == exam.class_id)?.grades?.grade_name || ""}
            </span>
            <Link href={`/teacher/exams/${exam.id}`}>
              <button className="bg-blue-600 w-30 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-blue-700 transition">
                نتایج
              </button>
            </Link>
            <button
              onClick={() => handleDelete(exam.id)}
              className="bg-red-600 w-30 text-white rounded-lg px-3 py-1 text-xs font-bold hover:bg-red-700 transition"
            >
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}