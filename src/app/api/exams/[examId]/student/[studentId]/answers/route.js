import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request, context) {
  const { examId, studentId } = context.params;

  const examIdNum = Number(examId);
  const studentIdNum = Number(studentId);

  if (!examIdNum || !studentIdNum || isNaN(examIdNum) || isNaN(studentIdNum)) {
    return NextResponse.json({ error: 'شناسه آزمون یا دانش‌آموز نامعتبر است' }, { status: 400 });
  }

  try {
    // پاسخ‌های تستی دانش‌آموز
    const quizResult = await prisma.exam_results.findFirst({
      where: { exam_id: examIdNum, student_id: studentIdNum },
      include: {
        student_answers: {
          include: {
            exam_questions: true,
            question_options: true
          }
        }
      }
    });

    // پاسخ‌های فایل (PDF/تصویر) دانش‌آموز
    const fileAnswers = await prisma.exam_file_answers.findMany({
      where: { exam_id: examIdNum, student_id: studentIdNum }
    });

    return NextResponse.json({
      quizResult,
      fileAnswers
    });
  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: error.message || 'خطای ناشناخته' }, { status: 500 });
  }
}