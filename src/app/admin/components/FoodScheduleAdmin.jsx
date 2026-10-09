'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jalaali from 'jalaali-js';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import toast from 'react-hot-toast';
import { Pencil, Trash2, Check, X } from 'lucide-react';

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
  const normalized = String(dateStr).includes('T') ? String(dateStr).split('T')[0] : String(dateStr);
  const [gy, gm, gd] = normalized.split('-').map(Number);
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
      acc[day.key] = { date: '', breakfasts: ['', '', ''], lunch: '' };
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null); // { id, field, value }
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [reservationDate, setReservationDate] = useState('');
  const [reservationGregorianDate, setReservationGregorianDate] = useState('');
  const [reservationGradeId, setReservationGradeId] = useState('');
  const [classes, setClasses] = useState([]);
  const [reservationStudents, setReservationStudents] = useState([]);
  const [reservationInfo, setReservationInfo] = useState(null);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/classes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (response.ok) setClasses(data.classes || []);
    } catch {}
  };

  const fetchReservations = async () => {
    if (!reservationGregorianDate) {
      toast('ابتدا تاریخ را انتخاب کنید', { icon: '📅' });
      return;
    }
    setReservationLoading(true);
    try {
      const params = new URLSearchParams({ date: reservationGregorianDate });
      if (reservationGradeId) params.set('gradeId', reservationGradeId);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/food-reservations?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'خطا در دریافت وضعیت رزرو');
      setReservationStudents((data.students || []).filter(student => student.status === 'reserved'));
      setReservationInfo(data);
    } catch (error) {
      setReservationStudents([]);
      setReservationInfo(null);
      toast.error(error.message || 'خطا در دریافت وضعیت رزرو');
    } finally {
      setReservationLoading(false);
    }
  };

  const fetchSchedules = async (fromJalali = filterFrom, toJalali = filterTo) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const fromG = fromJalali ? jalaliToGregorian(fromJalali) : '';
      const toG = toJalali ? jalaliToGregorian(toJalali) : '';
      if (fromG) params.set('from', fromG);
      if (toG) params.set('to', toG);
      const res = await fetch(`/api/admin/food-schedule${params.toString() ? `?${params.toString()}` : ''}`);
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

  const handleBreakfastChange = (dayKey, index, value) => {
    setWeekFood(prev => {
      const breakfasts = [...prev[dayKey].breakfasts];
      breakfasts[index] = value;
      return {
        ...prev,
        [dayKey]: { ...prev[dayKey], breakfasts }
      };
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    try {
      for (const day of weekDays) {
        const { breakfasts, lunch, date } = weekFood[day.key];
        const miladiDate = jalaliToGregorian(date);
        if ((breakfasts.some(b => b.trim()) || lunch) && date) {
          try {
            const response = await fetch('/api/admin/food-schedule', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: miladiDate,
                weekday: day.key,
                breakfasts,
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
          acc[day.key] = { date: '', breakfasts: ['', '', ''], lunch: '' };
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

  const patchMeal = async (id, field, value) => {
    try {
      const response = await fetch('/api/admin/food-schedule', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, field, value })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success(value ? 'وعده به‌روزرسانی شد' : 'وعده حذف شد');
        await fetchSchedules();
      } else {
        toast.error(data.message || 'خطا در انجام عملیات');
      }
    } catch {
      toast.error('ارتباط با سرور برقرار نشد!');
    }
  };

  const saveMealEdit = async () => {
    if (!editingMeal) return;
    await patchMeal(editingMeal.id, editingMeal.field, editingMeal.value);
    setEditingMeal(null);
  };

  const handleMealDelete = async (schedule, field) => {
    if (!window.confirm('آیا از حذف این وعده مطمئن هستید؟')) return;
    await patchMeal(schedule.id, field, null);
  };

  const renderMealCell = (schedule, field, value) => {
    const isEditing = editingMeal?.id === schedule.id && editingMeal?.field === field;
    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            value={editingMeal.value}
            onChange={e => setEditingMeal(prev => ({ ...prev, value: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') saveMealEdit(); if (e.key === 'Escape') setEditingMeal(null); }}
            className="w-full min-w-20 px-1 py-0.5 border border-green-400 rounded text-xs"
          />
          <button onClick={saveMealEdit} className="text-green-600 hover:text-green-800 shrink-0" title="ذخیره">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => setEditingMeal(null)} className="text-gray-500 hover:text-gray-700 shrink-0" title="انصراف">
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-1">
        <span className="flex-1">{value || <span className="text-gray-400">-</span>}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setEditingMeal({ id: schedule.id, field, value: value || '' })}
            className="text-blue-500 hover:text-blue-700"
            title="ویرایش"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {value && (
            <button
              onClick={() => handleMealDelete(schedule, field)}
              className="text-red-500 hover:text-red-700"
              title="حذف این وعده"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
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
                  <th className="p-2 border-b">صبحانه (۳ گزینه)</th>
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
                      <div className="flex flex-col gap-1">
                        {[0, 1, 2].map(i => (
                          <input
                            key={i}
                            type="text"
                            value={weekFood[day.key].breakfasts[i]}
                            onChange={e => handleBreakfastChange(day.key, i, e.target.value)}
                            className="w-full px-2 py-1 border border-green-300 rounded text-xs"
                            placeholder={`گزینه صبحانه ${['۱', '۲', '۳'][i]}`}
                          />
                        ))}
                      </div>
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
                <div className="flex flex-col gap-1 mb-2">
                  {[0, 1, 2].map(i => (
                    <input
                      key={i}
                      type="text"
                      value={weekFood[day.key].breakfasts[i]}
                      onChange={e => handleBreakfastChange(day.key, i, e.target.value)}
                      className="w-full px-2 py-1 border border-green-300 rounded text-xs"
                      placeholder={`گزینه صبحانه ${['۱', '۲', '۳'][i]}`}
                    />
                  ))}
                </div>
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

          {/* فیلتر بازه تاریخ شمسی */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:items-end">
            <div className="flex-1">
              <label className="text-xs text-gray-600 block mb-1">از تاریخ (شمسی)</label>
              <DatePicker
                value={filterFrom || null}
                onChange={dateObj => setFilterFrom(dateObj ? dateObj.format("YYYY/MM/DD") : '')}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-2 py-1 border border-green-300 rounded text-xs"
                placeholder="مثلاً ۱۴۰۵/۰۷/۰۱"
                format="YYYY/MM/DD"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-600 block mb-1">تا تاریخ (شمسی)</label>
              <DatePicker
                value={filterTo || null}
                onChange={dateObj => setFilterTo(dateObj ? dateObj.format("YYYY/MM/DD") : '')}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                inputClass="w-full px-2 py-1 border border-green-300 rounded text-xs"
                placeholder="مثلاً ۱۴۰۵/۰۸/۰۱"
                format="YYYY/MM/DD"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchSchedules()}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
              >
                اعمال فیلتر
              </button>
              <button
                onClick={() => { setFilterFrom(''); setFilterTo(''); fetchSchedules('', ''); }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold"
              >
                حذف فیلتر
              </button>
            </div>
          </div>
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
                    <th className="py-2 px-2 border">صبحانه ۱</th>
                    <th className="py-2 px-2 border">صبحانه ۲</th>
                    <th className="py-2 px-2 border">صبحانه ۳</th>
                    <th className="py-2 px-2 border">ناهار</th>
                    <th className="py-2 px-2 border">حذف روز</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((m) => (
                    <tr key={m.id} className="border-b last:border-b-0">
                      <td className="py-2 px-2 border font-bold">{weekDaysFa[m.weekday]}</td>
                      <td className="py-2 px-2 border whitespace-nowrap">{toJalali(m.date)}</td>
                      {['breakfast_1', 'breakfast_2', 'breakfast_3', 'lunch'].map(field => (
                        <td key={field} className="py-2 px-2 border min-w-32">
                          {renderMealCell(m, field, m[field])}
                        </td>
                      ))}
                      <td className="py-2 px-2 border">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs"
                        >
                          حذف روز
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* کارت‌ها در موبایل */}
              <div className="sm:hidden flex flex-col gap-3">
                {schedules.map((m) => (
                  <div key={m.id} className="border rounded-lg p-2 shadow-sm bg-green-50 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-green-700">{weekDaysFa[m.weekday]}</span>
                      <span className="text-xs text-gray-500">{toJalali(m.date)}</span>
                    </div>
                    {[['breakfast_1', 'صبحانه ۱'], ['breakfast_2', 'صبحانه ۲'], ['breakfast_3', 'صبحانه ۳'], ['lunch', 'ناهار']].map(([field, label]) => (
                      <div key={field} className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-600 w-14 shrink-0">{label}:</span>
                        <div className="flex-1">{renderMealCell(m, field, m[field])}</div>
                      </div>
                    ))}
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs mt-1 self-end"
                    >
                      حذف کل روز
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-6 mt-4 sm:mt-6">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-4">وضعیت رزرو صبحانه دانش‌آموزان</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <DatePicker
              value={reservationDate ? reservationDate : null}
              onChange={dateObj => {
                if (dateObj) {
                  const formattedDate = dateObj.format("YYYY/MM/DD");
                  setReservationDate(formattedDate);
                  setReservationGregorianDate(jalaliToGregorian(formattedDate));
                  setReservationStudents([]);
                  setReservationInfo(null);
                } else {
                  setReservationDate('');
                  setReservationGregorianDate('');
                  setReservationStudents([]);
                  setReservationInfo(null);
                }
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass="w-full border border-green-300 rounded-lg px-3 py-2 text-sm"
              placeholder="تاریخ (شمسی)"
              format="YYYY/MM/DD"
            />
            <select
              value={reservationGradeId}
              onChange={event => {
                setReservationGradeId(event.target.value);
                setReservationStudents([]);
                setReservationInfo(null);
              }}
              className="border border-green-300 rounded-lg px-3 py-2"
            >
              <option value="">انتخاب پایه</option>
              {[...new Map(classes.map(classItem => [classItem.grade_id, classItem.grade_name])).entries()]
                .filter(([gradeId]) => gradeId)
                .map(([gradeId, gradeName]) => (
                  <option key={gradeId} value={gradeId}>{gradeName}</option>
                ))}
            </select>
            <button
              onClick={fetchReservations}
              disabled={reservationLoading || !reservationGregorianDate || !reservationGradeId}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg px-4 py-2 font-bold"
            >
              {reservationLoading ? 'در حال دریافت...' : 'مشاهده رزروی‌ها'}
            </button>
          </div>

          {reservationInfo && (
            <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-800">
              گزینه‌های صبحانه: {reservationInfo.schedule?.breakfasts?.join('، ') || '-'} | ناهار: {reservationInfo.schedule?.lunch || '-'}
              {' | '}
              وضعیت: {reservationInfo.breakfastStatus === 'expired' ? 'منقضی شده' : reservationInfo.breakfastStatus === 'open' ? 'قابل رزرو' : 'ثبت نشده'}
            </div>
          )}

          {reservationGregorianDate && reservationGradeId && !reservationLoading && reservationStudents.length === 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
              برای این تاریخ و پایه، رزروی ثبت نشده است.
            </div>
          )}

          {reservationStudents.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-green-200">
                <thead className="bg-green-50 text-green-700">
                  <tr>
                    <th className="p-2 border">نام دانش‌آموز</th>
                    <th className="p-2 border">کد ملی</th>
                    <th className="p-2 border">کلاس</th>
                    <th className="p-2 border">صبحانه رزرو شده</th>
                    <th className="p-2 border">وضعیت صبحانه</th>
                  </tr>
                </thead>
                <tbody>
                  {reservationStudents.map(student => (
                    <tr key={student.id} className="border-b">
                      <td className="p-2 border">{student.firstName} {student.lastName}</td>
                      <td className="p-2 border">{student.nationalCode || '-'}</td>
                      <td className="p-2 border">{student.className}</td>
                      <td className="p-2 border">{student.reservedOption || '-'}</td>
                      <td className="p-2 border">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          student.status === 'reserved' ? 'bg-green-100 text-green-700' :
                          student.status === 'expired' ? 'bg-gray-200 text-gray-600' :
                          student.status === 'unavailable' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {student.status === 'reserved' ? 'رزرو شده' :
                            student.status === 'expired' ? 'منقضی شده' :
                            student.status === 'unavailable' ? 'صبحانه ثبت نشده' : 'رزرو نشده'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FoodScheduleAdmin;