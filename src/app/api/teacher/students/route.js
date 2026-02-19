import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request) {
  try {
    console.log('🔍 شروع دریافت دانش‌آموزان...');

    // دریافت همه دانش‌آموزان بدون احراز هویت (فعلاً برای تست)
    const students = await prisma.students.findMany({
      include: {
        users: true,
        classes: {
          include: {
            grades: true
          }
        }
      }
    });

    console.log(`✅ تعداد دانش‌آموزان: ${students.length}`);

    // فرمت کردن داده‌ها
    const formattedStudents = students.map(student => ({
      id: student.id,
      user_id: student.users?.id || null,
      student_number: student.student_number || '',
      full_name: `${student.users?.first_name || ''} ${student.users?.last_name || ''}`.trim() || 'نام نامشخص',
      first_name: student.users?.first_name || 'نامشخص',
      last_name: student.users?.last_name || '',
      phone: student.users?.phone || '',
      national_id: student.users?.national_id || '',
      class_id: student.classes?.id || null,
      class_name: student.classes?.class_name || 'بدون کلاس',
      grade_id: student.classes?.grade_id || null,
      grade_name: student.classes?.grades?.grade_name || 'بدون پایه',
      grade_level: student.classes?.grades?.grade_level || 0,
      father_name: student.father_name || '',
      mother_name: student.mother_name || '',
      parent_phone: student.parent_phone || '',
      enrollment_date: student.enrollment_date,
      status: student.status || 'active'
    }));

    // دریافت پایه‌ها
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' }
    });

    console.log(`✅ تعداد پایه‌ها: ${grades.length}`);

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      total: formattedStudents.length,
      grades: grades
    });

  } catch (error) {
    console.error('💥 خطا در API:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'خطا در دریافت دانش‌آموزان',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}