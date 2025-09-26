import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request, context) {
  try {
    const params = await context.params;
    const studentId = Number(params.studentId);

    if (!studentId || isNaN(studentId)) {
      return NextResponse.json({ error: 'شناسه دانش‌آموز نامعتبر است' }, { status: 400 });
    }

    // دریافت نتایج آزمون‌های تستی
    const quizResults = await prisma.exam_results.findMany({
      where: { student_id: studentId },
      include: {
        exams: true
      },
      orderBy: { completed_at: 'desc' }
    });

    // دریافت نتایج آزمون‌های فایلی
    const fileResults = await prisma.exam_file_answers.findMany({
      where: { student_id: studentId },
      include: {
        exams: true
      },
      orderBy: { created_at: 'desc' }
    });

    // ترکیب نتایج
    const allResults = [
      ...quizResults.map(result => ({
        id: result.id,
        type: 'quiz',
        exam: result.exams,
        marks_obtained: result.marks_obtained,
        grade_desc: result.grade_desc,
        teacher_feedback: null,
        completed_at: result.completed_at,
        created_at: result.created_at
      })),
      ...fileResults.map(result => ({
        id: result.id,
        type: 'file',
        exam: result.exams,
        marks_obtained: null,
        grade_desc: result.grade_desc,
        teacher_feedback: result.teacher_feedback,
        completed_at: null,
        created_at: result.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return NextResponse.json({
      success: true,
      results: allResults
    });

  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'خطای ناشناخته' 
    }, { status: 500 });
  }
}