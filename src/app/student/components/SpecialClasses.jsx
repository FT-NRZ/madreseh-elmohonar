'use client';
import { useEffect, useState } from 'react';
import { Sparkles, Clock, Calendar } from 'lucide-react';

const daysFa = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه',
  thursday: 'پنج‌شنبه',
};

export default function SpecialClasses({ gradeId }) {
  const [list, setList] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // دریافت لیست کلاس‌ها
  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes');
      const data = await response.json();
      if (data.success) setClasses(data.classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  // دریافت کلاس‌های فوق‌العاده
  const fetchSpecialClasses = async () => {
    if (!gradeId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/special-classes');
      const data = await response.json();

      if (data.success) {
        // فیلتر کردن بر اساس پایه (مقایسه به صورت رشته)
        const filteredClasses = data.items.filter(item => {
          const itemClass = classes.find(cls => String(cls.id) === String(item.class_id));
          // مقایسه grade_id به صورت رشته
          return itemClass && String(itemClass.grade_id) === String(gradeId);
        });

        setList(filteredClasses);
        // لاگ برای دیباگ
        console.log('gradeId:', gradeId, 'filteredClasses:', filteredClasses);
      } else {
        setList([]);
      }
    } catch (error) {
      console.error('Error fetching special classes:', error);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  // دریافت کلاس‌ها در ابتدا
  useEffect(() => {
    fetchClasses();
  }, []);

  // دریافت کلاس‌های فوق‌العاده وقتی کلاس‌ها و gradeId تغییر کند
  useEffect(() => {
    if (classes.length > 0 && gradeId) {
      fetchSpecialClasses();
    } else {
      setList([]);
    }
  }, [gradeId, classes]);

  if (!gradeId) return null;

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-bold text-orange-800">کلاس‌های فوق‌العاده</h3>
        </div>
        <div className="text-center text-orange-600">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!list.length) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-bold text-orange-800">کلاس‌های فوق‌العاده</h3>
        </div>
        <div className="text-center text-orange-600 text-sm">
          هیچ کلاس فوق‌العاده‌ای برای این پایه ثبت نشده است
        </div>
      </div>
    );
  }

  // گروه‌بندی بر اساس روز
  const groupedByDay = {};
  list.forEach(item => {
    if (!groupedByDay[item.day_of_week]) {
      groupedByDay[item.day_of_week] = [];
    }
    groupedByDay[item.day_of_week].push(item);
  });

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl shadow-lg p-6 border border-orange-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-orange-600" />
        </div>
        <h3 className="font-bold text-orange-800">کلاس‌های فوق‌العاده</h3>
        <span className="bg-orange-200 text-orange-700 text-xs px-2 py-1 rounded-full">
          {list.length} کلاس
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedByDay).map(([dayKey, dayItems]) => (
          <div key={dayKey} className="bg-white/70 rounded-lg p-4 border border-orange-200">
            <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {daysFa[dayKey] || dayKey}
            </h4>
            <div className="space-y-3">
              {dayItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg p-3 border border-orange-100 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-semibold text-orange-900">{item.title}</h5>
                    <div className="flex items-center gap-1 text-orange-600 text-sm">
                      <Clock className="w-3 h-3" />
                      {item.start_time} - {item.end_time}
                    </div>
                  </div>

                  <div className="text-sm text-orange-700 mb-1">
                    <span className="font-medium">کلاس:</span> {classes.find(c => String(c.id) === String(item.class_id))?.class_name || 'نامشخص'}
                  </div>

                  {item.description && (
                    <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded mt-2">
                      {item.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
