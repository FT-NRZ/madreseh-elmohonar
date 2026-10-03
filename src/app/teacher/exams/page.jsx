'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BookOpen, Plus, FileText, Image, CheckCircle, XCircle, 
  Eye, Trash2, AlertCircle, RefreshCw, GraduationCap, Sparkles,
  Users, Target, Calendar
} from 'lucide-react';

// تابع لاگر امن برای جلوگیری از لاگ داده‌های حساس
const safeLog = (message, data = null) => {
  if (process.env.NODE_ENV === 'production') return;
  
  if (data && typeof data === 'object') {
    const sanitized = { ...data };
    
    // حذف یا ماسک کردن داده‌های حساس
    if (sanitized.file) sanitized.file = '[File Object]';
    if (sanitized.pdf_url) sanitized.pdf_url = '[PDF URL]';
    if (sanitized.image_url) sanitized.image_url = '[IMAGE URL]';
    if (sanitized.questions) sanitized.questions = `[Questions: ${Array.isArray(sanitized.questions) ? sanitized.questions.length : 0}]`;
    
    console.log(`[DEBUG] ${message}`, sanitized);
  } else {
    console.log(`[DEBUG] ${message}`, data);
  }
};

const makeFileUrl = (url, disposition = 'inline') => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) {
    const name = url.split('/').pop()?.split('?')[0] || 'exam-file';
    return `/api/files/download?path=${encodeURIComponent(url)}&disposition=${disposition}&name=${encodeURIComponent(name)}`;
  }
  return url;
};

const initialForm = {
  title: '',
  type: 'pdf',
  pdf_url: '',
  image_url: '',
  grade_id: '', 
  questions: [
    { question: '', options: ['', '', '', ''], answer: 0 }
  ]
};

export default function TeacherExamsPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [exams, setExams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [toast, setToast] = useState({ show: false, type: 'success', msg: '' });
  const showToast = (msg, type = 'success', timeout = 3000) => {
    setToast({ show: true, type, msg });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(t => ({ ...t, show: false })), timeout);
  };

  useEffect(() => {
    // بررسی احراز هویت و دریافت اطلاعات معلم
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        if (userObj.role !== 'teacher') {
          window.location.href = '/';
          return;
        }
        setTeacher(userObj);
        setTeacherId(userObj.id);
        
        // شروع دریافت آزمون‌ها
        fetchExams();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const xUserId = getLocalUserId();
      const res = await fetch('/api/teacher/exams', { 
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Id': xUserId ? String(xUserId) : ''
        }
      });
      
      if (!res.ok) throw new Error('خطا در دریافت لیست آزمون‌ها');
      
      const data = await res.json().catch(() => []);
      const list = Array.isArray(data) ? data : (data.exams || data.data || []);
      setExams(Array.isArray(list) ? list : []);
    } catch (err) {
      safeLog('fetchExams error', { status: err.status, message: err.message });
      setExams([]);
      setError(err.message || 'خطا در دریافت لیست آزمون‌ها');
    } finally {
      setLoading(false);
    }
  };
  
  const getLocalUserId = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const u = JSON.parse(raw);
      return Number(u?.id ?? u?.userId ?? u?.user_id) || null;
    } catch { return null; }
  };

const fetchGrades = async () => {
  try {
    console.log('🔍 Fetching grades from API...');
    
    const token = localStorage.getItem('token');
    const res = await fetch('/api/grades', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Grades API response status:', res.status);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('📚 Grades received:', data);
    
    if (data.success && Array.isArray(data.grades)) {
      setGrades(data.grades);
      console.log('✅ Grades loaded successfully:', data.grades.length);
    } else {
      console.log('❌ No grades found or invalid response');
      setGrades([]);
    }
  } catch (error) {
    console.error('💥 خطا در دریافت پایه‌ها:', error);
    setGrades([]); // فقط آرایه خالی، هیچ داده پیش‌فرضی نه
    setError(`خطا در دریافت پایه‌ها: ${error.message}`);
  }
};

useEffect(() => {
  // بررسی احراز هویت و دریافت اطلاعات معلم
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const userObj = JSON.parse(userData);
      if (userObj.role !== 'teacher') {
        window.location.href = '/';
        return;
      }
      setTeacher(userObj);
      setTeacherId(userObj.id);
      fetchExams();
      fetchGrades(); // دریافت پایه‌ها
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  } else {
    window.location.href = '/';
  }
}, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setForm(f => ({ ...f, [name]: files[0] }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleFileUpload = async (file, fileType) => {
    if (!file) return;
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', `teacher-exams/${fileType}`); // فولدر مخصوص فایل‌های آزمون

      console.log(`🚀 Uploading ${fileType} file:`, file.name);

      // 🔥 تغییر: مستقیماً به storage/upload می‌ریم
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log(`📊 Upload response for ${fileType}:`, data);

      if (data.success && data.url) {
        if (fileType === 'pdf') {
          setForm(f => ({ ...f, pdf_url: data.url }));
          showToast('فایل PDF با موفقیت آپلود شد', 'success');
        } else if (fileType === 'image') {
          setForm(f => ({ ...f, image_url: data.url }));
          showToast('تصویر با موفقیت آپلود شد', 'success');
        }
        console.log(`✅ ${fileType.toUpperCase()} uploaded successfully:`, data.url);
      } else {
        console.error(`❌ Upload failed for ${fileType}:`, data);
        setError(data.error || `خطا در آپلود ${fileType === 'pdf' ? 'فایل PDF' : 'تصویر'}`);
        showToast(`خطا در آپلود ${fileType === 'pdf' ? 'فایل PDF' : 'تصویر'}`, 'error');
      }
    } catch (error) {
      console.error(`💥 Upload error for ${fileType}:`, error);
      setError(`خطا در آپلود ${fileType === 'pdf' ? 'فایل PDF' : 'تصویر'}: ` + error.message);
      showToast('خطا در ارتباط با سرور', 'error');
    } finally {
      setUploading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    console.log('🚀 Submitting exam with form data:', {
      title: form.title,
      type: form.type,
      grade_id: form.grade_id,
      grade_id_type: typeof form.grade_id
    });

    const examData = {
      title: form.title?.trim(),
      type: form.type,
      grade_id: Number(form.grade_id) // استفاده از grade_id به جای class_id
    };

    // اعتبارسنجی قبل از ارسال
    if (!examData.grade_id || isNaN(examData.grade_id)) {
      setError('انتخاب پایه تحصیلی الزامی است');
      return;
    }

    // اضافه کردن فیلدهای اختیاری
    if (form.type === 'pdf') {
      examData.pdf_url = form.pdf_url?.trim();
    } else if (form.type === 'image') {
      examData.image_url = form.image_url?.trim();
    } else if (form.type === 'quiz') {
      examData.questions = form.questions;
    }

    console.log('📤 Sending exam data:', examData);

    try {
      const token = localStorage.getItem('token');
      const xUserId = getLocalUserId();
      const res = await fetch('/api/teacher/exams', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': xUserId ? String(xUserId) : ''
        },
        body: JSON.stringify(examData)
      });
      
      console.log('📡 Response status:', res.status);
      
      const data = await res.json();
      console.log('📊 Response data:', data);
      
      if (res.ok && data.success) {
        setSuccess(true);
        setForm(initialForm);
        setShowForm(false);
        await fetchExams();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(data.error || `خطا در ثبت آزمون (کد: ${res.status})`);
      }
    } catch (error) {
      console.error('💥 Submit error:', error);
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
      const token = localStorage.getItem('token');
      const xUserId = getLocalUserId();
      const res = await fetch(`/api/teacher/exams/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-User-Id': xUserId ? String(xUserId) : ''
        }
      });
      if (res.ok) {
        showToast('آزمون با موفقیت حذف شد', 'success');
        fetchExams();
      } else {
        const msg = `خطا در حذف آزمون (کد ${res.status})`;
        showToast(msg, 'error');
        setError('خطا در حذف آزمون');
      }
    } catch (e) {
      safeLog('delete error', { id, message: e.message });
      showToast('خطا در ارتباط با سرور', 'error');
      setError('خطا در ارتباط با سرور');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const xUserId = getLocalUserId();
      const res = await fetch(`/api/teacher/exams/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-User-Id': xUserId ? String(xUserId) : ''
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (res.ok) {
        fetchExams();
      } else {
        setError('خطا در تغییر وضعیت آزمون');
      }
    } catch (e) {
      safeLog('toggle error', { id, message: e.message });
      setError('خطا در ارتباط با سرور');
    }
  };

const getGradeName = (exam) => {
  // اگر exam دارای اطلاعات grade است
  if (exam.grade_name) {
    return `پایه ${exam.grade_name}`;
  }
  // اگر فقط grade_id دارد
  if (exam.grade_id) {
    const grade = grades.find(g => g.id === Number(exam.grade_id));
    return grade ? `پایه ${grade.grade_name}` : `شناسه: ${exam.grade_id}`;
  }
  // fallback
  return 'نامشخص';
};

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      case 'quiz': return <Target className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال دریافت آزمون‌ها...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 md:w-24 md:h-24 bg-white/10 rounded-full translate-y-8 md:translate-y-12 -translate-x-8 md:-translate-x-12"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">مدیریت آزمون‌ها 📝</h1>
                <p className="text-green-100 text-xs md:text-base">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'} - ایجاد و مدیریت آزمون‌های کلاس
                </p>
              </div>
            </div>
            <button
              onClick={() => { 
                setShowForm(s => !s); 
                setError(''); 
                setSuccess(false); 
                if (!showForm) setForm(initialForm);
              }}
              className={`
                px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold text-xs md:text-sm transition-all duration-200 flex items-center gap-2
                ${showForm 
                  ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30' 
                  : 'bg-white text-green-600 shadow-md hover:shadow-lg hover:scale-105'
                }
              `}
            >
              {showForm ? (
                <>
                  <XCircle className="w-4 h-4" />
                  لغو
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  آزمون جدید
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{exams.length}</p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">کل آزمون‌ها</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">
              {exams.filter(e => e.is_active).length}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">آزمون فعال</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-white rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Users className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{grades.length}</p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">پایه‌ها</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl p-3 md:p-4 border border-green-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
          </div>
          <div>
            <p className="text-lg md:text-2xl font-bold text-gray-800">
              {exams.filter(e => e.type === 'quiz').length}
            </p>
            <p className="text-xs md:text-sm text-gray-600 font-medium">آزمون تستی</p>
          </div>
        </div>
      </div>

      {/* پیام‌های اعلان */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 ml-2" />
            <div className="text-green-600 text-sm font-medium">
              آزمون با موفقیت ثبت شد ✓
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 ml-2" />
            <div className="text-red-700 text-sm font-medium">
              {error}
            </div>
          </div>
        </div>
      )}

      {/* فرم ایجاد آزمون */}
      {showForm && (
        <div className="bg-white rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border border-gray-100">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Plus className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
              ایجاد آزمون جدید
            </h2>
            <p className="text-gray-600 text-xs md:text-sm mt-1">فیلدهای ضروری را تکمیل کنید</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  عنوان آزمون
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                  placeholder="مثال: آزمون ریاضی فصل اول"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  نوع آزمون
                </label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                >
                  <option value="pdf">فایل PDF</option>
                  <option value="image">تصویر</option>
                  <option value="quiz">تست چهار گزینه‌ای</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  پایه تحصیلی
                </label>
                <select
                  name="grade_id"
                  value={form.grade_id || ''}
                  onChange={e => setForm({...form, grade_id: Number(e.target.value)})}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors text-sm md:text-base"
                  required
                >
                  <option value="">انتخاب پایه</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      پایه {grade.grade_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>


            {form.type === 'pdf' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  آپلود فایل PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={e => handleFileUpload(e.target.files[0], 'pdf')}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 text-sm md:text-base"
                />
                {form.pdf_url && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      فایل PDF با موفقیت آپلود شد
                    </p>
                    <a 
                      href={makeFileUrl(form.pdf_url, 'inline')}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <FileText className="w-4 h-4" />
                      مشاهده فایل آپلود شده
                    </a>
                  </div>
                )}
              </div>
            )}

            {form.type === 'image' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  آپلود تصویر
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleFileUpload(e.target.files[0], 'image')}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg file:ml-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 text-sm md:text-base"
                />
                {form.image_url && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-600 flex items-center gap-2 mb-3">
                      <CheckCircle className="w-4 h-4" />
                      تصویر با موفقیت آپلود شد
                    </p>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={makeFileUrl(form.image_url)}
                        alt="Preview" 
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.parentElement.querySelector('.image-error');
                          if (errorDiv) errorDiv.style.display = 'block';
                        }}
                      />
                      <div className="image-error hidden p-4 text-center text-gray-500 text-sm">
                        خطا در نمایش تصویر
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {uploading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <div className="text-gray-600 mb-2">در حال آپلود...</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            )}

            {form.type === 'quiz' && (
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base md:text-lg font-medium text-gray-800 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    سوالات تست
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddQuizQuestion}
                    className="px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs md:text-sm font-medium flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن سوال
                  </button>
                </div>

                <div className="space-y-4">
                  {form.questions.map((q, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-4 md:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-gray-700">
                          سوال {idx + 1}
                        </span>
                        {form.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuizQuestion(idx)}
                            className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <input
                          value={q.question}
                          onChange={e => handleQuizQuestionChange(idx, 'question', e.target.value)}
                          placeholder="متن سوال"
                          className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
                          required
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt, oIdx) => (
                            <input
                              key={oIdx}
                              value={opt}
                              onChange={e => handleQuizQuestionChange(idx, `option${oIdx}`, e.target.value)}
                              placeholder={`گزینه ${oIdx + 1}`}
                              className="px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm md:text-base"
                              required
                            />
                          ))}
                        </div>

                        <div className="flex items-center space-x-4 space-x-reverse">
                          <label className="text-sm font-medium text-gray-700">
                            پاسخ صحیح:
                          </label>
                          <select
                            value={q.answer}
                            onChange={e => handleQuizQuestionChange(idx, 'answer', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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

            <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                className="px-6 md:px-8 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-sm md:text-base flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                ثبت آزمون
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(initialForm); }}
                className="px-4 md:px-6 py-2 md:py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm md:text-base"
              >
                انصراف
              </button>
            </div>
          </form>
        </div>
      )}

      {/* جدول آزمون‌ها */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100">
        <div className="border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                لیست آزمون‌ها
              </h2>
              <p className="text-gray-600 text-xs md:text-sm mt-1">
                {exams.length} آزمون ثبت شده
              </p>
            </div>
            <button
              onClick={fetchExams}
              className="p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {exams.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <div className="text-gray-400 mb-4">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                هیچ آزمونی یافت نشد
              </h3>
              <p className="text-gray-600 mb-6 text-sm md:text-base">
                برای شروع اولین آزمون خود را ایجاد کنید
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2 mx-auto"
              >
                <Plus className="w-4 h-4" />
                ایجاد آزمون
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-right text-xs md:text-sm font-medium text-gray-700">
                    عنوان
                  </th>
                  <th className="px-2 md:px-4 py-3 md:py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    نوع
                  </th>
                  <th className="px-2 md:px-4 py-3 md:py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    کلاس
                  </th>
                  <th className="px-2 md:px-4 py-3 md:py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    وضعیت
                  </th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center text-xs md:text-sm font-medium text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map((exam, index) => (
                  <tr key={exam.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 md:px-6 py-4 md:py-6">
                      <div>
                        <div className="text-xs md:text-sm font-medium text-gray-900">
                          {exam.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {exam.description || 'بدون توضیحات'}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center">
                      <span className={`
                        inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium
                        ${exam.type === 'pdf' ? 'bg-blue-100 text-blue-800' : 
                          exam.type === 'image' ? 'bg-purple-100 text-purple-800' : 
                          'bg-green-100 text-green-800'}
                      `}>
                        {getTypeIcon(exam.type)}
                        {exam.type === 'pdf' ? 'PDF' : exam.type === 'image' ? 'تصویر' : 'تست'}
                      </span>
                    </td>
                    
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center">
                      <span className="text-xs md:text-sm text-gray-700">
                        {getGradeName(exam)}
                      </span>
                    </td>
                    
                    <td className="px-2 md:px-4 py-4 md:py-6 text-center">
                      <button
                        onClick={() => handleToggleActive(exam.id, exam.is_active)}
                        className={`
                          inline-flex items-center gap-1 px-2 md:px-3 py-1 rounded-full text-xs font-medium transition-colors
                          ${exam.is_active 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                      >
                        {exam.is_active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {exam.is_active ? 'فعال' : 'غیرفعال'}
                      </button>
                    </td>
                    
                    <td className="px-4 md:px-6 py-4 md:py-6">
                      <div className="flex items-center justify-center space-x-1 md:space-x-2">
                        <Link
                          href={`/teacher/exams/${exam.id}`}
                          className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden md:inline">نتایج</span>
                        </Link>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden md:inline">حذف</span>
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
      {/* Toast */}
      {toast.show && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 20,
            left: 20,
            zIndex: 9999,
            background: toast.type === 'success' ? '#059669' : '#dc2626',
            color: '#fff',
            padding: '10px 14px',
            borderRadius: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,.15)',
            minWidth: 220,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          <span>{toast.type === 'success' ? '✅' : '⚠️'}</span>
          <span style={{ fontWeight: 600 }}>{toast.msg}</span>
          <button
            onClick={() => setToast(t => ({ ...t, show: false }))}
            style={{ marginInlineStart: 'auto', background: 'transparent', color: '#fff', fontSize: 18, lineHeight: 1 }}
            aria-label="Close"
            title="بستن"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}