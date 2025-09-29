import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { teacherId } = await params;
    
    if (!teacherId || isNaN(parseInt(teacherId))) {
      return NextResponse.json({
        success: false,
        message: 'شناسه معلم معتبر نیست',
        students: []
      }, { status: 400 });
    }

    // دریافت کلاس‌های معلم
    const teacherClasses = await prisma.classes.findMany({
      where: { teacher_id: parseInt(teacherId) },
      select: { id: true, class_name: true }
    });

    if (teacherClasses.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ کلاسی برای این معلم تعریف نشده است',
        students: [],
        total: 0
      });
    }

    const classIds = teacherClasses.map(cls => cls.id);

    // دریافت دانش‌آموزان کلاس‌های معلم
    const students = await prisma.students.findMany({
      where: {
        class_id: { in: classIds },
        status: 'active'
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            phone: true
          }
        },
        classes: {
          select: {
            id: true,
            class_name: true,
            grades: {
              select: {
                grade_name: true
              }
            }
          }
        }
      },
      orderBy: [
        { class_id: 'asc' },
        { users: { first_name: 'asc' } }
      ]
    });

    // فرمت کردن داده‌ها
    const formattedStudents = students.map(student => ({
      id: student.id,
      student_number: student.student_number,
      full_name: `${student.users?.first_name || ''} ${student.users?.last_name || ''}`.trim(),
      first_name: student.users?.first_name || 'نامشخص',
      last_name: student.users?.last_name || '',
      phone: student.users?.phone || '',
      class_id: student.classes?.id || null,
      class_name: student.classes?.class_name || 'نامشخص',
      grade_name: student.classes?.grades?.grade_name || 'نامشخص',
      father_name: student.father_name,
      mother_name: student.mother_name,
      parent_phone: student.parent_phone,
      enrollment_date: student.enrollment_date,
      status: student.status
    }));

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      total: formattedStudents.length,
      classes: teacherClasses
    });

  } catch (error) {
    console.error('GET teacher students error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت دانش‌آموزان',
      students: []
    }, { status: 500 });
  }
}