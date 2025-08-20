import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const gradeId = searchParams.get('gradeId');

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: 'شناسه معلم ارسال نشده است' },
        { status: 400 }
      );
    }

    // ساختن شرایط فیلتر
    let where = {
      teacher_id: parseInt(teacherId),
    };
    if (gradeId && gradeId !== 'all') {
      where.classes = {
        grade_id: parseInt(gradeId),
      };
    }

    // دریافت برنامه هفتگی معلم
    const schedules = await prisma.weekly_schedule.findMany({
      where,
      include: {
        classes: {
          include: {
            grades: true,
          },
        },
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' },
      ],
    });

    // دریافت لیست پایه‌ها برای فیلتر
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' },
    });

    return NextResponse.json({
      success: true,
      schedules,
      grades,
    });
  } catch (error) {
    console.error('GET /api/teacher/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت برنامه هفتگی معلم', error: error.message },
      { status: 500 }
    );
  }
}