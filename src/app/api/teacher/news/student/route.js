import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function parseIntSafe(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export async function GET(request) {
  try {
    const authorization = request.headers.get('authorization') || '';
    const cookieToken = request.cookies.get('access_token')?.value || request.cookies.get('token')?.value;
    const token = authorization.toLowerCase().startsWith('bearer ')
      ? authorization.slice(7).trim()
      : cookieToken;
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'student') {
      return NextResponse.json({ success: false, error: 'دسترسی دانش‌آموز لازم است' }, { status: 403 });
    }

    const userId = Number(payload.user_id ?? payload.uid ?? payload.userId ?? payload.id ?? payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ success: false, error: 'شناسه کاربر نامعتبر است' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedStudentId = parseIntSafe(searchParams.get('studentId'));
    const student = await prisma.students.findUnique({
      where: { user_id: userId },
      select: {
        id: true,
        classes: { select: { grade_id: true } }
      }
    });
    if (!student) return NextResponse.json({ success: false, error: 'دانش‌آموز یافت نشد' }, { status: 404 });
    if (requestedStudentId && requestedStudentId !== userId && requestedStudentId !== student.id) {
      return NextResponse.json({ success: false, error: 'دسترسی به این دانش‌آموز مجاز نیست' }, { status: 403 });
    }
    const studentId = student.id;
    const gradeId = student.classes?.grade_id || null;

    const orConditions = [
      { target_type: 'all_students' },
      { target_type: 'specific_student', target_student_id: studentId }
    ];

    if (gradeId) {
      orConditions.push({ target_type: 'grade', target_grade_id: gradeId });
    }

    const reminders = await prisma.teacher_news.findMany({
      where: { OR: orConditions },
      include: {
        users: { select: { first_name: true, last_name: true } },
        target_grade: { select: { id: true, grade_name: true } },
        target_student: {
          include: { users: { select: { first_name: true, last_name: true } } }
        }
      },
      orderBy: [
        { is_important: 'desc' },
        { reminder_date: 'asc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, reminders });

  } catch (error) {
    console.error('Error fetching student reminders:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت یادآوری‌ها' }, { status: 500 });
  }
}