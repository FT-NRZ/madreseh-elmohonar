import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { resultId } = await params;
    const id = Number(resultId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: 'شناسه نتیجه نامعتبر است' }, { status: 400 });
    }
    
    // احراز هویت
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'دسترسی معلم لازم است' }, { status: 403 });
    }

    const userId = Number(decoded.user_id ?? decoded.uid ?? decoded.userId ?? decoded.id ?? decoded.sub);
    const teacher = await prisma.teachers.findUnique({
      where: { user_id: userId },
      select: { id: true }
    });
    if (!teacher) return NextResponse.json({ error: 'اطلاعات معلم یافت نشد' }, { status: 404 });

    const existingResult = await prisma.exam_results.findUnique({
      where: { id },
      select: { id: true, exam_id: true }
    });
    if (!existingResult) return NextResponse.json({ success: false, error: 'نتیجه آزمون یافت نشد' }, { status: 404 });

    const ownedExam = await prisma.exams.findFirst({
      where: { id: existingResult.exam_id, teacher_id: teacher.id },
      select: { id: true }
    });
    if (!ownedExam) return NextResponse.json({ success: false, error: 'دسترسی به این نتیجه مجاز نیست' }, { status: 403 });

    const body = await request.json();
    const { grade_desc, marks_obtained } = body;

    console.log('🔄 Updating exam result:', { resultId, grade_desc, marks_obtained });

    // بروزرسانی نتیجه آزمون تستی
    const updatedResult = await prisma.exam_results.update({
      where: { id },
      data: {
        grade_desc,
        marks_obtained: marks_obtained ? parseFloat(marks_obtained) : undefined,
        updated_at: new Date()
      },
      include: {
        students: { include: { users: true } },
        exams: true
      }
    });

    console.log('✅ Exam result updated successfully:', updatedResult);

    return NextResponse.json({
      success: true,
      result: updatedResult,
      message: 'نمره با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('💥 Error updating exam result:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'خطا در ثبت نمره'
    }, { status: 500 });
  }
}