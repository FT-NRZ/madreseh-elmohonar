'use client';
import React, { useState, useEffect } from 'react';
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

  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    image_url: null,
    target_type: 'grade', // grade, specific_student, all_students
    target_grade_id: null,
    target_student_id: null,
    is_important: false,
    reminder_date: '',
  });

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
        // توکن نامعتبر
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      setStudents([]);
      if (process.env.NODE_ENV === 'development') {
        toast.error('خطا در دریافت لیست دانش‌آموزان');
      }
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
        // توکن نامعتبر
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } catch (error) {
      setGrades([]);
      if (process.env.NODE_ENV === 'development') {
        toast.error('خطا در دریافت لیست پایه‌ها');
      }
    }
  };

// دریافت اخبار ایجاد شده توسط معلم
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
          if (process.env.NODE_ENV === 'development') {
            toast.error(data.error || 'خطا در دریافت اخبار');
          }
        }
      } else if (response.status === 401 || response.status === 403) {
        // توکن نامعتبر
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      } else {
        setNews([]);
        toast.error('خطا در دریافت اخبار');
      }
    } catch (error) {
      // حذف console.error - امن شده
      setNews([]);
      if (process.env.NODE_ENV === 'development') {
        toast.error('ارتباط با سرور برقرار نشد');
      }
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
      
      const response = await fetch('/api/teacher/news', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...form,
          author_id: userObj.id
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
    setShowModal(false);
  };

  // آپلود عکس
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/';
        return;
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      
      const data = await response.json();
      if (data.success) {
        setForm({ ...form, image_url: data.url });
        toast.success('عکس با موفقیت آپلود شد');
      } else {
        toast.error('خطا در آپلود عکس');
      }
    } catch (error) {
      toast.error('خطا در آپلود عکس');
    }
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
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
        <div className="relative z-10">
          <div className="flex flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                ایجاد اخبار و یادآوری
              </h2>
              <p className="text-white/90 text-sm md:text-base">ارسال اخبار و یادآوری برای دانش‌آموزان</p>
              <div className="flex items-center gap-2 mt-2 md:mt-3 text-white/80">
                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                <span className="text-xs md:text-sm font-medium">{moment().format('jYYYY/jMM/jDD')}</span>
              </div>
            </div>
            <div className="w-12 h-12 md:w-20 md:h-20 bg-white/20 backdrop-blur-lg rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl">
              <Send className="w-6 h-6 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* آمار سریع */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-100 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.length}</p>
            <p className="text-xs md:text-sm text-gray-600">کل اخبار</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-200 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.target_type === 'grade').length}</p>
            <p className="text-xs md:text-sm text-gray-600">برای پایه</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-300 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.target_type === 'specific_student').length}</p>
            <p className="text-xs md:text-sm text-gray-600">شخصی</p>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-green-400 shadow-lg">
          <div className="text-center">
            <p className="text-lg md:text-2xl font-bold text-green-700">{news.filter(n => n.is_important).length}</p>
            <p className="text-xs md:text-sm text-gray-600">مهم</p>
          </div>
        </div>
      </div>

      {/* فیلترها و دکمه‌ها */}
      <div className="bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <NewspaperIcon className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <h3 className="text-lg md:text-xl font-bold text-gray-800">مدیریت اخبار</h3>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={fetchTeacherNews}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg md:rounded-xl hover:bg-gray-200 transition text-sm md:text-base"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden md:inline">بروزرسانی</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-green-600 text-white rounded-lg md:rounded-xl hover:bg-green-700 transition text-sm md:text-base"
            >
              <Plus className="w-4 h-4" />
              خبر جدید
            </button>
          </div>
        </div>

        {/* جستجو و فیلتر */}
        <div className="mt-4 space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="جستجو در اخبار..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 border border-green-200 rounded-lg md:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50/50 text-sm md:text-base"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filterType === 'all'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              همه
            </button>
            <button
              onClick={() => setFilterType('grade')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filterType === 'grade'
                  ? 'bg-green-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              برای پایه
            </button>
            <button
              onClick={() => setFilterType('student')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filterType === 'student'
                  ? 'bg-green-800 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              شخصی
            </button>
            <button
              onClick={() => setFilterType('important')}
              className={`px-3 md:px-4 py-2 rounded-lg md:rounded-xl font-medium transition-all text-sm md:text-base ${
                filterType === 'important'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              مهم
            </button>
          </div>
        </div>
      </div>

      {/* لیست اخبار */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center py-8 md:py-12">
            <div className="w-8 h-8 md:w-12 md:h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="text-center py-8 md:py-12 bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl border border-green-100">
            <NewspaperIcon className="w-12 h-12 md:w-16 md:h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-600 mb-2">خبری یافت نشد</h3>
            <p className="text-sm md:text-base text-gray-500">هنوز خبری ایجاد نکرده‌اید</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredNews.map((item) => (
              <div
                key={item.id}
                className="group bg-white/95 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-green-100 overflow-hidden hover:scale-[1.02]"
              >
                {/* عکس یا پس‌زمینه */}
                <div className="relative h-32 md:h-48 overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-500 via-green-600 to-green-700 flex items-center justify-center relative">
                      <div className="text-center text-white">
                        <NewspaperIcon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 opacity-80" />
                        <div className="text-xl md:text-3xl font-bold opacity-90">
                          {item.title?.[0] || "خ"}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* برچسب‌ها */}
                  <div className="absolute top-2 md:top-3 right-2 md:right-3 flex flex-col gap-1 md:gap-2">
                    {item.is_important && (
                      <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-700 border border-green-200 backdrop-blur-lg">
                        مهم
                      </span>
                    )}
                    <span className="px-2 md:px-3 py-1 text-xs rounded-full font-semibold bg-green-50 text-green-700 border border-green-200 backdrop-blur-lg">
                      {getTargetText(item)}
                    </span>
                  </div>
                </div>

                {/* محتوا */}
                <div className="p-3 md:p-6">
                  <h3 className="text-sm md:text-lg font-bold text-gray-800 mb-2 md:mb-3 line-clamp-2 group-hover:text-green-700 transition-colors">
                    {item.title}
                  </h3>
                  
                  <p className="text-xs md:text-sm text-gray-600 mb-2 md:mb-4 line-clamp-2 md:line-clamp-3 leading-relaxed">
                    {item.content.substring(0, 100)}
                    {item.content.length > 100 && '...'}
                  </p>

                  {/* تاریخ */}
                  <div className="flex items-center gap-1 md:gap-2 text-xs text-gray-500 mb-2 md:mb-4">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                    <span>ایجاد: {moment(item.created_at).format('jYYYY/jMM/jDD')}</span>
                  </div>

                  {/* دکمه‌های عملیات */}
                  <div className="flex justify-between items-center pt-2 md:pt-4 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex items-center gap-1 px-2 md:px-3 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                      >
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                        ویرایش
                      </button>
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        className="flex items-center gap-1 px-2 md:px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors text-xs md:text-sm font-medium"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* مودال ایجاد/ویرایش */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
              <h2 className="text-lg font-bold text-green-700">
                {form.id ? 'ویرایش خبر' : 'ایجاد خبر جدید'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
              {/* ردیف اول */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عنوان خبر/یادآوری</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                  placeholder="عنوان خبر یا یادآوری"
                  required
                />
              </div>

              {/* نوع مخاطب */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">مخاطب</label>
                  <select
                    value={form.target_type}
                    onChange={(e) => setForm({ ...form, target_type: e.target.value, target_grade_id: null, target_student_id: null })}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                  >
                    <option value="grade">پایه تحصیلی</option>
                    <option value="specific_student">دانش‌آموز خاص</option>
                    <option value="all_students">همه دانش‌آموزان</option>
                  </select>
                </div>

                {/* انتخاب پایه یا دانش‌آموز */}
                {form.target_type === 'grade' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">انتخاب پایه</label>
                    <select
                      value={form.target_grade_id || ''}
                      onChange={(e) => setForm({ ...form, target_grade_id: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
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
                      className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
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

              {/* تاریخ یادآوری */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">تاریخ یادآوری (اختیاری)</label>
                  <input
                    type="date"
                    value={form.reminder_date}
                    onChange={(e) => setForm({ ...form, reminder_date: e.target.value })}
                    className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.is_important}
                      onChange={(e) => setForm({ ...form, is_important: e.target.checked })}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-gray-700 font-bold">خبر مهم</span>
                  </label>
                </div>
              </div>

              {/* آپلود عکس */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">عکس (اختیاری)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="خبر" className="mt-2 w-32 h-32 object-cover rounded-xl border" />
                )}
              </div>

              {/* متن خبر */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">متن خبر/یادآوری</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 border border-green-100 rounded-xl bg-green-50 focus:ring-2 focus:ring-green-400 outline-none transition h-32 resize-none"
                  placeholder="متن کامل خبر یا یادآوری"
                  required
                />
              </div>

              {/* دکمه‌ها */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white shadow hover:scale-105 transition font-bold"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center px-6 py-5 bg-gradient-to-r from-green-100 to-green-50 border-b border-green-100">
              <h2 className="text-lg font-bold text-green-700">حذف خبر</h2>
              <button onClick={() => setShowDeleteModal(false)} className="p-2 rounded-full bg-green-50 hover:bg-green-200 transition">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <p className="text-gray-700">آیا مطمئن هستید می‌خواهید این خبر را حذف کنید؟</p>
              <p className="text-sm text-green-600">این عمل غیرقابل بازگشت است.</p>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 shadow hover:bg-gray-200 transition"
                >
                  انصراف
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl text-white font-bold shadow hover:scale-105 transition"
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