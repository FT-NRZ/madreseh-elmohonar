import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { resultId } = params;
    
    // احراز هویت
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'دسترسی معلم لازم است' }, { status: 403 });
    }

    const body = await request.json();
    const { grade_desc, marks_obtained } = body;

    console.log('🔄 Updating exam result:', { resultId, grade_desc, marks_obtained });

    // بروزرسانی نتیجه آزمون تستی
    const updatedResult = await prisma.exam_results.update({
      where: { id: parseInt(resultId) },
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