import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { answerId } = await params;
    const id = Number(answerId);
    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ success: false, error: 'شناسه پاسخ نامعتبر است' }, { status: 400 });
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

    const body = await request.json();
    const { grade_desc, teacher_feedback } = body;

    console.log('🔄 Updating file answer:', { answerId, grade_desc, teacher_feedback });

    // بررسی وجود رکورد قبل از بروزرسانی
    const existingAnswer = await prisma.exam_file_answers.findUnique({
      where: { id },
      select: { id: true, exam_id: true }
    });

    if (!existingAnswer) {
      return NextResponse.json({ 
        success: false, 
        error: 'پاسخ فایلی یافت نشد' 
      }, { status: 404 });
    }

    const ownedExam = await prisma.exams.findFirst({
      where: { id: existingAnswer.exam_id, teacher_id: teacher.id },
      select: { id: true }
    });
    if (!ownedExam) return NextResponse.json({ success: false, error: 'دسترسی به این پاسخ مجاز نیست' }, { status: 403 });

    // بروزرسانی پاسخ فایلی
    const updatedAnswer = await prisma.exam_file_answers.update({
      where: { id },
      data: {
        grade_desc,
        teacher_feedback
        // حذف updated_at چون ممکن است در schema وجود نداشته باشد
      },
      include: {
        students: {
          include: {
            users: true
          }
        },
        exams: true
      }
    });

    console.log('✅ File answer updated successfully:', updatedAnswer);

    return NextResponse.json({
      success: true,
      result: updatedAnswer,
      message: 'بازخورد با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('💥 Error updating file answer:', error);
    
    // بررسی نوع خطا
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        error: 'رکورد یافت نشد'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'خطا در ثبت بازخورد'
    }, { status: 500 });
  }
}