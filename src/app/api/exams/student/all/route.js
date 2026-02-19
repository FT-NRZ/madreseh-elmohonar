import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt'

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'توکن احراز هویت الزامی است'
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({
        success: false,
        error: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get('student_id');
    const gradeId = searchParams.get('grade_id'); // اضافه شده
    const activeOnly = searchParams.get('active_only') === 'true';
    const studentId = studentIdParam ? Number(studentIdParam) : payload.userId;

    if (!studentId || Number.isNaN(studentId)) {
      return NextResponse.json({
        success: false,
        error: 'شناسه دانش‌آموز نامعتبر است'
      }, { status: 400 });
    }

    if (payload.role !== 'admin' && payload.userId !== studentId) {
      return NextResponse.json({
        success: false,
        error: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    // تغییر به grade_id
    const student = await prisma.students.findUnique({
      where: { user_id: studentId },
      select: {
        id: true,
        classes: {
          select: {
            grade_id: true
          }
        },
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({
        success: false,
        error: 'دانش‌آموز پیدا نشد'
      }, { status: 404 });
    }

    if (student.users.role !== 'student') {
      return NextResponse.json({
        success: false,
        error: 'کاربر دانش‌آموز نیست'
      }, { status: 403 });
    }

    // شرط جدید بر اساس grade_id
    const whereCondition = {
      is_active: activeOnly ? true : undefined
    };

    // اگر grade_id از query string آمده، از آن استفاده کن
    if (gradeId) {
      whereCondition.grade_id = Number(gradeId);
    } else if (student.classes?.grade_id) {
      // در غیر این صورت از grade_id دانش‌آموز استفاده کن
      whereCondition.grade_id = student.classes.grade_id;
    }

    // حذف فیلدهای undefined
    Object.keys(whereCondition).forEach(key => {
      if (whereCondition[key] === undefined) {
        delete whereCondition[key];
      }
    });

    const exams = await prisma.exams.findMany({
      where: whereCondition,
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        duration_minutes: true,
        total_marks: true,
        created_at: true,
        is_active: true,
        grade_id: true, // تغییر از class_id به grade_id
        subject: true
      },
      orderBy: { created_at: 'desc' }
    });

    const completedExamIds = await prisma.exam_results.findMany({
      where: { student_id: student.id },
      select: { exam_id: true }
    });

    const completedFileExamIds = await prisma.exam_file_answers.findMany({
      where: { student_id: student.id },
      select: { exam_id: true }
    });

    const completedIds = new Set([
      ...completedExamIds.map(e => e.exam_id),
      ...completedFileExamIds.map(e => e.exam_id)
    ]);

    const examsWithStatus = exams.map(exam => ({
      ...exam,
      max_marks: exam.total_marks,
      isCompleted: completedIds.has(exam.id),
      canTake: exam.is_active && !completedIds.has(exam.id)
    }));

    return NextResponse.json({
      success: true,
      exams: examsWithStatus,
      studentInfo: {
        id: student.id,
        user_id: student.users.id,
        name: `${student.users.first_name} ${student.users.last_name}`,
        grade_id: student.classes?.grade_id
      }
    });

  } catch (error) {
    console.error('GET /api/exams/student/all error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت آزمون‌ها'
    }, { status: 500 });
  }
}