'use client'
import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Users, AlertCircle, GraduationCap } from 'lucide-react';

export default function WeeklySchedule({ studentId }) {
  const [schedule, setSchedule] = useState([]);
  const [specialClasses, setSpecialClasses] = useState([]);
  const [studentInfo, setStudentInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('all');

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade === 'all') {
      fetchStudentSchedule();
    } else {
      fetchGradeSchedule();
    }
    // واکشی کلاس‌های فوق‌العاده بر اساس پایه انتخاب شده
    fetchSpecialClasses();
  }, [selectedGrade, studentId]);

const fetchGrades = async () => {
  try {
    const res = await fetch('/api/grades');
    const data = await res.json();
    if (data.success) {
      setGrades(data.grades || []);
    }
  } catch (error) {
    console.error('Error fetching grades:', error);
  }
};

  // واکشی کلاس‌های فوق‌العاده بر اساس پایه انتخاب شده
  const fetchSpecialClasses = async () => {
    try {
      let url = '/api/special-classes';
      
      if (selectedGrade !== 'all') {
        // اگر پایه خاصی انتخاب شده، فقط کلاس‌های فوق‌العاده همان پایه را بگیر
        url += `?grade_id=${selectedGrade}`;
        console.log(`Fetching special classes for grade ID: ${selectedGrade}`);
      } else {
        // اگر "برنامه شخصی من" انتخاب شده، کلاس‌های فوق‌العاده را بر اساس کلاس دانش‌آموز بگیر
        if (studentId) {
          // ابتدا اطلاعات دانش‌آموز را بگیر تا class_id را پیدا کنی
          const studentRes = await fetch(`/api/student/${studentId}`);
          const studentData = await studentRes.json();
          if (studentData.success && studentData.student?.class_id) {
            url += `?class_id=${studentData.student.class_id}`;
            console.log(`Fetching special classes for student's class ID: ${studentData.student.class_id}`);
          } else {
            // اگر کلاس دانش‌آموز پیدا نشد، هیچ کلاس فوق‌العاده‌ای نمایش نده
            setSpecialClasses([]);
            return;
          }
        } else {
          setSpecialClasses([]);
          return;
        }
      }
      
      console.log('Fetching special classes from URL:', url);
      const res = await fetch(url);
      const data = await res.json();
      console.log('Special classes response:', data);
      
      if (data.success) {
        setSpecialClasses(data.items || []);
        console.log(`Found ${data.items?.length || 0} special classes`);
      } else {
        setSpecialClasses([]);
      }
    } catch (error) {
      console.error('Error fetching special classes:', error);
      setSpecialClasses([]);
    }
  };

  const fetchStudentSchedule = async () => {
    setLoading(true);
    try {
      console.log('Fetching student schedule for ID:', studentId);
      const res = await fetch(`/api/student/${studentId}/schedule`);
      const data = await res.json();

      console.log('Student API response:', data);

      if (data.success) {
        setSchedule(data.schedule || []);
        setStudentInfo(data.studentInfo || {});
        setMessage(data.message || '');
      } else {
        setSchedule([]);
        setStudentInfo({});
        setMessage(data.message || 'خطا در دریافت برنامه هفتگی');
      }
    } catch (error) {
      console.error('Error fetching student schedule:', error);
      setSchedule([]);
      setStudentInfo({});
      setMessage('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const fetchGradeSchedule = async () => {
    setLoading(true);
    try {
      console.log('Fetching grade schedule for grade ID:', selectedGrade);
      const res = await fetch(`/api/schedule/all?gradeId=${selectedGrade}`);
      const data = await res.json();

      console.log('Grade API response:', data);

      if (data.success) {
        setSchedule(data.schedules || []);
        const gradeName = grades.find(g => g.id === parseInt(selectedGrade))?.grade_name || 'نامشخص';
        setStudentInfo({ 
          className: 'همه کلاس‌ها', 
          gradeName: gradeName 
        });
        setMessage('');
      } else {
        setSchedule([]);
        setStudentInfo({});
        setMessage('خطا در دریافت برنامه هفتگی');
      }
    } catch (error) {
      console.error('Error fetching grade schedule:', error);
      setSchedule([]);
      setStudentInfo({});
      setMessage('خطا در ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // گروه‌بندی برنامه‌ها بر اساس روز
  const groupedSchedule = schedule.reduce((acc, item) => {
    if (!acc[item.dayKey]) {
      acc[item.dayKey] = [];
    }
    acc[item.dayKey].push(item);
    return acc;
  }, {});

  const daysOrder = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayNames = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه',
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنج‌شنبه',
    'friday': 'جمعه'
  };

  // تابع فرمت کردن زمان
  function formatTime(timeString) {
    if (!timeString) return '--:--';
    const timePart = timeString.split('T')[1] || timeString;
    const [hours, minutes] = timePart.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-green-600" />
          برنامه هفتگی
        </h3>

        {/* فیلتر پایه تحصیلی */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GraduationCap className="w-4 h-4 inline ml-1" />
            انتخاب پایه تحصیلی
          </label>
          <select 
            value={selectedGrade} 
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">برنامه شخصی من</option>
            {grades.map(grade => (
              <option key={grade.id} value={grade.id}>
                {grade.grade_name}
              </option>
            ))}
          </select>
        </div>
        
        {studentInfo.className && (
          <div className="bg-green-50 p-3 rounded-lg mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">
              {studentInfo.className} - {studentInfo.gradeName}
            </span>
            {selectedGrade !== 'all' && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-2">
                کلاس‌های فوق‌العاده: {specialClasses.length}
              </span>
            )}
          </div>
        )}

        {!schedule.length && !specialClasses.length ? (
          <div className="text-center py-8">
            <CalendarDays className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {message || 'برنامه هفتگی یافت نشد'}
            </p>
            
            {selectedGrade === 'all' && !studentInfo.className && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex items-center gap-2">
                <AlertCircle className="text-yellow-500" size={20} />
                <p className="text-sm text-yellow-700">کلاس یا پایه‌ای برای شما تعیین نشده است. می‌توانید از فیلتر بالا پایه مورد نظر را انتخاب کنید.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {daysOrder.map(dayKey => {
              const daySchedule = groupedSchedule[dayKey] || [];
              const specialDay = specialClasses.filter(cls => cls.day_of_week === dayKey);

              if (daySchedule.length === 0 && specialDay.length === 0) return null;

              return (
                <div key={dayKey} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b border-green-100">
                    <h4 className="font-semibold text-green-700 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4" />
                      {dayNames[dayKey]}
                      <span className="bg-green-200 px-2 py-1 rounded text-xs">
                        {daySchedule.length + specialDay.length} جلسه
                      </span>
                      {specialDay.length > 0 && (
                        <span className="bg-yellow-200 px-2 py-1 rounded text-xs text-yellow-700">
                          {specialDay.length} فوق‌العاده
                        </span>
                      )}
                    </h4>
                  </div>
                  <div className="p-4 space-y-3">
                    {/* کلاس‌های معمولی */}
                    {daySchedule.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900">{item.subject}</h5>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{item.time}</span>
                            </div>
                          </div>
                        </div>
                        {selectedGrade !== 'all' && (
                          <div className="text-left">
                            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                              {item.className}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* کلاس‌های فوق‌العاده (فقط برای پایه انتخاب شده) */}
                    {specialDay.map(cls => (
                      <div key={cls.id} className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-5 h-5 text-yellow-700" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-medium text-yellow-800">{cls.title}</h5>
                          <div className="flex items-center gap-4 text-sm text-yellow-700 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                            </div>
                            <span className="bg-yellow-200 px-2 py-1 rounded text-xs">فوق‌العاده</span>
                          </div>
                        </div>
                        {selectedGrade !== 'all' && cls.class_name && (
                          <div className="text-left">
                            <div className="bg-yellow-200 text-yellow-800 px-2 py-1 rounded text-xs">
                              {cls.class_name}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}