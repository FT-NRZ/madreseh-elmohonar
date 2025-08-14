'use client'
import React, { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarX2, Clock, Loader2 } from 'lucide-react';

export default function AttendanceList({ studentId }) {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      setLoading(true);
      try {
        const res = await fetch(`/api/student/${studentId}/attendance`);
        const data = await res.json();
        setAttendances(data.attendances || []);
      } catch {
        setAttendances([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="animate-spin w-8 h-8 text-green-600" />
      </div>
    );
  }

  if (!attendances.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        <CalendarX2 className="mx-auto mb-2 w-8 h-8" />
        هیچ حضور و غیابی ثبت نشده است.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <CalendarCheck2 className="w-6 h-6" />
        لیست حضور و غیاب
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50 text-green-700">
            <th className="py-2 px-2 rounded-tl-xl">تاریخ</th>
            <th className="py-2 px-2">وضعیت</th>
            <th className="py-2 px-2">ساعت ورود</th>
            <th className="py-2 px-2">یادداشت</th>
            <th className="py-2 px-2 rounded-tr-xl">علت غیبت</th>
          </tr>
        </thead>
        <tbody>
          {attendances.map((a) => (
            <tr key={a.id} className="border-b last:border-b-0">
              <td className="py-2 px-2 font-mono">{a.date}</td>
              <td className="py-2 px-2">
                {a.status === 'present' && <span className="px-2 py-1 rounded bg-green-100 text-green-700">حاضر</span>}
                {a.status === 'absent' && <span className="px-2 py-1 rounded bg-red-100 text-red-700">غایب</span>}
                {a.status === 'late' && <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-700">تاخیر</span>}
                {a.status === 'excused' && <span className="px-2 py-1 rounded bg-blue-100 text-blue-700">موجه</span>}
              </td>
              <td className="py-2 px-2">{a.arrivalTime || '-'}</td>
              <td className="py-2 px-2">{a.note || '-'}</td>
              <td className="py-2 px-2">{a.absenceReason || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}