import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export const runtime = 'nodejs';

function getToken(request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.toLowerCase().startsWith('bearer ')) return authorization.slice(7).trim();
  return request.cookies.get('access_token')?.value || request.cookies.get('token')?.value || '';
}

function isAdmin(request) {
  const payload = verifyJWT(getToken(request));
  return payload?.role === 'admin';
}

function dayStart(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function isExpired(date) {
  const target = new Date(date);
  const today = new Date();
  const targetKey = `${target.getUTCFullYear()}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(target.getUTCDate()).padStart(2, '0')}`;
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return targetKey < todayKey;
}

export async function GET(request) {
  if (!isAdmin(request)) {
    return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const gradeId = searchParams.get('gradeId');
    const classId = searchParams.get('classId');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ success: false, message: 'تاریخ معتبر الزامی است' }, { status: 400 });
    }

    const start = dayStart(date);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 1);

    const schedule = await prisma.food_schedule.findFirst({
      where: { date: { gte: start, lt: end } },
      select: { id: true, date: true, weekday: true, breakfast: true, lunch: true }
    });

    const students = await prisma.students.findMany({
      where: gradeId
        ? { classes: { grade_id: Number(gradeId) } }
        : classId
          ? { class_id: Number(classId) }
          : {},
      select: {
        id: true,
        student_number: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            entrances: { select: { national_code: true } }
          }
        },
        classes: { select: { id: true, class_name: true, class_number: true } }
      },
      orderBy: [{ class_id: 'asc' }, { id: 'asc' }]
    });

    const reservations = schedule
      ? await prisma.breakfast_reservations.findMany({
          where: { schedule_id: schedule.id, student_id: { in: students.map(student => student.id) } },
          select: { student_id: true, reserved_at: true }
        })
      : [];
    const reservationMap = new Map(reservations.map(item => [item.student_id, item]));

    const expired = !schedule || isExpired(schedule.date);

    return NextResponse.json({
      success: true,
      schedule,
      breakfastStatus: !schedule?.breakfast ? 'unavailable' : expired ? 'expired' : 'open',
      students: students.map(student => {
        const reservation = reservationMap.get(student.id);
        return {
          id: student.id,
          studentNumber: student.student_number,
          firstName: student.users?.first_name || '',
          lastName: student.users?.last_name || '',
          nationalCode: student.users?.entrances?.national_code || '',
          classId: student.classes?.id || null,
          className: student.classes?.class_name || student.classes?.class_number || 'بدون کلاس',
          reserved: Boolean(reservation),
          reservedAt: reservation?.reserved_at || null,
          status: reservation ? 'reserved' : expired ? 'expired' : schedule?.breakfast ? 'not_reserved' : 'unavailable'
        };
      })
    });
  } catch (error) {
    console.error('Admin food reservations error:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت وضعیت رزروها' }, { status: 500 });
  }
}
