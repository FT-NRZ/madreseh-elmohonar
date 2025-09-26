'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jalaali from 'jalaali-js';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import toast from 'react-hot-toast';

const weekDays = [
  { key: 'saturday', label: 'شنبه' },
  { key: 'sunday', label: 'یکشنبه' },
  { key: 'monday', label: 'دوشنبه' },
  { key: 'tuesday', label: 'سه‌شنبه' },
  { key: 'wednesday', label: 'چهارشنبه' }
];

function persianToEnglishNumbers(str) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
}

function jalaliToGregorian(jalaliDate) {
  if (!jalaliDate) return '';
  try {
    let cleanDate = jalaliDate.toString().replace(/^j/, '');
    cleanDate = persianToEnglishNumbers(cleanDate);
    const [jy, jm, jd] = cleanDate.split('/').map(Number);
    if (!jy || !jm || !jd || jm < 1 || jm > 12 || jd < 1 || jd > 31) return '';
    const gregorianDate = jalaali.toGregorian(jy, jm, jd);
    if (!gregorianDate.gy || !gregorianDate.gm || !gregorianDate.gd) return '';
    return `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

function toJalali(dateStr) {
  if (!dateStr) return '';
  const [gy, gm, gd] = dateStr.split('-').map(Number);
  if (!gy || !gm || !gd || isNaN(gy) || isNaN(gm) || isNaN(gd) || gy < 1000) return '';
  const { jy, jm, jd } = jalaali.toJalaali(gy, gm, gd);
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

const weekDaysFa = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه'
};

function FoodScheduleAdmin() {
  const router = useRouter();
  const [schedules, setSchedules] = useState([]);
  const [weekFood, setWeekFood] = useState(() =>
    weekDays.reduce((acc, day) => {
      acc[day.key] = { date: '', breakfast: '', lunch: '' };
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/food-schedule`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSchedules(data.schedules || []);
        }
      } else {
        toast.error('خطا در دریافت برنامه‌های غذایی!');
      }
    } catch (error) {
      toast.error('ارتباط با سرور برقرار نشد!');
    }
    setLoading(false);
  };

  const handleChange = (dayKey, type, value) => {
    setWeekFood(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [type]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    try {
      for (const day of weekDays) {
        const { breakfast, lunch, date } = weekFood[day.key];
        const miladiDate = jalaliToGregorian(date);
        if ((breakfast || lunch) && date) {
          try {
            const response = await fetch('/api/admin/food-schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: miladiDate,
                weekday: day.key,
                breakfast: breakfast || null,
                lunch: lunch || null
              })
            });
            const result = await response.json();
            if (response.ok && result.success) {
              successCount++;
            } else {
              errorCount++;
              errors.push(`خطا در ثبت ${day.label}: ${result.message || 'خطای نامشخص'}`);
            }
          } catch {
            errorCount++;
            errors.push(`خطا در ثبت ${day.label}`);
          }
        }
      }
      await fetchSchedules();
      if (successCount > 0 && errorCount === 0) {
        toast.success(`${successCount} روز با موفقیت ثبت شد`);
        setWeekFood(weekDays.reduce((acc, day) => {
          acc[day.key] = { date: '', breakfast: '', lunch: '' };
          return acc;
        }, {}));
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`${successCount} روز ثبت شد`);
        toast.error(`${errorCount} روز با خطا مواجه شد:\n${errors.join('\n')}`);
      } else if (errorCount > 0) {
        toast.error(`تمام روزها با خطا مواجه شدند:\n${errors.join('\n')}`);
      } else {
        toast('لطفاً حداقل یک وعده غذایی وارد کنید', { icon: '🍽️' });
      }
    } catch {
      toast.error('خطای کلی در ثبت برنامه غذایی');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    toast.loading('در حال حذف...');
    try {
      const response = await fetch('/api/admin/food-schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      toast.dismiss();
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchSchedules();
          toast.success('برنامه غذایی حذف شد');
        } else {
          toast.error('خطا در حذف برنامه غذایی');
        }
      } else {
        toast.error('خطا در حذف برنامه غذایی');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('ارتباط با سرور برقرار نشد!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-6 relative">
      {/* دکمه بازگشت فقط موبایل */}
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-5 mb-4 sm:mb-6 border-t-4 border-green-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="w-full text-center sm:text-right">
            <h1 className="text-lg sm:text-xl font-bold text-green-700 mb-1 sm:mb-0">مدیریت برنامه غذایی هفتگی</h1>
            <p className="text-xs sm:text-sm text-gray-600">انتخاب تاریخ (شمسی)، صبحانه و ناهار برای هر روز هفته</p>
          </div>
        </div>

        {/* فرم برنامه غذایی هفته */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-2 sm:mb-4">برنامه غذایی هفته</h2>
          {/* جدول فقط در دسکتاپ */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full border border-green-200 rounded-lg text-xs sm:text-sm">
              <thead>
                <tr>
                  <th className="p-2 border-b">روز</th>
                  <th className="p-2 border-b">تاریخ (شمسی)</th>
                  <th className="p-2 border-b">صبحانه</th>
                  <th className="p-2 border-b">ناهار</th>
                </tr>
              </thead>
              <tbody>
                {weekDays.map(day => (
                  <tr key={day.key}>
                    <td className="p-2 border-b font-bold">{day.label}</td>
                    <td className="p-2 border-b">
                      <DatePicker
                        value={weekFood[day.key].date ? weekFood[day.key].date : null}
                        onChange={dateObj => {
                          if (dateObj) {
                            const formattedDate = dateObj.format("YYYY/MM/DD");
                            handleChange(day.key, 'date', formattedDate);
                          } else {
                            handleChange(day.key, 'date', '');
                          }
                        }}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        inputClass="w-full px-2 py-1 border border-green-300 rounded text-xs"
                        placeholder="تاریخ"
                        format="YYYY/MM/DD"
                      />
                    </td>
                    <td className="p-2 border-b">
                      <input
                        type="text"
                        value={weekFood[day.key].breakfast}
                        onChange={e => handleChange(day.key, 'breakfast', e.target.value)}
                        className="w-full px-2 py-1 border border-green-300 rounded text-xs"
                        placeholder="صبحانه را وارد کنید"
                      />
                    </td>
                    <td className="p-2 border-b">
                      <input
                        type="text"
                        value={weekFood[day.key].lunch}
                        onChange={e => handleChange(day.key, 'lunch', e.target.value)}
                        className="w-full px-2 py-1 border border-green-300 rounded text-xs"
                        placeholder="ناهار را وارد کنید"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* کارت‌ها فقط در موبایل */}
          <div className="sm:hidden flex flex-col gap-3">
            {weekDays.map(day => (
              <div key={day.key} className="border rounded-lg p-2 shadow-sm bg-green-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-green-700">{day.label}</span>
                  <DatePicker
                    value={weekFood[day.key].date ? weekFood[day.key].date : null}
                    onChange={dateObj => {
                      if (dateObj) {
                        const formattedDate = dateObj.format("YYYY/MM/DD");
                        handleChange(day.key, 'date', formattedDate);
                      } else {
                        handleChange(day.key, 'date', '');
                      }
                    }}
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="w-full px-2 py-1 border border-green-300 rounded text-xs"
                    placeholder="تاریخ شمسی"
                    format="YYYY/MM/DD"
                  />
                </div>
                <input
                  type="text"
                  value={weekFood[day.key].breakfast}
                  onChange={e => handleChange(day.key, 'breakfast', e.target.value)}
                  className="w-full px-2 py-1 border border-green-300 rounded text-xs mb-2"
                  placeholder="صبحانه را وارد کنید"
                />
                <input
                  type="text"
                  value={weekFood[day.key].lunch}
                  onChange={e => handleChange(day.key, 'lunch', e.target.value)}
                  className="w-full px-2 py-1 border border-green-300 rounded text-xs"
                  placeholder="ناهار را وارد کنید"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 sm:mt-6">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-bold text-base sm:text-lg transition-all hover:scale-105 shadow-lg"
            >
              {submitting ? 'در حال ثبت...' : 'ثبت برنامه غذایی هفته'}
            </button>
          </div>
        </div>

        {/* نمایش لیست برنامه‌های غذایی هفته */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-2 sm:mb-4">لیست برنامه‌های غذایی ثبت شده</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-4">🍽️</div>
              <p>هیچ برنامه غذایی ثبت نشده است</p>
            </div>
          ) : (
            <>
              {/* جدول در دسکتاپ */}
              <table className="hidden sm:table w-full text-xs sm:text-sm border">
                <thead>
                  <tr className="bg-green-50 text-green-700">
                    <th className="py-2 px-2 border">روز</th>
                    <th className="py-2 px-2 border">تاریخ (شمسی)</th>
                    <th className="py-2 px-2 border">صبحانه</th>
                    <th className="py-2 px-2 border">ناهار</th>
                    <th className="py-2 px-2 border">حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((m) => (
                    <tr key={m.id} className="border-b last:border-b-0">
                      <td className="py-2 px-2 border font-bold">{weekDaysFa[m.weekday]}</td>
                      <td className="py-2 px-2 border">{toJalali(m.date)}</td>
                      <td className="py-2 px-2 border">{m.breakfast || '-'}</td>
                      <td className="py-2 px-2 border">{m.lunch || '-'}</td>
                      <td className="py-2 px-2 border">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* کارت‌ها در موبایل */}
              <div className="sm:hidden flex flex-col gap-3">
                {schedules.map((m) => (
                  <div key={m.id} className="border rounded-lg p-2 shadow-sm bg-green-50 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-700">{weekDaysFa[m.weekday]}</span>
                      <span className="text-xs text-gray-500">{toJalali(m.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-600">صبحانه:</span>
                      <span>{m.breakfast || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-gray-600">ناهار:</span>
                      <span>{m.lunch || '-'}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs mt-1 self-end"
                    >
                      حذف
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodScheduleAdmin;