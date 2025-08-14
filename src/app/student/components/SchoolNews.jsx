'use client'
import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';

export default function SchoolNews({ studentId }) {
  const [news, setNews] = useState([]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/student/${studentId}/school-news`);
        const data = await res.json();
        setNews(data.news || []);
      } catch {
        setNews([]);
      }
    }
    fetchNews();
  }, [studentId]);

  if (!news.length) return null;

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <Megaphone className="w-6 h-6" />
        اخبار مدرسه
      </h2>
      <ul className="space-y-2">
        {news.map((item, idx) => (
          <li key={idx} className="border-b last:border-b-0 py-2">
            <div className="font-bold text-gray-700">{item.title}</div>
            <div className="text-xs text-gray-500">{item.date}</div>
            <div className="text-sm text-gray-600">{item.content}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}