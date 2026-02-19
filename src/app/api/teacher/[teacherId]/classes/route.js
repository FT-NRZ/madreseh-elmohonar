import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { teacherId } = params;
    
    if (!teacherId || isNaN(parseInt(teacherId))) {
      return NextResponse.json({
        success: false,
        message: 'شناسه معلم معتبر نیست',
        classes: []
      }, { status: 400 });
    }

    console.log('دریافت کلاس‌های معلم:', teacherId);

    // ابتدا معلم را پیدا کن
    const teacher = await prisma.teachers.findUnique({
      where: { user_id: parseInt(teacherId) },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: 'معلم یافت نشد',
        classes: []
      }, { status: 404 });
    }

    // پیدا کردن کلاس‌های معلم
    const classes = await prisma.classes.findMany({
      where: { teacher_id: teacher.id },
      include: {
        grades: {
          select: {
            id: true,
            grade_name: true,
            grade_level: true
          }
        }
      },
      orderBy: {
        grades: {
          grade_level: 'asc'
        }
      }
    });

    console.log(`✅ یافت شد: ${classes.length} کلاس`);

    // فرمت کردن داده‌ها
    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      class_name: cls.class_name,
      grade_id: cls.grade_id,
      grade_name: cls.grades?.grade_name || 'نامشخص',
      grade_level: cls.grades?.grade_level || 0,
      teacher_id: cls.teacher_id,
      capacity: cls.capacity,
      description: cls.description,
      created_at: cls.created_at
    }));

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      total: formattedClasses.length
    });

  } catch (error) {
    console.error('خطا در دریافت کلاس‌های معلم:', error);
    return NextResponse.json({
      success: false,
      message: `خطا در دریافت کلاس‌ها: ${error.message}`,
      classes: []
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}