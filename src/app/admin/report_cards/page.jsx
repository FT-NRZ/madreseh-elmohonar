'use client';

import { useState, useEffect } from 'react';
import { 
  Book, Plus, X, Save, Edit, Trash2, Loader2, Users, GraduationCap, 
  BarChart3, Settings, LogOut, Calendar, Image, CalendarCheck,
  FileText, Shield, Menu, Target, LayoutGrid, GalleryHorizontalEnd,
  ChevronDown, ChevronUp, UserPlus, NewspaperIcon, Sparkles, Filter,
  BookOpen,
  Calendar1Icon,
  GalleryHorizontal
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const sidebarMenu = [
  { label: 'داشبورد', icon: LayoutGrid, href: '/admin/dashboard' },
  { label: 'مدیریت کاربران', icon: Users, href: '/admin/users' },
  { label: 'مدیریت کلاس‌ها', icon: GraduationCap, href: '/admin/classes' },
  { label: 'برنامه هفتگی', icon: Calendar1Icon, href: '/admin/weekly_schedule' },
  { label: 'برنامه غذایی', icon: GalleryHorizontalEnd, href: '/admin/food-schedule' },
  { label: 'حضور و غیاب', icon: CalendarCheck, href: '/admin/attendances' },
  { label: 'مدیریت گالری', icon: GalleryHorizontal, href: '/admin/gallery' },
  { label: 'مدیریت کارنامه ها', icon: BookOpen, href: '/admin/report_cards' },
  { label: 'مدیریت اخبار', icon: NewspaperIcon, href: '/admin/news' },
  { label: 'مدیریت بخشنامه ها', icon: FileText, href: '/admin/circular' },
  { label: 'پیش‌ثبت‌نام', icon: UserPlus, href: '/admin/pre-registrations' },
  { label: 'توبیخی و تشویقی', icon: Shield, href: '/admin/disciplinary' },
];

export default function ReportCardsPage() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [workshops, setWorkshops] = useState([]); // 🔥 اضافه شده
  const [selectedGrade, setSelectedGrade] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([{ 
    id: Date.now(), 
    name: '', 
    grade: '', 
    type: 'main', // 🔥 اضافه شده - 'main' یا 'workshop'
    workshopId: '' // 🔥 اضافه شده
  }]);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentReports, setStudentReports] = useState({});
  const [semester, setSemester] = useState('first'); 
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [userStats, setUserStats] = useState({
    students: 0,
    teachers: 0,
    admins: 0,
    total: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5; // تعداد دانش‌آموز در هر صفحه

  const filteredStudentsForDisplay = (filterGrade 
    ? allStudents.filter(student => student.grade_id === parseInt(filterGrade))
    : allStudents
  ).filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudentsForDisplay.length / studentsPerPage);
  const pagedStudents = filteredStudentsForDisplay.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage
  );


  const gradeOptions = [
    { value: 'A', label: 'عالی' },
    { value: 'B', label: 'خیلی خوب' }, 
    { value: 'C', label: 'خوب' },
    { value: 'D', label: 'نیاز به تلاش بیشتر' }
  ];

  useEffect(() => {
    const token = localStorage?.getItem?.('token');
    const userData = localStorage?.getItem?.('user');
    if (!token || !userData) {
      window.location.href = '/login';
      return;
    }
    try {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        window.location.href = '/dashboard';
        return;
      }
      setUser(parsedUser);
      fetchGrades();
      fetchStudents();
      fetchWorkshops(); // 🔥 اضافه شده
      fetchUserStats();
    } catch (error) {
      window.location.href = '/login';
    }
  }, []);

  // 🔥 تابع جدید برای دریافت کارگاه‌ها
  const fetchWorkshops = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/workshops', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWorkshops(data.workshops);
      }
    } catch (error) {
      console.error('Error fetching workshops:', error);
    }
  };

  // فیلتر کردن دانش‌آموزان بر اساس پایه انتخاب شده برای فرم
  useEffect(() => {
    if (selectedGrade && allStudents.length > 0) {
      const filteredStudents = allStudents.filter(student => 
        student.grade_id === parseInt(selectedGrade)
      );
      setStudents(filteredStudents);
    } else {
      setStudents(allStudents);
    }
    setSelectedStudent(null);
  }, [selectedGrade, allStudents]);

  // فیلتر کردن برای نمایش لیست
  const fetchGrades = async () => {
    try {
      const res = await fetch('/api/grades');
      const data = await res.json();
      if (data.success) {
        setGrades(data.grades);
      }
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const getGradeLabel = (gradeValue) => {
    const grade = gradeOptions.find(g => g.value === gradeValue);
    return grade ? grade.label : gradeValue;
  };

  const getSemesterLabel = (semesterValue) => {
    switch(semesterValue) {
      case 'first':
        return 'نیمسال اول';
      case 'second':
        return 'نیمسال دوم';
      default:
        return semesterValue;
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage?.getItem?.('token');
      const response = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUserStats(data.userStats || { students: 0, teachers: 0, admins: 0, total: 0 });
      } else {
        setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
      }
    } catch {
      setUserStats({ students: 25, teachers: 8, admins: 2, total: 35 });
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/users/list?role=students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      if (data.success) {
        const studentsWithGrades = await Promise.all(
          data.users.map(async (student) => {
            try {
              const studentRes = await fetch(`/api/student/${student.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const studentData = await studentRes.json();
              return {
                ...student,
                grade_id: studentData.student?.class?.grade_id || null,
                grade_name: studentData.student?.class?.grade?.name || 'نامشخص',
                class_name: studentData.student?.class?.name || 'نامشخص'
              };
            } catch {
              return {
                ...student,
                grade_id: null,
                grade_name: 'نامشخص',
                class_name: 'نامشخص'
              };
            }
          })
        );
        
        setAllStudents(studentsWithGrades);
        setStudents(studentsWithGrades);
      } else {
        toast.error(data.message || 'خطا در دریافت لیست دانش‌آموزان');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('خطا در دریافت لیست دانش‌آموزان');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { 
      id: Date.now(), 
      name: '', 
      grade: '', 
      type: 'main', // 🔥 پیش‌فرض دروس اصلی
      workshopId: ''
    }]);
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // 🔥 تابع آپدیت شده برای به‌روزرسانی درس
  const updateSubject = (id, field, value) => {
    setSubjects(subjects.map(s => {
      if (s.id === id) {
        const updated = { ...s, [field]: value };
        // اگر نوع درس تغییر کرد، فیلدهای مربوطه رو پاک کن
        if (field === 'type') {
          if (value === 'main') {
            updated.workshopId = '';
          } else {
            updated.name = '';
          }
        }
        return updated;
      }
      return s;
    }));
  };

  // 🔥 تابع جدید برای تعیین نام نهایی درس
  const getFinalSubjectName = (subject) => {
    if (subject.type === 'workshop' && subject.workshopId) {
      const workshop = workshops.find(w => w.id === parseInt(subject.workshopId));
      return workshop ? `کارگاه ${workshop.workshop_name}` : '';
    }
    return subject.name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedStudent) {
      return toast.error('لطفاً دانش‌آموز را انتخاب کنید');
    }

    // 🔥 بررسی اعتبار سنجی برای هر نوع درس
    const invalidSubjects = subjects.filter(s => {
      if (!s.grade) return true;
      
      if (s.type === 'main') {
        return !s.name.trim();
      } else {
        return !s.workshopId;
      }
    });

    if (invalidSubjects.length > 0) {
      return toast.error('لطفاً نام و نمره همه دروس را وارد کنید');
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/report_cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          subjects: subjects.map(s => ({
            name: getFinalSubjectName(s), // 🔥 استفاده از نام نهایی
            grade: s.grade
          })),
          semester,
          academic_year: academicYear
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('کارنامه با موفقیت ثبت شد');
        setSubjects([{ 
          id: Date.now(), 
          name: '', 
          grade: '', 
          type: 'main',
          workshopId: ''
        }]);
        setSelectedStudent(null);
        
        if (expandedStudent === selectedStudent.id) {
          await fetchStudentReportCards(selectedStudent.id);
        }
      } else {
        toast.error(data.message || 'خطا در ثبت کارنامه');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (report) => {
    setEditingReport(report.id);
    setEditSubject(report.subject);
    setEditGrade(report.grade);
  };

  const handleSaveEdit = async (reportId) => {
    if (!editSubject || !editGrade) {
      toast.error('لطفاً همه فیلدها را پر کنید');
      return;
    }

    try {
      const loadingToast = toast.loading('در حال ویرایش...');
      
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/report_cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: reportId,
          subject: editSubject,
          grade: editGrade
        })
      });

      const data = await res.json();
      
      toast.dismiss(loadingToast);

      if (data.success) {
        toast.success('درس با موفقیت ویرایش شد');
        setEditingReport(null);
        setEditSubject('');
        setEditGrade('');
        
        if (expandedStudent) {
          await fetchStudentReportCards(expandedStudent);
        }
      } else {
        toast.error(data.message || 'خطا در ویرایش');
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('خطا در ارتباط با سرور');
    }
  };

  const handleCancelEdit = () => {
    setEditingReport(null);
    setEditSubject('');
    setEditGrade('');
  };

  const handleDelete = async (reportId) => {
    const confirmDelete = () => new Promise((resolve) => {
      const toastId = toast(
        (t) => (
          <div className="flex flex-col gap-3 p-2">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              <span className="font-semibold text-gray-800">حذف درس</span>
            </div>
            <p className="text-gray-600 text-sm">آیا از حذف این درس مطمئن هستید؟</p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                لغو
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                حذف
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
          style: {
            background: 'white',
            color: 'black',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '8px',
            minWidth: '320px'
          }
        }
      );
    });

    try {
      const confirmed = await confirmDelete();
      if (!confirmed) return;
      
      const loadingToast = toast.loading('در حال حذف...', {
        style: {
          background: '#fef3c7',
          color: '#92400e',
          border: '1px solid #f59e0b'
        }
      });
      
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/report_cards?id=${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await res.json();
      
      toast.dismiss(loadingToast);
      
      if (data.success) {
        toast.success('درس با موفقیت حذف شد', {
          style: {
            background: '#d1fae5',
            color: '#065f46',
            border: '1px solid #10b981'
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#d1fae5'
          }
        });
        
        if (expandedStudent) {
          await fetchStudentReportCards(expandedStudent);
        }
      } else {
        toast.error(data.message || 'خطا در حذف', {
          style: {
            background: '#fee2e2',
            color: '#991b1b',
            border: '1px solid #ef4444'
          }
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('خطا در ارتباط با سرور', {
        style: {
          background: '#fee2e2',
          color: '#991b1b',
          border: '1px solid #ef4444'
        }
      });
    }
  };

  const fetchStudentReportCards = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/report-cards/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setStudentReports(prev => ({ ...prev, [studentId]: data.reportCards }));
      }
    } catch (error) {
      console.error('Error fetching report cards:', error);
      toast.error('خطا در دریافت کارنامه');
    }
  };

  const toggleStudentExpansion = async (studentId) => {
    if (expandedStudent === studentId) {
      setExpandedStudent(null);
    } else {
      setExpandedStudent(studentId);
      if (!studentReports[studentId]) {
        await fetchStudentReportCards(studentId);
      }
    }
  };

  const logout = () => {
    localStorage?.removeItem?.('token');
    localStorage?.removeItem?.('user');
    window.location.href = '/';
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

 return (
    <div className="min-h-screen bg-gradient-to-br mb-10 from-green-50 to-white">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }
        }}
      />

      <div className="flex flex-col sm:flex-row">
        {/* Main Content */}
        <main className="flex-1 pb-16 sm:pb-0 p-2 sm:p-6 space-y-3 sm:space-y-8 mt-2 sm:mt-0 max-w-6xl mx-auto">
          {/* Welcome Card */}
          <div className="relative bg-gradient-to-r from-green-600 via-green-500 to-green-600 rounded-2xl sm:rounded-3xl p-3 sm:p-8 text-white shadow-2xl overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-64 sm:h-64 bg-white/10 rounded-full -translate-y-10 translate-x-10 sm:-translate-y-32 sm:translate-x-32"></div>
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-4">
                <div>
                  <h2 className="text-lg sm:text-4xl font-bold mb-1 sm:mb-3 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent">
                    مدیریت کارنامه‌ها 📚
                  </h2>
                  <p className="text-white/90 mb-2 sm:mb-6 text-xs sm:text-lg">ثبت و مشاهده کارنامه‌های دانش‌آموزان</p>
                  <div className="flex items-center gap-1 sm:gap-6 text-white/80">
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-lg rounded-xl px-2 py-1 sm:px-4 sm:py-2">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs sm:text-sm font-medium">{new Date().toLocaleDateString('fa-IR')}</span>
                    </div>
                  </div>
                </div>
                <div className="w-14 hidden h-14 sm:w-32 sm:h-32 bg-white/20 backdrop-blur-lg rounded-2xl sm:rounded-3xl md:flex items-center justify-center shadow-2xl">
                  <Book className="w-8 h-8 sm:w-16 sm:h-16 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-6">
            <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-green-200 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 backdrop-blur-lg">
              <div className="flex items-center justify-between mb-2 sm:mb-6">
                <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-r from-green-600 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-4 h-4 sm:w-7 sm:h-7 text-white" />
                </div>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-4xl font-bold text-gray-800 mb-0.5 sm:mb-2">{allStudents.length}</p>
                <p className="text-xs sm:text-base text-gray-600 font-medium">دانش‌آموزان</p>
              </div>
            </div>
          </div>

          {/* فرم ثبت کارنامه */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl p-4 md:p-6 border border-green-200 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center ml-2 sm:ml-3">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">ثبت کارنامه جدید</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* انتخاب پایه تحصیلی */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">انتخاب پایه تحصیلی</label>
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="w-full p-2 sm:p-3 border border-green-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 backdrop-blur-lg transition-all duration-300"
                >
                  <option value="">همه پایه‌ها</option>
                  {grades.map(grade => (
                    <option key={grade.id} value={grade.id}>
                      {grade.grade_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* انتخاب دانش‌آموز */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  انتخاب دانش‌آموز 
                  {selectedGrade && (
                    <span className="text-green-600 text-xs">
                      ({students.length} دانش‌آموز)
                    </span>
                  )}
                </label>
                <select
                  value={selectedStudent?.id || ''}
                  onChange={(e) => setSelectedStudent(students.find(s => s.id === parseInt(e.target.value)))}
                  className="w-full p-2 sm:p-3 border border-green-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50 backdrop-blur-lg transition-all duration-300"
                >
                  <option value="">انتخاب کنید</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.grade_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* نیمسال و سال تحصیلی */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نیمسال</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-green-50"
                  >
                    <option value="first">نیمسال اول</option>
                    <option value="second">نیمسال دوم</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سال تحصیلی</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2 sm:p-3 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 bg-green-50"
                    placeholder="1403"
                  />
                </div>
              </div>

              {/* دروس و نمرات */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-gray-700">دروس و نمرات</label>
                  <button
                    type="button"
                    onClick={addSubject}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition"
                  >
                    <Plus className="w-4 h-4" />
                    افزودن درس
                  </button>
                </div>

                <div className="space-y-4">
                  {subjects.map((subject, index) => (
                    <div key={subject.id} className="p-4 bg-green-50 rounded-xl border border-green-100">
                      {/* 🔥 انتخاب نوع درس */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => updateSubject(subject.id, 'type', 'main')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            subject.type === 'main'
                              ? 'border-green-500 bg-green-100 text-green-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <Book className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">دروس اصلی</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateSubject(subject.id, 'type', 'workshop')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            subject.type === 'workshop'
                              ? 'border-purple-500 bg-purple-100 text-purple-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          <Settings className="w-5 h-5 mx-auto mb-1" />
                          <span className="text-sm font-medium">دروس کارگاهی</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 🔥 فیلد نام درس / انتخاب کارگاه */}
                        <div className="flex-1">
                          {subject.type === 'main' ? (
                            <input
                              type="text"
                              placeholder={`نام درس ${index + 1}`}
                              value={subject.name}
                              onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                              className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                          ) : (
                            <select
                              value={subject.workshopId}
                              onChange={(e) => updateSubject(subject.id, 'workshopId', e.target.value)}
                              className="w-full p-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                            >
                              <option value="">انتخاب کارگاه</option>
                              {workshops.map(workshop => (
                                <option key={workshop.id} value={workshop.id}>
                                  {workshop.workshop_name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        {/* نمره */}
                        <div className="flex-1">
                          <select
                            value={subject.grade}
                            onChange={(e) => updateSubject(subject.id, 'grade', e.target.value)}
                            className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
                          >
                            <option value="">انتخاب نمره</option>
                            {gradeOptions.map(grade => (
                              <option key={grade.value} value={grade.value}>{grade.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {/* حذف */}
                        <div className="flex justify-center items-center">
                          <button
                            type="button"
                            onClick={() => removeSubject(subject.id)}
                            className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full transition"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* 🔥 نمایش نام نهایی درس */}
                      {getFinalSubjectName(subject) && (
                        <div className="mt-2 p-2 bg-white rounded-lg border border-green-200">
                          <span className="text-sm text-gray-600">نام درس: </span>
                          <span className="text-sm font-medium text-green-700">
                            {getFinalSubjectName(subject)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-3 rounded-xl sm:rounded-2xl hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 disabled:opacity-50 font-semibold"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  ثبت کارنامه
                </button>
              </div>
            </form>
          </div>

          {/* لیست دانش‌آموزان و کارنامه‌ها */}
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-green-200">
            <div className="p-4 sm:p-6 border-b border-green-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 flex items-center">
                  <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl flex items-center justify-center ml-2 sm:ml-3">
                    <Book className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  مشاهده کارنامه‌ها
                </h3>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 mt-2">
                  {/* جستجو */}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    placeholder="جستجوی نام دانش‌آموز..."
                    className="p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 text-sm bg-green-50 w-full sm:w-64"
                  />
                  {/* صفحه‌بندی */}
                  <div className="flex gap-2 items-center mt-2 sm:mt-0">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-lg bg-green-100 text-green-700 disabled:opacity-50"
                    >قبلی</button>
                    <span className="text-sm">{currentPage} / {totalPages || 1}</span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-3 py-1 rounded-lg bg-green-100 text-green-700 disabled:opacity-50"
                    >بعدی</button>
                  </div>
                </div>
                
                {/* فیلتر پایه برای لیست */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-green-600" />
                  <select
                    value={filterGrade}
                    onChange={(e) => setFilterGrade(e.target.value)}
                    className="p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 text-sm bg-green-50"
                  >
                    <option value="">همه پایه‌ها</option>
                    {grades.map(grade => (
                      <option key={grade.id} value={grade.id}>
                        {grade.grade_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">در حال بارگذاری...</p>
              </div>
            ) : filteredStudentsForDisplay.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p>
                  {filterGrade 
                    ? `هیچ دانش‌آموزی در این پایه یافت نشد` 
                    : 'هیچ دانش‌آموزی یافت نشد'
                  }
                </p>
              </div>
            ) : (
              pagedStudents.map(student => (
                <div key={student.id} className="border-b border-green-100 last:border-0">
                  <button
                    onClick={() => toggleStudentExpansion(student.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-green-50 transition text-right"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-semibold text-gray-700 text-sm sm:text-base">{student.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{student.grade_name} - {student.class_name}</span>
                    </div>
                    {expandedStudent === student.id ? 
                      <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    }
                  </button>

                  {expandedStudent === student.id && (
                    <div className="p-4 sm:p-6 bg-green-50">
                      {studentReports[student.id]?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[500px] bg-white rounded-xl shadow-sm">
                            <thead className="bg-green-100">
                              <tr>
                                <th className="p-3 text-right font-semibold text-gray-700">درس</th>
                                <th className="p-3 text-center font-semibold text-gray-700">نوع</th>
                                <th className="p-3 text-center font-semibold text-gray-700">نمره</th>
                                <th className="p-3 text-center font-semibold text-gray-700">نیمسال</th>
                                <th className="p-3 text-center font-semibold text-gray-700">سال</th>
                                <th className="p-3 text-center font-semibold text-gray-700">عملیات</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentReports[student.id].map(report => (
                                <tr key={report.id} className="border-b border-gray-100 hover:bg-green-50 transition">
                                  <td className="p-3 font-medium">
                                    {editingReport === report.id ? (
                                      <input
                                        type="text"
                                        value={editSubject}
                                        onChange={(e) => setEditSubject(e.target.value)}
                                        className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                      />
                                    ) : (
                                      <div className="flex items-center gap-2">
                                        {report.subject.includes('کارگاه') && (
                                          <Settings className="w-4 h-4 text-purple-600" />
                                        )}
                                        {report.subject}
                                      </div>
                                    )}
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                      report.subject.includes('کارگاه') 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-blue-100 text-blue-700'
                                    }`}>
                                      {report.subject.includes('کارگاه') ? 'کارگاهی' : 'اصلی'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-center">
                                    {editingReport === report.id ? (
                                      <select
                                        value={editGrade}
                                        onChange={(e) => setEditGrade(e.target.value)}
                                        className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                                      >
                                        <option value="">انتخاب نمره</option>
                                        {gradeOptions.map(grade => (
                                          <option key={grade.value} value={grade.value}>{grade.label}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                                        report.grade === 'A' ? 'bg-green-100 text-green-700' :
                                        report.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                        report.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {getGradeLabel(report.grade)}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-center text-sm text-gray-600">{getSemesterLabel(report.semester)}</td>
                                  <td className="p-3 text-center text-sm text-gray-600">{report.academic_year}</td>
                                  <td className="p-3">
                                    <div className="flex items-center justify-center gap-2">
                                      {editingReport === report.id ? (
                                        <>
                                          <button 
                                            onClick={() => handleSaveEdit(report.id)}
                                            className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition"
                                          >
                                            <Save className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={handleCancelEdit}
                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition"
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          <button 
                                            onClick={() => handleEdit(report)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition"
                                          >
                                            <Edit className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-xl transition"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">هنوز کارنامه‌ای ثبت نشده است</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}