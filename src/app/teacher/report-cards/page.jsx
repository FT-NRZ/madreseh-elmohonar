'use client';

import React, { useState, useEffect } from 'react';
import { 
  Book, Users, GraduationCap, Search, Filter, Eye, Calendar,
  ChevronDown, ChevronUp, Loader2, RefreshCw, ChevronLeft, ChevronRight,
  Menu, X, AlertCircle, Sparkles
} from 'lucide-react';

export default function TeacherReportCardsPage() {
  const [teacherId, setTeacherId] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentReports, setStudentReports] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  const gradeOptions = [
    { value: 'A', label: 'عالی' },
    { value: 'B', label: 'خیلی خوب' }, 
    { value: 'C', label: 'خوب' },
    { value: 'D', label: 'نیاز به تلاش بیشتر' }
  ];

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
        setUser(userObj);
        
        // شروع دریافت داده‌ها
        fetchGrades();
        fetchStudents();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchGrades = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/grades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGrades(data.grades);
      }
    } catch (error) {
      console.error('خطا در دریافت پایه‌ها:', error);
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const res = await fetch('/api/users/list?role=students', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.success && data.users) {
        const studentsWithGrades = await Promise.all(
          data.users.map(async (student) => {
            try {
              const studentRes = await fetch(`/api/student/${student.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (studentRes.ok) {
                const studentData = await studentRes.json();
                
                let grade_id = null;
                let grade_name = 'نامشخص';
                let class_name = 'نامشخص';
                
                if (studentData.student) {
                  if (studentData.student.class) {
                    class_name = studentData.student.class.class_name || studentData.student.class.name || 'نامشخص';
                    
                    if (studentData.student.class.grade) {
                      grade_id = studentData.student.class.grade.id || studentData.student.class.grade_id;
                      grade_name = studentData.student.class.grade.grade_name || studentData.student.class.grade.name || 'نامشخص';
                    } else if (studentData.student.class.grade_id) {
                      grade_id = studentData.student.class.grade_id;
                      const gradeInfo = grades.find(g => g.id === studentData.student.class.grade_id);
                      grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                    }
                  }
                  
                  if (!grade_id && studentData.student.grade_id) {
                    grade_id = studentData.student.grade_id;
                    const gradeInfo = grades.find(g => g.id === studentData.student.grade_id);
                    grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                  }
                }
                
                if (!grade_id && studentData.class) {
                  class_name = studentData.class.class_name || studentData.class.name || 'نامشخص';
                  
                  if (studentData.class.grade) {
                    grade_id = studentData.class.grade.id || studentData.class.grade_id;
                    grade_name = studentData.class.grade.grade_name || studentData.class.grade.name || 'نامشخص';
                  } else if (studentData.class.grade_id) {
                    grade_id = studentData.class.grade_id;
                    const gradeInfo = grades.find(g => g.id === studentData.class.grade_id);
                    grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                  }
                }
                
                if (!grade_id && studentData.grade_id) {
                  grade_id = studentData.grade_id;
                  const gradeInfo = grades.find(g => g.id === studentData.grade_id);
                  grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                }
                
                return {
                  ...student,
                  grade_id,
                  grade_name,
                  class_name
                };
              } else {
                return {
                  ...student,
                  grade_id: null,
                  grade_name: 'نامشخص',
                  class_name: 'نامشخص'
                };
              }
            } catch (error) {
              return {
                ...student,
                grade_id: null,
                grade_name: 'نامشخص',
                class_name: 'نامشخص'
              };
            }
          })
        );
        
        setStudents(studentsWithGrades);
      } else {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (error) {
      setError('خطا در دریافت لیست دانش‌آموزان');
      setStudents([]);
    } finally {
      setLoading(false);
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
      } else {
        setStudentReports(prev => ({ ...prev, [studentId]: [] }));
        if (res.status !== 404 && !data.message?.includes('یافت نشد')) {
          setError('خطا در دریافت کارنامه');
        }
      }
    } catch (error) {
      setStudentReports(prev => ({ ...prev, [studentId]: [] }));
      setError('خطا در دریافت کارنامه');
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

  // فیلتر کردن دانش‌آموزان
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || student.grade_id === parseInt(selectedGrade);
    return matchesSearch && matchesGrade;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGrade]);

  // فیلتر کردن کارنامه‌ها
  const filterReports = (reports) => {
    return reports?.filter(report => {
      const matchesSemester = selectedSemester === '' || report.semester === selectedSemester;
      const matchesYear = selectedYear === '' || report.academic_year === selectedYear;
      return matchesSemester && matchesYear;
    }) || [];
  };

  // دریافت سال‌های موجود
  const getAvailableYears = () => {
    const years = new Set();
    Object.values(studentReports).forEach(reports => {
      reports?.forEach(report => {
        if (report.academic_year) {
          years.add(report.academic_year);
        }
      });
    });
    return Array.from(years).sort();
  };

  const refreshData = async () => {
    await fetchStudents();
    setStudentReports({});
    setExpandedStudent(null);
    setCurrentPage(1);
  };

  const getStudentInitials = (name) => {
    const words = name.split(' ');
    if (words.length >= 2) {
      return words[0].charAt(0) + words[1].charAt(0);
    }
    return name.charAt(0);
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال دریافت کارنامه‌ها...</p>
        </div>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header خطا */}
        <div className="bg-gradient-to-r from-red-400 via-red-500 to-red-600 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 md:w-32 md:h-32 bg-white/10 rounded-full -translate-y-10 md:-translate-y-16 translate-x-10 md:translate-x-16"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-3">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">خطا در بارگذاری</h1>
                <p className="text-red-100 text-xs md:text-base">{error}</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
          <button
            onClick={refreshData}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            تلاش مجدد
          </button>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Book className="w-6 h-6 md:w-8 md:h-8 text-white" />
              <div>
                <h1 className="text-lg md:text-2xl font-bold mb-2">مشاهده کارنامه‌ها 📊</h1>
                <p className="text-green-100 text-xs md:text-base">
                  {teacher ? `${teacher.firstName} ${teacher.lastName}` : 'معلم گرامی'} - نمرات و عملکرد دانش‌آموزان
                </p>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/15 hover:bg-white/25 rounded-lg sm:rounded-xl transition-all duration-300 backdrop-blur-sm group text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="font-medium">به‌روزرسانی</span>
            </button>
          </div>

          {/* آمار سریع */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mt-4 md:mt-6">
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{students.length}</p>
                  <p className="text-green-100 text-xs sm:text-sm">دانش‌آموز</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{grades.length}</p>
                  <p className="text-green-100 text-xs sm:text-sm">پایه تحصیلی</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg sm:rounded-xl p-4 sm:p-6 backdrop-blur-sm border border-white/10 hover:bg-white/15 transition-all duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Book className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {Object.values(studentReports).reduce((total, reports) => total + (reports?.length || 0), 0)}
                  </p>
                  <p className="text-green-100 text-xs sm:text-sm">کارنامه</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* محتوای اصلی */}
      <div className="bg-white rounded-xl md:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* فیلترها */}
        <div className="p-4 sm:p-6 border-b border-green-100 bg-green-50/50">
          {/* دکمه نمایش فیلترها در موبایل */}
          <div className="flex sm:hidden justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">فیلترها</h3>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg transition-colors"
            >
              {showFilters ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="text-sm">{showFilters ? 'بستن' : 'نمایش'}</span>
            </button>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 ${!showFilters ? 'hidden sm:grid' : 'grid'}`}>
            {/* جستجو */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                placeholder="جستجوی نام..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 sm:pr-11 pl-4 py-2 sm:py-3 border border-green-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* فیلتر پایه */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 hidden sm:block" />
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="flex-1 p-2 sm:p-3 border border-green-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="">همه پایه‌ها</option>
                {grades.map(grade => (
                  <option key={grade.id} value={grade.id}>
                    {grade.grade_name}
                  </option>
                ))}
              </select>
            </div>

            {/* فیلتر نیمسال */}
            <div>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-2 sm:p-3 border border-green-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="">همه نیمسال‌ها</option>
                <option value="first">نیمسال اول</option>
                <option value="second">نیمسال دوم</option>
              </select>
            </div>

            {/* فیلتر سال */}
            <div>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full p-2 sm:p-3 border border-green-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 bg-white transition-all duration-200 text-sm sm:text-base"
              >
                <option value="">همه سال‌ها</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* لیست دانش‌آموزان */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="p-8 sm:p-16 text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 text-base sm:text-lg">در حال بارگذاری...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-8 sm:p-16 text-center text-gray-500">
              <Users className="w-16 h-16 sm:w-20 sm:h-20 text-gray-300 mx-auto mb-4" />
              <p className="text-lg sm:text-xl font-medium">هیچ دانش‌آموزی یافت نشد</p>
              <p className="text-gray-400 mt-2 text-sm sm:text-base">فیلترهای خود را بررسی کنید</p>
            </div>
          ) : (
            <>
              {currentStudents.map(student => (
                <div key={student.id} className="border-b border-green-50 last:border-0">
                  <button
                    onClick={() => toggleStudentExpansion(student.id)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-green-50/70 transition-all duration-200 text-right group"
                  >
                    <div className="flex items-center gap-3 sm:gap-5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500 to-green-400 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-md group-hover:shadow-lg transition-all duration-200">
                        {getStudentInitials(student.name)}
                      </div>
                      <div className="text-right">
                        <h3 className="font-bold text-gray-800 text-base sm:text-lg group-hover:text-green-600 transition-colors">
                          {student.name}
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 sm:mt-2">
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            {student.grade_name}
                          </span>
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            {student.class_name}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
                      {expandedStudent === student.id ? 
                        <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" /> : 
                        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      }
                    </div>
                  </button>

                  {expandedStudent === student.id && (
                    <div className="p-4 sm:p-6 bg-gray-50/70 border-t border-green-100">
                      {studentReports[student.id] ? (
                        filterReports(studentReports[student.id]).length > 0 ? (
                          <div className="overflow-x-auto">
                            {/* جدول برای دسکتاپ */}
                            <table className="hidden sm:table w-full min-w-[600px] bg-white rounded-2xl shadow-sm border border-green-100 overflow-hidden">
                              <thead className="bg-green-100/70">
                                <tr>
                                  <th className="p-4 text-right font-semibold text-gray-700">درس</th>
                                  <th className="p-4 text-center font-semibold text-gray-700">نمره</th>
                                  <th className="p-4 text-center font-semibold text-gray-700">نیمسال</th>
                                  <th className="p-4 text-center font-semibold text-gray-700">سال تحصیلی</th>
                                  <th className="p-4 text-center font-semibold text-gray-700">تاریخ ثبت</th>
                                </tr>
                              </thead>
                              <tbody>
                                {filterReports(studentReports[student.id]).map(report => (
                                  <tr key={report.id} className="border-b border-gray-50 hover:bg-green-50/50 transition-colors">
                                    <td className="p-4 font-medium text-gray-800">{report.subject}</td>
                                    <td className="p-4 text-center">
                                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-200 hover:scale-105 ${
                                        report.grade === 'A' ? 'bg-green-100 text-green-700' :
                                        report.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                        report.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                        'bg-red-100 text-red-700'
                                      }`}>
                                        {getGradeLabel(report.grade)}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center text-sm text-gray-600">
                                      {getSemesterLabel(report.semester)}
                                    </td>
                                    <td className="p-4 text-center text-sm text-gray-600">
                                      {report.academic_year}
                                    </td>
                                    <td className="p-4 text-center text-sm text-gray-600">
                                      {new Date(report.created_at).toLocaleDateString('fa-IR')}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>

                            {/* کارت‌ها برای موبایل */}
                            <div className="sm:hidden space-y-3">
                              {filterReports(studentReports[student.id]).map(report => (
                                <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm border border-green-100">
                                  <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-gray-800">{report.subject}</h4>
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                                      report.grade === 'A' ? 'bg-green-100 text-green-700' :
                                      report.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                      report.grade === 'C' ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {getGradeLabel(report.grade)}
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                      <span>نیمسال:</span>
                                      <span>{getSemesterLabel(report.semester)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>سال تحصیلی:</span>
                                      <span>{report.academic_year}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>تاریخ ثبت:</span>
                                      <span>{new Date(report.created_at).toLocaleDateString('fa-IR')}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <Book className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-base sm:text-lg font-medium">
                              {selectedSemester || selectedYear 
                                ? 'کارنامه‌ای با فیلترهای انتخابی یافت نشد'
                                : 'هنوز کارنامه‌ای ثبت نشده است'
                              }
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8 sm:py-12">
                          <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-green-600 animate-spin mx-auto mb-4" />
                          <p className="text-gray-500 text-base sm:text-lg">در حال بارگذاری کارنامه...</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {filteredStudents.length > 0 && (
          <div className="p-4 sm:p-6 border-t border-green-100 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
                نمایش {startIndex + 1} تا {Math.min(endIndex, filteredStudents.length)} از {filteredStudents.length} دانش‌آموز
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">قبلی</span>
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (page > totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <span className="hidden sm:inline">بعدی</span>
                  <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}