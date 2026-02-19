import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
  try {
    const { answerId } = params; // تغییر از id به answerId
    
    console.log('🔍 Received params:', params);
    console.log('🔍 answerId:', answerId);
    
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
    const { grade_desc, teacher_feedback } = body;

    console.log('🔄 Updating file answer:', { answerId, grade_desc, teacher_feedback });

    // بررسی وجود رکورد قبل از بروزرسانی
    const existingAnswer = await prisma.exam_file_answers.findUnique({
      where: { id: parseInt(answerId) }
    });

    if (!existingAnswer) {
      return NextResponse.json({ 
        success: false, 
        error: 'پاسخ فایلی یافت نشد' 
      }, { status: 404 });
    }

    // بروزرسانی پاسخ فایلی
    const updatedAnswer = await prisma.exam_file_answers.update({
      where: { id: parseInt(answerId) },
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