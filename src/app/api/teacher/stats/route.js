import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.slice(7).trim();
  }
  return request.cookies.get('access_token')?.value || request.cookies.get('token')?.value || '';
}

export async function GET(request) {
  try {
    const payload = verifyJWT(getToken(request));
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const userId = Number(payload.user_id ?? payload.uid ?? payload.userId ?? payload.id ?? payload.sub);
    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const teacher = await prisma.teachers.findUnique({
      where: { user_id: userId },
      select: { id: true, teaching_type: true }
    });
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });
    }

    const classWhere = teacher.teaching_type === 'workshop' ? {} : { teacher_id: teacher.id };
    const classes = await prisma.classes.findMany({
      where: classWhere,
      select: { id: true }
    });
    const classIds = classes.map(item => item.id);

    const [students, exams] = await Promise.all([
      classIds.length
        ? prisma.students.count({
            where: { class_id: { in: classIds }, status: 'active' }
          })
        : Promise.resolve(0),
      prisma.exams.count({ where: { teacher_id: teacher.id } })
    ]);

    return NextResponse.json({
      success: true,
      teacherId: teacher.id,
      stats: { classes: classIds.length, students, exams }
    });
  } catch (error) {
    console.error('Teacher stats error:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت آمار معلم' }, { status: 500 });
  }
}