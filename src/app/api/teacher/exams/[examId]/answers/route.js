import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request, context) {
  const { examId } = await context.params; // ← این خط مهم است

  const examIdNum = Number(examId);

  if (!examIdNum || isNaN(examIdNum)) {
    return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
  }

  try {
    const quizAnswers = await prisma.exam_results.findMany({
      where: { exam_id: examIdNum },
      include: {
        students: true,
        student_answers: {
          include: {
            exam_questions: true,
            question_options: true
          }
        }
      }
    });

    const fileAnswers = await prisma.exam_file_answers.findMany({
      where: { exam_id: examIdNum },
      include: { students: true }
    });

    return NextResponse.json({
      quizAnswers,
      fileAnswers
    });
  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: error.message || 'خطای ناشناخته' }, { status: 500 });
  }
}