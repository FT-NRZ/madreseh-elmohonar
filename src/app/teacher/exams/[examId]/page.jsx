'use client';
import { use } from 'react';
import ExamResults from '@/app/teacher/components/ExamResults';

export default function ExamPage({ params }) {
  const { examId } = use(params);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-green-700 mb-6">نتایج آزمون شماره {examId}</h1>
      <ExamResults examId={examId} />
    </div>
  );
}