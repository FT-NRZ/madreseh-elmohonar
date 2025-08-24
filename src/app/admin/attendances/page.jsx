'use client';
import React, { useEffect, useState } from 'react';
import moment from 'jalali-moment';
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import jalaali from "jalaali-js";

// تبدیل اعداد فارسی به انگلیسی
function persianToEnglishNumbers(str) {
  const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let result = str;
  for (let i = 0; i < persianNumbers.length; i++) {
    result = result.replace(new RegExp(persianNumbers[i], 'g'), englishNumbers[i]);
  }
  return result;
}

// تبدیل تاریخ جلالی به میلادی
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

// تبدیل میلادی به شمسی برای جدول
function toJalali(dateStr) {
  if (!dateStr) return '';
  const dateOnly = dateStr.split('T')[0];
  return moment(dateOnly, 'YYYY-MM-DD').locale('fa').format('jYYYY/jMM/jDD');
}

export default function AdminAttendancesPage() {
  const [attendances, setAttendances] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({
    student_id: '',
    class_id: '',
    date: '',
    status: 'present',
    reason: '',
    is_justified: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/attendances')
      .then(res => res.ok ? res.json() : Promise.resolve({ attendances: [] }))
      .then(data => setAttendances(data.attendances || []))
      .catch(() => setAttendances([]));

    fetch('/api/students')
      .then(res => res.ok ? res.json() : Promise.resolve({ students: [] }))
      .then(data => setStudents(data.students || []))
      .catch(() => setStudents([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // تبدیل تاریخ شمسی به میلادی قبل از ارسال
    const miladiDate = jalaliToGregorian(form.date);
    const sendForm = { ...form, date: miladiDate };
    const res = await fetch('/api/attendances', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sendForm)
    });
    if (res.ok) {
      const data = await res.json();
      setAttendances([data.attendance, ...attendances]);
      setForm({ student_id: '', class_id: '', date: '', status: 'present', reason: '', is_justified: false });
    } else {
      alert('خطا در ثبت!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-2 sm:p-4">
      <h1 className="text-xl font-bold mb-4 text-center">ثبت حضور و غیاب</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-3 sm:p-6 mb-8 flex flex-col gap-3">
        <select
          className="border rounded p-2"
          value={form.student_id}
          onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
          required
        >
          <option value="">انتخاب دانش‌آموز</option>
          {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
        </select>
        <select
          className="border rounded p-2"
          value={form.class_id}
          onChange={e => setForm(f => ({ ...f, class_id: e.target.value }))}
          required
        >
          <option value="">انتخاب کلاس</option>
          <option value="1">اول ابتدایی</option>
          <option value="2">دوم ابتدایی</option>
          <option value="3">سوم ابتدایی</option>
          <option value="4">چهارم ابتدایی</option>
        </select>
        <DatePicker
          value={form.date}
          onChange={dateObj => {
            if (dateObj) {
              const formattedDate = dateObj.format("YYYY/MM/DD");
              setForm(f => ({ ...f, date: formattedDate }));
            } else {
              setForm(f => ({ ...f, date: '' }));
            }
          }}
          calendar={persian}
          locale={persian_fa}
          calendarPosition="bottom-right"
          inputClass="w-full px-2 py-2 border rounded"
          placeholder="تاریخ شمسی"
          format="YYYY/MM/DD"
          required
        />
        <select
          className="border rounded p-2"
          value={form.status}
          onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
        >
          <option value="present">حاضر</option>
          <option value="absent">غایب</option>
          <option value="late">تاخیر</option>
        </select>
        <input
          type="text"
          className="border rounded p-2"
          placeholder="دلیل (اختیاری)"
          value={form.reason}
          onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.is_justified}
            onChange={e => setForm(f => ({ ...f, is_justified: e.target.checked }))}
          />
          غیبت موجه؟
        </label>
        <button
          type="submit"
          className="bg-green-600 text-white rounded p-2 mt-2"
          disabled={loading}
        >
          {loading ? 'در حال ثبت...' : 'ثبت حضور/غیاب'}
        </button>
      </form>

      <h2 className="font-bold mb-2 text-center">لیست حضور و غیاب</h2>
      {/* جدول برای دسکتاپ */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm bg-white rounded-xl shadow">
          <thead>
            <tr className="bg-green-50">
              <th className="p-2">دانش‌آموز</th>
              <th className="p-2">کلاس</th>
              <th className="p-2">تاریخ</th>
              <th className="p-2">وضعیت</th>
              <th className="p-2">موجه</th>
              <th className="p-2">دلیل</th>
            </tr>
          </thead>
          <tbody>
            {attendances.map(a => (
              <tr key={a.id} className="hover:bg-green-50 transition">
                <td className="p-2">{a.student?.firstName} {a.student?.lastName}</td>
                <td className="p-2">{a.class?.name}</td>
                <td className="p-2">{toJalali(a.date)}</td>
                <td className="p-2">{a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : 'تاخیر'}</td>
                <td className="p-2">{a.is_justified ? 'بله' : 'خیر'}</td>
                <td className="p-2">{a.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* کارت برای موبایل */}
      <div className="sm:hidden flex flex-col gap-3">
        {attendances.length === 0 && (
          <div className="text-center text-gray-400 py-8">حضور و غیابی ثبت نشده است.</div>
        )}
        {attendances.map(a => (
          <div key={a.id} className="bg-white rounded-xl shadow p-3 flex flex-col gap-2 border border-green-100">
            <div className="flex justify-between items-center">
              <span className="font-bold text-green-700">{a.student?.firstName} {a.student?.lastName}</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{a.class?.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>تاریخ: <b>{toJalali(a.date)}</b></span>
              <span>وضعیت: <b className={
                a.status === 'present' ? 'text-green-600' :
                a.status === 'absent' ? 'text-red-600' : 'text-yellow-600'
              }>
                {a.status === 'present' ? 'حاضر' : a.status === 'absent' ? 'غایب' : 'تاخیر'}
              </b></span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span>موجه: <b>{a.is_justified ? 'بله' : 'خیر'}</b></span>
              {a.reason && <span>دلیل: <b>{a.reason}</b></span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}