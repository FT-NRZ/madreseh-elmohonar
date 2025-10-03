'use client';

import { useState, useEffect } from 'react';
import { 
  Book, Users, GraduationCap, Search, Filter, Eye, Calendar,
  ChevronDown, ChevronUp, Loader2, RefreshCw
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

export default function ReportCards() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [studentReports, setStudentReports] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

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
      if (!['admin', 'teacher'].includes(parsedUser.role)) {
        window.location.href = '/dashboard';
        return;
      }
      setUser(parsedUser);
      fetchGrades();
      fetchStudents();
    } catch (error) {
      console.error('Error parsing user data:', error);
      window.location.href = '/login';
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
      console.error('Error fetching grades:', error);
    }
  };
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
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
      console.log('Students API response:', data); // دیبگ اولیه
      
      if (data.success && data.users) {
        // دریافت اطلاعات تکمیلی دانش‌آموزان شامل پایه تحصیلی
        const studentsWithGrades = await Promise.all(
          data.users.map(async (student) => {
            try {
              const studentRes = await fetch(`/api/student/${student.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              
              if (studentRes.ok) {
                const studentData = await studentRes.json();
                console.log(`Student ${student.id} full data:`, studentData); // دیبگ تفصیلی
                
                // چک کردن مسیرهای مختلف برای پایه تحصیلی
                let grade_id = null;
                let grade_name = 'نامشخص';
                let class_name = 'نامشخص';
                
                // حالت اول: اگر student داشته باشیم
                if (studentData.student) {
                  // چک کردن class
                  if (studentData.student.class) {
                    class_name = studentData.student.class.class_name || studentData.student.class.name || 'نامشخص';
                    
                    // چک کردن grade داخل class
                    if (studentData.student.class.grade) {
                      grade_id = studentData.student.class.grade.id || studentData.student.class.grade_id;
                      grade_name = studentData.student.class.grade.grade_name || studentData.student.class.grade.name || 'نامشخص';
                    } else if (studentData.student.class.grade_id) {
                      grade_id = studentData.student.class.grade_id;
                      // اگر grade object نبود، سعی می‌کنیم از لیست grades پیدا کنیم
                      const gradeInfo = grades.find(g => g.id === studentData.student.class.grade_id);
                      grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                    }
                  }
                  
                  // چک کردن مستقیم grade_id در student
                  if (!grade_id && studentData.student.grade_id) {
                    grade_id = studentData.student.grade_id;
                    const gradeInfo = grades.find(g => g.id === studentData.student.grade_id);
                    grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                  }
                }
                
                // حالت دوم: اگر مستقیم class داشته باشیم
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
                
                // حالت سوم: اگر مستقیم grade_id داشته باشیم
                if (!grade_id && studentData.grade_id) {
                  grade_id = studentData.grade_id;
                  const gradeInfo = grades.find(g => g.id === studentData.grade_id);
                  grade_name = gradeInfo ? gradeInfo.grade_name : 'نامشخص';
                }
                
                console.log(`Student ${student.id} parsed data:`, {
                  grade_id,
                  grade_name,
                  class_name
                });
                
                return {
                  ...student,
                  grade_id,
                  grade_name,
                  class_name
                };
              } else {
                console.warn(`Failed to fetch student ${student.id} details:`, studentRes.status);
                return {
                  ...student,
                  grade_id: null,
                  grade_name: 'نامشخص',
                  class_name: 'نامشخص'
                };
              }
            } catch (error) {
              console.error(`Error fetching student ${student.id}:`, error);
              return {
                ...student,
                grade_id: null,
                grade_name: 'نامشخص',
                class_name: 'نامشخص'
              };
            }
          })
        );
        
        console.log('Final students with grades:', studentsWithGrades);
        setStudents(studentsWithGrades);
      } else {
        throw new Error(data.message || 'API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('خطا در دریافت لیست دانش‌آموزان');
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
        // اگر کارنامه‌ای وجود نداشت، آرایه خالی قرار بده
        setStudentReports(prev => ({ ...prev, [studentId]: [] }));
        // فقط در صورت خطای واقعی toast نشون بده
        if (res.status !== 404 && !data.message?.includes('یافت نشد')) {
          toast.error('خطا در دریافت کارنامه');
        }
      }
    } catch (error) {
      console.error('Error fetching report cards:', error);
      setStudentReports(prev => ({ ...prev, [studentId]: [] }));
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
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
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

      {/* هدر */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Book className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">مشاهده کارنامه‌ها</h2>
              <p className="text-green-100 text-sm">نمرات و عملکرد دانش‌آموزان</p>
              {user && (
                <p className="text-green-200 text-xs mt-1">
                  {user.role === 'teacher' ? 'پنل معلم' : 'پنل مدیر'} - {user.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">به‌روزرسانی</span>
          </button>
        </div>

        {/* آمار */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-white" />
              <div>
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-green-100 text-sm">دانش‌آموز</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-white" />
              <div>
                <p className="text-2xl font-bold">{grades.length}</p>
                <p className="text-green-100 text-sm">پایه تحصیلی</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Book className="w-8 h-8 text-white" />
              <div>
                <p className="text-2xl font-bold">
                  {Object.values(studentReports).reduce((total, reports) => total + (reports?.length || 0), 0)}
                </p>
                <p className="text-green-100 text-sm">کارنامه</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* فیلترها */}
      <div className="p-6 border-b border-green-100 bg-green-50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* جستجو */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="جستجوی نام دانش‌آموز..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* فیلتر پایه */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-green-600" />
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="flex-1 p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
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
              className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500"
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
      <div className="max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">در حال بارگذاری...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p>هیچ دانش‌آموزی یافت نشد</p>
          </div>
        ) : (
          filteredStudents.map(student => (
            <div key={student.id} className="border-b border-green-100 last:border-0">
              <button
                onClick={() => toggleStudentExpansion(student.id)}
                className="w-full flex items-center justify-between p-6 hover:bg-green-50 transition text-right"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-500 rounded-full flex items-center justify-center text-white font-bold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="text-right">
                    <h3 className="font-semibold text-gray-800">{student.name}</h3>
                    <p className="text-sm text-gray-500">{student.grade_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-gray-400" />
                  {expandedStudent === student.id ? 
                    <ChevronUp className="w-5 h-5 text-gray-400" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  }
                </div>
              </button>

              {expandedStudent === student.id && (
                <div className="p-6 bg-gray-50 border-t border-green-100">
                  {studentReports[student.id] ? (
                    filterReports(studentReports[student.id]).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px] bg-white rounded-xl shadow-sm">
                          <thead className="bg-green-100">
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
                              <tr key={report.id} className="border-b border-gray-100 hover:bg-green-50 transition">
                                <td className="p-4 font-medium text-gray-800">{report.subject}</td>
                                <td className="p-4 text-center">
                                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                                    report.grade === 'A' ? 'bg-green-100 text-green-700' :
                                    report.grade === 'B' ? 'bg-blue-100 text-blue-700' :
                                    report.grade === 'C' ? 'bg-yellow-100 text-yellow-700' :
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
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {selectedSemester || selectedYear 
                            ? 'کارنامه‌ای با فیلترهای انتخابی یافت نشد'
                            : 'هنوز کارنامه‌ای ثبت نشده است'
                          }
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
                      <p className="text-gray-500">در حال بارگذاری کارنامه...</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}