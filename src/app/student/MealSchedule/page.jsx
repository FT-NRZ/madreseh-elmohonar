'use client'

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

export default function MealSchedulePage() {
  const [user, setUser] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptMeal, setReceiptMeal] = useState(null);

  // تنظیم کاربر و studentId
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const userObj = JSON.parse(userData);
        setUser(userObj);
        setStudentId(userObj.id);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
      }
    } else {
      window.location.href = '/';
    }
  }, []);

  // دریافت برنامه غذایی
  useEffect(() => {
    if (studentId) {
      fetchMeals();
    }
  }, [studentId]);

  async function fetchMeals() {
    try {
      console.log('Fetching meals...');
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const res = await fetch(`/api/student/${studentId}/meals`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', res.status);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log('Fetched data:', data);

      if (data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const items = (data.meals || []).filter(meal => {
          const mealDate = new Date(meal.date);
          mealDate.setHours(0, 0, 0, 0);
          return mealDate >= today;
        });
        setMeals(items);
      } else {
        throw new Error(data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError('خطا در دریافت برنامه غذایی');
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleBreakfast(meal) {
    if (meal.breakfastStatus === 'expired') return;
    try {
      const token = localStorage.getItem('token');
      const method = meal.breakfastStatus === 'reserved' ? 'DELETE' : 'POST';
      const response = await fetch(`/api/student/${studentId}/meals`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ scheduleId: meal.id })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'عملیات رزرو انجام نشد');
      if (method === 'POST') {
        setReceiptMeal({ ...meal, breakfastStatus: 'reserved' });
      } else if (receiptMeal?.id === meal.id) {
        setReceiptMeal(null);
      }
      await fetchMeals();
    } catch (err) {
      setError(err.message || 'خطا در تغییر وضعیت رزرو');
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-green-200">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">در حال بارگذاری برنامه غذایی...</p>
        </div>
      </div>
    );
  }

  if (error && !meals.length) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">خطا در بارگذاری</h2>
                <p className="text-red-100 text-sm">مشکلی در دریافت برنامه غذایی پیش آمده</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-red-100 p-6">
          <div className="text-center py-8 text-red-500">
            <AlertTriangle className="w-20 h-20 mx-auto mb-6 text-red-400" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">خطا در بارگذاری برنامه غذایی</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={fetchMeals} 
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              تلاش مجدد
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!meals.length) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Utensils className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">برنامه غذایی مدرسه</h2>
                <p className="text-green-100 text-sm">برنامه غذایی هفتگی</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-green-100 p-6">
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-3xl p-8 text-white shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Utensils className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">برنامه غذایی مدرسه</h2>
                <p className="text-green-100 text-sm">برنامه غذایی هفتگی و وعده‌ها</p>
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl font-bold">{meals.length}</span>
              </div>
              <p className="text-xs text-green-100 mt-1">روز</p>
            </div>
          </div>
        </div>
      </div>

      {/* برنامه غذایی */}
      <div className="bg-white rounded-xl shadow border border-green-100 p-6">
        <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
          <Utensils className="w-6 h-6" />
          برنامه غذایی هفتگی
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
                <th className="py-3 px-4 text-right border-b font-bold">روز</th>
                <th className="py-3 px-4 text-right border-b font-bold">تاریخ</th>
                <th className="py-3 px-4 text-right border-b font-bold">صبحانه و رزرو</th>
                <th className="py-3 px-4 text-right border-b font-bold">ناهار</th>
              </tr>
            </thead>
            <tbody>
              {meals.map((m) => (
                <tr key={m.id} className="border-b last:border-b-0 hover:bg-green-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-green-700">
                    {weekDaysFa[m.weekday] || m.weekday}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {toJalali(m.date)}
                  </td>
                  <td className="py-3 px-4 space-y-2">
                    <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium inline-block">
                      {m.breakfast || '-'}
                    </div>
                    <div>
                      <button
                        onClick={() => toggleBreakfast(m)}
                        disabled={!m.breakfast || m.breakfastStatus === 'expired'}
                        className={`px-3 py-1 rounded-lg text-xs font-bold disabled:cursor-not-allowed ${
                          m.breakfastStatus === 'reserved'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : m.breakfastStatus === 'expired'
                              ? 'bg-gray-200 text-gray-500'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {m.breakfastStatus === 'reserved' ? 'رزرو شده؛ لغو رزرو' :
                          m.breakfastStatus === 'expired' ? 'منقضی شده' : 'رزرو صبحانه'}
                      </button>
                      {m.breakfastStatus === 'reserved' && (
                        <button
                          type="button"
                          onClick={() => setReceiptMeal(receiptMeal?.id === m.id ? null : m)}
                          className="mr-2 px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 hover:bg-blue-200"
                        >
                          مشاهده رسید
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {m.lunch ? (
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
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

        {receiptMeal && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 shadow-sm" dir="rtl">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-bold text-blue-800">جزئیات رسید رزرو</h3>
              <button
                type="button"
                onClick={() => setReceiptMeal(null)}
                className="text-sm text-blue-700 hover:text-blue-900 font-bold"
              >
                بستن
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
              <p><span className="font-bold">روز:</span> {weekDaysFa[receiptMeal.weekday] || receiptMeal.weekday}</p>
              <p><span className="font-bold">تاریخ:</span> {toJalali(receiptMeal.date)}</p>
              <p><span className="font-bold">وعده:</span> صبحانه</p>
              <p><span className="font-bold">غذا:</span> {receiptMeal.breakfast || '-'}</p>
              <p className="sm:col-span-2 text-green-700 font-bold">وضعیت: رزرو شده</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}