import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function PUT(request, context) {
  try {
    const { resultId } = await context.params;
    const id = Number(resultId);
    
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ 
        success: false,
        error: 'شناسه نتیجه نامعتبر است' 
      }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { grade_desc } = body;

    if (!grade_desc || typeof grade_desc !== 'string') {
      return NextResponse.json({ 
        success: false,
        error: 'نمره توصیفی الزامی است' 
      }, { status: 400 });
    }

    // بررسی وجود رکورد
    const existingResult = await prisma.exam_results.findUnique({
      where: { id }
    });

    if (!existingResult) {
      return NextResponse.json({ 
        success: false,
        error: 'نتیجه آزمون پیدا نشد' 
      }, { status: 404 });
    }

    // به‌روزرسانی نمره
    const updatedResult = await prisma.exam_results.update({
      where: { id },
      data: { 
        grade_desc: grade_desc.trim()
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

    console.log(`✅ Updated grade for result ${id}: ${grade_desc}`);

    return NextResponse.json({ 
      success: true,
      result: updatedResult,
      message: 'نمره با موفقیت ثبت شد'
    });

  } catch (error) {
    console.error('PUT /exam-results/[id] error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'خطا در ثبت نمره' 
    }, { status: 500 });
  }
}
