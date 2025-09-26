import React, { useEffect, useState } from 'react';
import { Utensils, AlertTriangle } from 'lucide-react';
import jalaali from 'jalaali-js';

function toJalali(dateStr) {
  if (!dateStr) return '';
  try {
    let date;
    if (typeof dateStr === 'string') {
      date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    } else {
      date = dateStr;
    }
    
    const [gy, gm, gd] = date.split('-').map(Number);
    if (!gy || !gm || !gd || isNaN(gy) || isNaN(gm) || isNaN(gd) || gy < 1000) return '';
    const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  } catch (error) {
    console.error('Error converting date to Jalali:', error);
    return '';
  }
}

const weekDaysFa = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه'
};

export default function MealSchedule({ studentId }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMeals() {
      try {
        console.log('Fetching meals...');
        setLoading(true);
        setError(null);
        
        const res = await fetch(`/api/admin/food-schedule`);
        console.log('Response status:', res.status);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Fetched data:', data);
        
        if (data.success) {
          setMeals(data.schedules || []);
        } else {
          setError(data.message || 'خطا در دریافت اطلاعات');
        }
      } catch (error) {
        console.error('Error fetching meals:', error);
        setError('خطا در دریافت برنامه غذایی');
        setMeals([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMeals();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          برنامه غذایی مدرسه
        </h2>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow border border-red-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          برنامه غذایی مدرسه
        </h2>
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          برنامه غذایی مدرسه
        </h2>
        {/* متن اخطار */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm leading-relaxed">
              <p className="font-bold mb-2">🔴 توجه:</p>
              <p className="mb-2">
                ۱. در صورتی که دانش‌آموز غذایی از لیست برنامه غذایی را نپسندید، خانواده می‌توانند همراه او غذا ارسال کنند.
              </p>
              <p>
                ۲. در صورت داشتن هرگونه حساسیت غذایی، لطفاً موضوع را به مدرسه اطلاع دهید.
              </p>
            </div>
          </div>
        </div>
        <div className="text-center py-8 text-gray-500">
          <div className="text-6xl mb-4">🍽️</div>
          <p>هیچ برنامه غذایی ثبت نشده است</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <Utensils className="w-6 h-6" />
        برنامه غذایی مدرسه
      </h2>
      
      {/* متن اخطار */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-700 text-sm leading-relaxed">
            <p className="font-bold mb-2">🔴 توجه:</p>
            <p className="mb-2">
              ۱. در صورتی که دانش‌آموز غذایی از لیست برنامه غذایی را نپسندید، خانواده می‌توانند همراه او غذا ارسال کنند.
            </p>
            <p>
              ۲. در صورت داشتن هرگونه حساسیت غذایی، لطفاً موضوع را به مدرسه اطلاع دهید.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-green-200 rounded-lg">
          <thead>
            <tr className="bg-green-50 text-green-700">
              <th className="py-3 px-4 text-right border-b">روز</th>
              <th className="py-3 px-4 text-right border-b">تاریخ</th>
              <th className="py-3 px-4 text-right border-b">صبحانه</th>
              <th className="py-3 px-4 text-right border-b">ناهار</th>
            </tr>
          </thead>
          <tbody>
            {meals.map((m) => (
              <tr key={m.id} className="border-b last:border-b-0 hover:bg-green-50">
                <td className="py-3 px-4 font-bold text-green-700">
                  {weekDaysFa[m.weekday] || m.weekday}
                </td>
                <td className="py-3 px-4 text-gray-600">
                  {toJalali(m.date)}
                </td>
                <td className="py-3 px-4">
                  {m.breakfast ? (
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                      {m.breakfast}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  {m.lunch ? (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {m.lunch}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}