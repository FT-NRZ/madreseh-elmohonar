'use client'
import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';

export default function ReportCardList({ studentId }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch(`/api/student/${studentId}/report-cards`);
        const data = await res.json();
        setReports(data.reports || []);
      } catch {
        setReports([]);
      }
    }
    fetchReports();
  }, [studentId]);

  if (!reports.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        کارنامه‌ها
      </h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-green-50 text-green-700">
            <th className="py-2 px-2">درس</th>
            <th className="py-2 px-2">نمره</th>
            <th className="py-2 px-2">ترم</th>
            <th className="py-2 px-2">سال</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="py-2 px-2">{r.subject}</td>
              <td className="py-2 px-2">{r.score}</td>
              <td className="py-2 px-2">{r.term}</td>
              <td className="py-2 px-2">{r.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}