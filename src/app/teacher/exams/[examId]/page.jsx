'use client'
import { useParams } from 'next/navigation'
import ExamResults from '../../components/ExamResults'

export default function ExamResultsPage() {
  const { examId } = useParams();
  const examIdNum = Number(examId);
  if (!examIdNum || isNaN(examIdNum)) {
    return <div>آزمون انتخاب نشده است.</div>;
  }
  return <ExamResults examId={examIdNum} />;
}