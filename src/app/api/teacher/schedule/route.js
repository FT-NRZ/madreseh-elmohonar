import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const gradeId = searchParams.get('gradeId');

    console.log('📅 Schedule API called with:', { teacherId, gradeId });

    if (!teacherId) {
      return NextResponse.json(
        { success: false, message: 'شناسه معلم ارسال نشده است' },
        { status: 400 }
      );
    }

    // ابتدا بررسی کنیم که آیا این معلم کلاسی دارد یا نه
    const teacherClassesTotal = await prisma.classes.findMany({
      where: { teacher_id: parseInt(teacherId) },
      include: { grades: true }
    });
    
    console.log('🏫 All teacher classes:', teacherClassesTotal);

    // شرط فیلتر کلاس‌ها بر اساس پایه
    // شرط فیلتر کلاس‌ها بر اساس پایه
    let classWhere = { teacher_id: parseInt(teacherId) };
    if (gradeId && gradeId !== 'all') {
      classWhere.grade_id = parseInt(gradeId); // فیلتر بر اساس gradeId
    }

    console.log('🔍 Looking for classes with condition:', classWhere);

    // دریافت کلاس‌های معلم (و اگر پایه انتخاب شده، فقط کلاس‌های آن پایه)
    const teacherClasses = await prisma.classes.findMany({
      where: classWhere,
      select: { id: true, class_name: true, grade_id: true }
    });

    console.log('📚 Filtered teacher classes:', teacherClasses);
    
    const classIds = teacherClasses.map(c => c.id);
    console.log('📚 Class IDs for schedule lookup:', classIds);

    // بررسی کل داده‌های weekly_schedule در دیتابیس
    const allSchedules = await prisma.weekly_schedule.findMany({
      take: 5,
      include: { classes: true }
    });
    console.log('🗓️ Sample weekly_schedule data:', allSchedules);

    // دریافت لیست پایه‌ها برای فیلتر
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' },
    });
    console.log('📋 Found grades:', grades.length, grades);

    if (classIds.length === 0) {
      return NextResponse.json({
        success: true,
        schedules: [],
        grades,
        message: 'هیچ کلاسی برای این معلم/پایه یافت نشد.'
      });
    }

    // دریافت جلسات برنامه هفتگی فقط برای کلاس‌های معلم و پایه انتخابی
    const schedules = await prisma.weekly_schedule.findMany({
      where: {
        class_id: { in: classIds }
      },
      include: {
        classes: {
          include: { grades: true }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' },
      ],
    });

    console.log('📅 Found schedules for classes:', schedules.length, schedules);

    return NextResponse.json({
      success: true,
      schedules,
      grades,
      debug: {
        teacherId,
        gradeId,
        classIds,
        totalClassesForTeacher: teacherClassesTotal.length,
        filteredClasses: teacherClasses.length,
        schedulesFound: schedules.length
      }
    });
  } catch (error) {
    console.error('💥 GET /api/teacher/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت برنامه هفتگی معلم', error: error.message },
      { status: 500 }
    );
  }
}