import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'توکن احراز هویت الزامی است'
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({
        success: false,
        error: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('grade_id');
    const activeOnly = searchParams.get('active_only') === 'true';

    // شرایط جستجو
    const whereConditions = {};

    // فیلتر بر اساس grade
    if (gradeId) {
      whereConditions.grade_id = parseInt(gradeId);
    }

    // فیلتر بر اساس فعال بودن
    if (activeOnly) {
      whereConditions.is_active = true;
    }

    const exams = await prisma.exams.findMany({
      where: whereConditions,
      include: {
        grades: {
          select: {
            grade_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // فرمت کردن داده‌ها
    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      type: exam.type,
      description: exam.description,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      max_marks: exam.total_marks, // برای سازگاری
      is_active: exam.is_active,
      grade_name: exam.grades?.grade_name,
      created_at: exam.created_at
    }));

    return NextResponse.json({
      success: true,
      exams: formattedExams
    });

  } catch (error) {
    console.error('Error fetching student exams:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت آزمون‌ها',
      details: error.message
    }, { status: 500 });
  }
}