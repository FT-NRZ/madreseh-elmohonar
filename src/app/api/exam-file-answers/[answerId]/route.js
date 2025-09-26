import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function PUT(request, context) {
  try {
    const { answerId } = await context.params;
    const id = Number(answerId);
    
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ 
        success: false,
        error: 'شناسه پاسخ نامعتبر است' 
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { grade_desc, teacher_feedback } = body;

    if (!grade_desc || typeof grade_desc !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: 'نمره توصیفی الزامی است' 
      }, { status: 400 });
    }

    // بررسی وجود رکورد
    const existingAnswer = await prisma.exam_file_answers.findUnique({
      where: { id }
    });

    if (!existingAnswer) {
      return NextResponse.json({ 
        success: false,
        error: 'پاسخ فایلی پیدا نشد' 
      }, { status: 404 });
    }

    // به‌روزرسانی نمره و بازخورد
    const updatedAnswer = await prisma.exam_file_answers.update({
      where: { id },
      data: { 
        grade_desc: grade_desc.trim(),
        teacher_feedback: teacher_feedback ? teacher_feedback.trim() : null
      },
      include: {
        students: {
          include: {
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ Updated file answer ${id}: grade=${grade_desc}, feedback=${teacher_feedback || 'none'}`);

    return NextResponse.json({ 
      success: true,
      answer: updatedAnswer,
      message: 'بازخورد با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('PUT /exam-file-answers/[id] error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'خطا در ثبت بازخورد' 
    }, { status: 500 });
  }
}
