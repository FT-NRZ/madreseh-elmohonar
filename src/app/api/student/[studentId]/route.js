export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization') || '';
  if (auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}
function safeVerify(t) { try { return verifyJWT(t); } catch { return null; } }
function resolveUserId(p) { return Number(p?.user_id ?? p?.uid ?? p?.userId ?? p?.id ?? p?.sub); }

export async function GET(request, { params }) {
  try {
    const { studentId } = params;
    const sid = Number(studentId);
    if (!sid) {
      return NextResponse.json({ success: false, error: 'شناسه دانش‌آموز نامعتبر است' }, { status: 400 });
    }

    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'توکن نامعتبر است' }, { status: 401 });
    }
    if (!['admin', 'teacher', 'student'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const tokenUserId = resolveUserId(payload);
    if (payload.role === 'student' && tokenUserId && tokenUserId !== sid) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // studentId = user_id
    const student = await prisma.students.findFirst({
      where: { user_id: sid },
      include: {
        users: { select: { id: true, first_name: true, last_name: true, profile_image: true, phone: true } },
        classes: { include: { grades: { select: { id: true, grade_name: true, grade_level: true } } } }
      }
    });

    if (!student) {
      return NextResponse.json({ success: false, error: 'دانش‌آموز یافت نشد' }, { status: 404 });
    }

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

    return NextResponse.json({ success: true, student: studentData });
  } catch {
    return NextResponse.json({ success: false, error: 'خطا در دریافت اطلاعات دانش‌آموز' }, { status: 500 });
  }
}