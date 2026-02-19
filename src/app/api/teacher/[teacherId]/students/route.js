import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import jwt from 'jsonwebtoken';

export async function GET(request, { params }) {
  try {
    const { teacherId } = params;
    
    if (!teacherId || isNaN(parseInt(teacherId))) {
      return NextResponse.json({
        success: false,
        message: 'شناسه معلم معتبر نیست',
        students: []
      }, { status: 400 });
    }

    // احراز هویت (اختیاری)
    let userAuthenticated = false;
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userAuthenticated = true;
        console.log('توکن معتبر است:', decoded.id);
      } catch (jwtError) {
        console.log('توکن نامعتبر است:', jwtError.message);
      }
    }

    // ابتدا معلم را پیدا کن
    const teacher = await prisma.teachers.findUnique({
      where: { user_id: parseInt(teacherId) },
      select: { id: true }
    });

    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: 'معلم یافت نشد',
        students: []
      }, { status: 404 });
    }

    console.log('معلم یافت شد:', teacher.id);

    // پیدا کردن پایه‌هایی که این معلم تدریس می‌کند
    // این کار را از جدول exams انجام می‌دهیم (آزمون‌هایی که معلم ایجاد کرده)
    const teacherGrades = await prisma.exams.findMany({
      where: { 
        teacher_id: teacher.id,
        grade_id: { not: null }
      },
      select: { 
        grade_id: true,
        grades: {
          select: {
            id: true,
            grade_name: true,
            grade_level: true
          }
        }
      },
      distinct: ['grade_id']
    });

    console.log('پایه‌های معلم:', teacherGrades);

    if (teacherGrades.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ پایه‌ای برای این معلم تعریف نشده است',
        students: [],
        total: 0
      });
    }

    const gradeIds = teacherGrades.map(exam => exam.grade_id);
    console.log('شناسه پایه‌ها:', gradeIds);

    // پیدا کردن کلاس‌های مربوط به این پایه‌ها
    const classes = await prisma.classes.findMany({
      where: { grade_id: { in: gradeIds } },
      select: {
        id: true,
        class_name: true,
        grade_id: true,
        grades: {
          select: {
            grade_name: true,
            grade_level: true
          }
        }
      }
    });

    console.log('کلاس‌های پیدا شده:', classes);

    if (classes.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'هیچ کلاسی برای پایه‌های این معلم وجود ندارد',
        students: [],
        total: 0
      });
    }

    const classIds = classes.map(cls => cls.id);

    // دریافت دانش‌آموزان کلاس‌های مربوط به پایه‌های معلم
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
            grade_id: true,
            grades: {
              select: {
                grade_name: true,
                grade_level: true
              }
            }
          }
        }
      },
      orderBy: [
        { 
          classes: {
            grades: {
              grade_level: 'asc'
            }
          }
        },
        { class_id: 'asc' },
        { users: { first_name: 'asc' } }
      ]
    });

    console.log('دانش‌آموزان یافت شده:', students.length);

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
      grade_id: student.classes?.grade_id || null,
      grade_name: student.classes?.grades?.grade_name || 'نامشخص',
      grade_level: student.classes?.grades?.grade_level || 0,
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
      grades: teacherGrades.map(tg => tg.grades),
      classes: classes,
      authenticated: userAuthenticated
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