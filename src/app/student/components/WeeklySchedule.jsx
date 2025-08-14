'use client'
import React, { useEffect, useState } from 'react';
import { CalendarDays } from 'lucide-react';

export default function WeeklySchedule({ studentId }) {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        const res = await fetch(`/api/student/${studentId}/schedule`);
        const data = await res.json();
        setSchedule(data.schedule || []);
      } catch {
        setSchedule([]);
      }
    }
    fetchSchedule();
  }, [studentId]);

  if (!schedule.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <CalendarDays className="w-6 h-6" />
        برنامه هفتگی
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50 text-green-700">
            <th className="py-2 px-2">روز</th>
            <th className="py-2 px-2">درس</th>
            <th className="py-2 px-2">معلم</th>
            <th className="py-2 px-2">ساعت</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="py-2 px-2">{item.day}</td>
              <td className="py-2 px-2">{item.subject}</td>
              <td className="py-2 px-2">{item.teacher}</td>
              <td className="py-2 px-2">{item.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}