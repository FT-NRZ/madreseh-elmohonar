'use client';

import React, { useState, useEffect } from 'react';
import { 
  Book, Award, TrendingUp, Calendar, 
  BarChart3, PieChart, Target, Star,
  Filter, Download, ChevronDown, 
  Trophy, Medal, Sparkles, Loader2,
  GraduationCap, FileText
} from 'lucide-react';

export default function ReportCardsPage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
        setLoading(false);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری کارنامه...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* کامپوننت کارنامه اصلی */}
      <ReportCard studentId={studentId} />
    </div>
  );
}

function ReportCard({ studentId }) {
  const [reportCards, setReportCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('first');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    fetchReportCards();
  }, [studentId]);

  useEffect(() => {
    if (selectedSemester || selectedYear) {
      filterReportCards();
    }
  }, [selectedSemester, selectedYear, reportCards]);

  const fetchReportCards = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // استفاده از همون endpoint که معلم و ادمین استفاده می‌کنن
      const res = await fetch(`/api/report-cards/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      console.log('Report cards response:', data);
      
      if (data.success && data.reportCards) {
        setReportCards(data.reportCards);
        
        // استخراج سال‌های موجود
        const years = [...new Set(data.reportCards.map(report => report.academic_year))].sort();
        setAvailableYears(years);
        
        // تنظیم سال پیش‌فرض روی جدیدترین سال
        if (years.length > 0 && !years.includes(selectedYear)) {
          setSelectedYear(years[years.length - 1]);
        }
      } else {
        setReportCards([]);
        console.log('No report cards found or API error:', data.message);
      }
    } catch (error) {
      console.error('Error fetching report cards:', error);
      setReportCards([]);
    } finally {
      setLoading(false);
    }
  };

  const filterReportCards = () => {
    return reportCards.filter(report => {
      const matchesSemester = !selectedSemester || report.semester === selectedSemester;
      const matchesYear = !selectedYear || report.academic_year === selectedYear;
      return matchesSemester && matchesYear;
    });
  };

  const getGradeLabel = (gradeValue) => {
    const gradeLabels = {
      'A': 'عالی',
      'B': 'خیلی خوب',
      'C': 'خوب',
      'D': 'نیاز به تلاش بیشتر'
    };
    return gradeLabels[gradeValue] || gradeValue;
  };

  const getGradeColor = (gradeValue) => {
    const gradeColors = {
      'A': 'bg-green-100 text-green-700 border-green-200',
      'B': 'bg-blue-100 text-blue-700 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'D': 'bg-red-100 text-red-700 border-red-200'
    };
    return gradeColors[gradeValue] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getSemesterLabel = (semester) => {
    return semester === 'first' ? 'نیمسال اول' : 'نیمسال دوم';
  };

  const calculateGPA = (reports) => {
    if (!reports.length) return 0;
    
    const gradePoints = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
    const totalPoints = reports.reduce((sum, report) => {
      return sum + (gradePoints[report.grade] || 0);
    }, 0);
    
    return (totalPoints / reports.length).toFixed(2);
  };

  const filteredReports = filterReportCards();
  const gpa = calculateGPA(filteredReports);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-green-100">
        <div className="flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 ml-3" />
          <span className="text-gray-600">در حال بارگذاری کارنامه...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-green-100 overflow-hidden">
      {/* هدر */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">کارنامه تحصیلی</h3>
              <p className="text-green-100 text-sm">نمرات و عملکرد تحصیلی</p>
            </div>
          </div>
          
          {/* آمار کلی */}
          <div className="flex gap-4">
            <div className="bg-white/10 rounded-lg p-3 text-center">
              <Award className="w-6 h-6 mx-auto mb-1" />
              <p className="text-lg font-bold">{filteredReports.length}</p>
              <p className="text-xs text-green-100">درس</p>
            </div>
          </div>
        </div>
      </div>

      {/* فیلترها */}
      <div className="p-6 border-b border-green-100 bg-green-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">فیلتر:</span>
          </div>
          
          <select
            value={selectedSemester}
            onChange={e => setSelectedSemester(e.target.value)}
            className="border border-green-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">همه نیمسال‌ها</option>
            <option value="first">نیمسال اول</option>
            <option value="second">نیمسال دوم</option>
          </select>
          
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="border border-green-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
          >
            <option value="">همه سال‌ها</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          {(selectedSemester || selectedYear) && (
            <button
              onClick={() => {
                setSelectedSemester('');
                setSelectedYear('');
              }}
              className="text-sm text-green-600 hover:text-green-700 underline"
            >
              پاک کردن فیلتر
            </button>
          )}
        </div>
      </div>

      {/* جدول نمرات */}
      <div className="overflow-x-auto">
        {filteredReports.length > 0 ? (
          <table className="w-full">
            <thead className="bg-green-100">
              <tr>
                <th className="p-4 text-right text-sm font-bold text-gray-700">درس</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">نمره</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">نیمسال</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">سال تحصیلی</th>
                <th className="p-4 text-center text-sm font-bold text-gray-700">تاریخ ثبت</th>
                <th className="p-4 text-right text-sm font-bold text-gray-700">توضیحات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <tr key={report.id} className="hover:bg-green-50 transition">
                  <td className="p-4 font-medium text-gray-800">
                    {report.subject}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getGradeColor(report.grade)}`}>
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
                  <td className="p-4 text-gray-600 text-sm">
                    {report.comments || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-600 mb-2">
              کارنامه‌ای یافت نشد
            </h4>
            <p className="text-gray-500">
              {selectedSemester || selectedYear 
                ? 'برای فیلترهای انتخابی کارنامه‌ای وجود ندارد'
                : 'هنوز هیچ نمره‌ای ثبت نشده است'
              }
            </p>
            {reportCards.length > 0 && (selectedSemester || selectedYear) && (
              <button
                onClick={() => {
                  setSelectedSemester('');
                  setSelectedYear('');
                }}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                مشاهده همه کارنامه‌ها
              </button>
            )}
          </div>
        )}
      </div>

      {/* آمار پایین */}
      {filteredReports.length > 0 && (
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-green-100 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-700">
                {filteredReports.filter(r => r.grade === 'A').length}
              </p>
              <p className="text-sm text-green-600">نمره عالی</p>
            </div>
            <div className="bg-blue-100 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-700">
                {filteredReports.filter(r => r.grade === 'B').length}
              </p>
              <p className="text-sm text-blue-600">نمره خیلی خوب</p>
            </div>
            <div className="bg-yellow-100 rounded-lg p-3">
              <p className="text-2xl font-bold text-yellow-700">
                {filteredReports.filter(r => r.grade === 'C').length}
              </p>
              <p className="text-sm text-yellow-600">نمره خوب</p>
            </div>
            <div className="bg-red-100 rounded-lg p-3">
              <p className="text-2xl font-bold text-red-700">
                {filteredReports.filter(r => r.grade === 'D').length}
              </p>
              <p className="text-sm text-red-600">نیاز به تلاش</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
