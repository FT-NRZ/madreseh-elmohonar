import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const { studentId } = params;
    
    if (!studentId || isNaN(parseInt(studentId))) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه دانش‌آموز نامعتبر است' 
      }, { status: 400 });
    }

    // احراز هویت
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن احراز هویت مورد نیاز است' 
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است' 
      }, { status: 401 });
    }

    // فقط خود دانش‌آموز، ادمین یا معلم می‌توانند اطلاعات را ببینند
    if (payload.role === 'student' && payload.userId !== parseInt(studentId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 403 });
    }
    
    if (!['admin', 'teacher', 'student'].includes(payload.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 403 });
    }

    // دریافت اطلاعات دانش‌آموز از دیتابیس
    // studentId در واقع user_id است که از localStorage آمده
    const student = await prisma.students.findFirst({
      where: {
        user_id: parseInt(studentId)
      },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            phone: true
          }
        },
        classes: {
          include: {
            grades: {
              select: {
                id: true,
                grade_name: true,
                grade_level: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ 
        success: false, 
        error: 'دانش‌آموز یافت نشد' 
      }, { status: 404 });
    }

    // ساختار امن داده برگشتی
    const studentData = {
      id: student.id,
      user_id: student.user_id,
      student_number: student.student_number,
      enrollment_date: student.enrollment_date,
      status: student.status || 'active',
      users: student.users,
      class: student.classes ? {
        id: student.classes.id,
        name: student.classes.class_name,
        class_number: student.classes.class_number,
        grade_id: student.classes.grade_id,
        grade: student.classes.grades ? {
          id: student.classes.grades.id,
          name: student.classes.grades.grade_name,
          level: student.classes.grades.grade_level
        } : null
      } : null
    };

    return NextResponse.json({ 
      success: true, 
      student: studentData 
    });

  } catch (error) {
    // امن کردن خطا
    console.error('Error fetching student info');
    
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در دریافت اطلاعات دانش‌آموز'
    }, { status: 500 });
  }
}