'use client'
import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function SuggestionForm({ studentId }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    try {
      await fetch(`/api/student/${studentId}/suggestion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      setText('');
      setSuccess(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow border border-green-100 p-6 mb-6">
      <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-2">
        <Send className="w-6 h-6" />
        ارسال نظر / پیشنهاد / شکایت
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="border rounded p-3 bg-green-50"
          placeholder="متن خود را بنویسید..."
          rows={3}
          required
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          disabled={loading}
        >
          {loading ? 'در حال ارسال...' : 'ارسال'}
        </button>
        {success && <div className="text-green-600 text-sm">با موفقیت ارسال شد.</div>}
      </form>
    </div>
  );
}