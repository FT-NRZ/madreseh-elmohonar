'use client';
import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import {
  Plus, Edit, Trash2, X, Calendar, Clock, Users, User, 
  AlertTriangle, CheckCircle, Eye, FileText, Upload,
  RefreshCw, Filter, Search, Bell, Target, Send,
  Sparkles, NewspaperIcon, GraduationCap
} from 'lucide-react';
import moment from 'jalali-moment';

export default function Reminders({ teacherId }) {
  const [news, setNews] = useState([]);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedNewsId, setSelectedNewsId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [reminderDateText, setReminderDateText] = useState('');

  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    image_url: null,
    target_type: 'grade',
    target_grade_id: null,
    target_student_id: null,
    is_important: false,
    reminder_date: '',
  });

  const buildImageUrl = (url) => {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) {
      const name = url.split('/').pop()?.split('?')[0] || 'reminder-image';
      return `/api/files/download?path=${encodeURIComponent(url)}&disposition=inline&name=${encodeURIComponent(name)}`;
    }
    return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${url}`;
  };

  // دریافت لیست دانش‌آموزان
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/student', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStudents(data.students || []);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      setStudents([]);
    }
  };

  // دریافت لیست پایه‌ها
  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/grades', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setGrades(data.grades || []);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      setGrades([]);
    }
  };

  // دریافت اخبار
  const fetchTeacherNews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        window.location.href = '/';
        return;
      }

      const userObj = JSON.parse(userData);
      
      const response = await fetch(`/api/teacher/news?teacherId=${userObj.id}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNews(data.news || []);
        } else {
          setNews([]);
        }
      } else if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        setNews([]);
      }
    } catch (error) {
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchGrades();
    fetchTeacherNews();
  }, [teacherId]);

  // ارسال فرم
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        window.location.href = '/';
        return;
      }

      const userObj = JSON.parse(userData);
      const method = form.id ? 'PUT' : 'POST';
      const normalizedReminderDate = reminderDateText
        .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
      const parsedReminderDate = reminderDateText
        ? moment(normalizedReminderDate, 'jYYYY/jMM/jDD', true)
        : null;

      if (reminderDateText && !parsedReminderDate.isValid()) {
        toast.error('تاریخ را به شکل سال/ماه/روز شمسی وارد کنید');
        return;
      }
      
      const response = await fetch('/api/teacher/news', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          author_id: userObj.id,
          reminder_date: parsedReminderDate?.format('YYYY-MM-DD') || null
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        resetForm();
        fetchTeacherNews();
        toast.success('خبر با موفقیت ثبت شد');
      } else {
        toast.error(data.error || 'خطا در ذخیره خبر');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  // ویرایش خبر
  const handleEdit = (item) => {
    setForm({
      id: item.id,
      title: item.title,
      content: item.content,
      image_url: item.image_url || null,
      target_type: item.target_type,
      target_grade_id: item.target_grade_id || null,
      target_student_id: item.target_student_id || null,
      is_important: item.is_important,
      reminder_date: item.reminder_date ? item.reminder_date.split('T')[0] : '',
    });
    setReminderDateText(item.reminder_date ? moment(item.reminder_date).format('jYYYY/jMM/jDD') : '');
    setShowModal(true);
  };

  // حذف خبر
  const handleDeleteClick = (id) => {
    setSelectedNewsId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch(`/api/teacher/news?id=${selectedNewsId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        fetchTeacherNews();
        setShowDeleteModal(false);
        toast.success('خبر حذف شد');
      } else {
        toast.error(data.error || 'خطا در حذف خبر');
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور');
    }
  };

  // ریست فرم
  const resetForm = () => {
    setForm({
      id: null,
      title: '',
      content: '',
      image_url: null,
      target_type: 'grade',
      target_grade_id: null,
      target_student_id: null,
      is_important: false,
      reminder_date: '',
    });
    setReminderDateText('');
    setShowModal(false);
  };

  // آپلود عکس - کاملاً درست
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم عکس نباید بیشتر از 5MB باشد');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('فقط فایل‌های تصویری مجاز هستند');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'teacher-news'); // فولدر مخصوص اخبار معلم
    
    setUploadingImage(true);
    
    try {
      // 🔥 تغییر: مستقیماً به storage/upload می‌ریم (بدون احراز هویت)
      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success && data.url) {
        setForm(prev => ({ ...prev, image_url: data.url }));
        toast.success('عکس با موفقیت آپلود شد');
        console.log('✅ Upload successful:', data.url);
      } else {
        console.error('❌ Upload failed:', data);
        toast.error(data.error || 'خطا در آپلود عکس');
      }
    } catch (error) {
      console.error('💥 Upload error:', error);
      toast.error('خطا در آپلود عکس: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // حذف عکس
  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image_url: null }));
  };

  // فیلتر اخبار
  const filteredNews = news.filter(item => {
    const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.content?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'grade') return item.target_type === 'grade' && matchesSearch;
    if (filterType === 'student') return item.target_type === 'specific_student' && matchesSearch;
    if (filterType === 'important') return item.is_important && matchesSearch;
    return matchesSearch;
  });

  const getTargetText = (item) => {
    if (item.target_type === 'grade') {
      const grade = grades.find(g => g.id === item.target_grade_id);
      return grade ? `پایه ${grade.grade_name}` : 'پایه نامشخص';
    } else if (item.target_type === 'specific_student') {
      const student = students.find(s => s.id === item.target_student_id);
      return student ? `${student.users?.first_name} ${student.users?.last_name}` : 'دانش‌آموز نامشخص';
    } else if (item.target_type === 'all_students') {
      return 'همه دانش‌آموزان';
    }
    return 'نامشخص';
  };

  return (
    <div className="space-y-4 mb-10 md:space-y-6">     
      {/* Header */}
      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">ایجاد اخبار و یادآوری</h2>
              <p className="text-white/90 text-sm md:text-base">ارسال اخبار و یادآوری برای دانش‌آموزان</p>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
              <Send className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.length}</p>
            <p className="text-xs md:text-sm text-gray-600">کل اخبار</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.target_type === 'grade').length}</p>
            <p className="text-xs md:text-sm text-gray-600">برای پایه</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.target_type === 'specific_student').length}</p>
            <p className="text-xs md:text-sm text-gray-600">شخصی</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.is_important).length}</p>
            <p className="text-xs md:text-sm text-gray-600">مهم</p>
          </div>
        </div>
      </div>

      {/* فیلترها و دکمه‌ها */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <NewspaperIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h3 className="text-base md:text-lg font-bold text-gray-800">مدیریت اخبار</h3>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchTeacherNews}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">بروزرسانی</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white rounded-lg hover:shadow-lg transition text-sm"
            >
              <Plus className="w-4 h-4" />
              خبر جدید
            </button>
          </div>
        </div>

        {/* جستجو و فیلتر */}
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجو در اخبار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50 text-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'grade', 'student', 'important'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                  filterType === type
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'همه' : type === 'grade' ? 'برای پایه' : type === 'student' ? 'شخصی' : 'مهم'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* لیست اخبار */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
            <NewspaperIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">خبری یافت نشد</h3>
            <p className="text-sm text-gray-500">هنوز خبری ایجاد نکرده‌اید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredNews.map((item) => (
              <div key={item.id} className="group bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="relative h-40 md:h-48 overflow-hidden bg-gray-100">
                  {item.image_url && (
                    <img
                      src={buildImageUrl(item.image_url)}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  
                  {/* Fallback برای عکس */}
                  <div 
                    className="w-full h-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center"
                    style={{ display: item.image_url ? 'none' : 'flex' }}
                  >
                    <div className="text-center text-white">
                      <NewspaperIcon className="w-12 h-12 mx-auto mb-2 opacity-80" />
                      <div className="text-2xl font-bold opacity-90">
                        {item.title?.[0] || "خ"}
                      </div>
                    </div>
                  </div>
                  
                  {/* برچسب‌ها */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {item.is_important && (
                      <span className="px-2 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-700 border border-red-200">
                        مهم
                      </span>
                    )}
                    <span className="px-2 py-1 text-xs rounded-full font-semibold bg-white/90 text-gray-700 border border-gray-200">
                      {getTargetText(item)}
                    </span>
                  </div>
                </div>

                {/* محتوا */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 && '...'}
                  </p>

                  {/* تاریخ */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                    <Calendar className="w-3 h-3" />
                    <span>{moment(item.created_at).format('jYYYY/jMM/jDD')}</span>
                  </div>

                  {/* دکمه‌ها */}
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteClick(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال ایجاد/ویرایش */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-green-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {form.id ? 'ویرایش خبر' : 'ایجاد خبر جدید'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-6">
              {/* عنوان */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان خبر/یادآوری</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="عنوان خبر یا یادآوری"
                  required
                />
              </div>

              {/* مخاطب */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">مخاطب</label>
                  <select
                    value={form.target_type}
                    onChange={(e) => setForm({ ...form, target_type: e.target.value, target_grade_id: null, target_student_id: null })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="grade">پایه تحصیلی</option>
                    <option value="specific_student">دانش‌آموز خاص</option>
                    <option value="all_students">همه دانش‌آموزان</option>
                  </select>
                </div>

                {form.target_type === 'grade' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب پایه</label>
                    <select
                      value={form.target_grade_id || ''}
                      onChange={(e) => setForm({ ...form, target_grade_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    >
                      <option value="">انتخاب کنید...</option>
                      {grades.map(grade => (
                        <option key={grade.id} value={grade.id}>
                          پایه {grade.grade_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {form.target_type === 'specific_student' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب دانش‌آموز</label>
                    <select
                      value={form.target_student_id || ''}
                      onChange={(e) => setForm({ ...form, target_student_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    >
                      <option value="">انتخاب کنید...</option>
                      {students.map(student => (
                        <option key={student.id} value={student.id}>
                          {student.users?.first_name} {student.users?.last_name} - {student.student_number}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* تاریخ و چک‌باکس */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاریخ یادآوری (اختیاری)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="۱۴۰۵/۰۱/۰۱"
                    value={reminderDateText}
                    onChange={(e) => setReminderDateText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_important}
                      onChange={(e) => setForm({ ...form, is_important: e.target.checked })}
                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-sm font-bold text-gray-700">خبر مهم</span>
                  </label>
                </div>
              </div>

              {/* آپلود عکس */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عکس (اختیاری)</label>
                
                {form.image_url ? (
                  <div className="relative">
                    <img 
                      src={buildImageUrl(form.image_url)}
                      alt="پیش‌نمایش" 
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 left-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                    />
                    {uploadingImage && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">فرمت‌های مجاز: JPG, PNG, GIF - حداکثر 5MB</p>
              </div>

              {/* متن */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">متن خبر/یادآوری</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none h-32 resize-none"
                  placeholder="متن کامل خبر یا یادآوری"
                  required
                />
              </div>

              {/* دکمه‌ها */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="px-6 py-2 bg-gradient-to-r from-green-400 via-green-500 to-green-600 rounded-lg text-white hover:shadow-lg transition font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {form.id ? 'ویرایش خبر' : 'ارسال خبر'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال حذف */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 bg-gradient-to-r from-red-50 to-white border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">حذف خبر</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-gray-700">آیا مطمئن هستید می‌خواهید این خبر را حذف کنید؟</p>
              <p className="text-sm text-red-600">این عمل غیرقابل بازگشت است.</p>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 rounded-lg text-white font-bold hover:bg-red-700 transition"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}