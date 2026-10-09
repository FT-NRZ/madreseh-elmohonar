import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

const weekDaysFa = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه'
};

function getToken(request) {
  const authorization = request.headers.get('authorization') || '';
  if (authorization.startsWith('Bearer ')) return authorization.slice(7).trim();
  return request.cookies.get('access_token')?.value || request.cookies.get('token')?.value || '';
}

async function resolveStudent(request, requestedId) {
  const payload = verifyJWT(getToken(request));
  if (!payload) return null;
  const userId = Number(payload.user_id ?? payload.uid ?? payload.userId ?? payload.id);
  const studentId = Number(requestedId);
  if (payload.role !== 'admin' && userId !== studentId) return null;
  return prisma.students.findFirst({
    where: { OR: [{ id: studentId }, { user_id: studentId }, { user_id: userId }] },
    select: { id: true }
  });
}

// بررسی منقضی بودن: مهلت رزرو تا ۲۳:۵۹:۵۹ دو روز قبل از وعده به وقت ایران (UTC+3:30)
// مثال: دوشنبه → مهلت تا ۲۳:۵۹:۵۹ شنبه | یکشنبه → تا ۲۳:۵۹:۵۹ جمعه | شنبه → تا ۲۳:۵۹:۵۹ پنجشنبه
function isExpired(date) {
  const target = new Date(date);
  // تاریخ وعده منهای ۲ روز
  const deadlineEnd = new Date(target);
  deadlineEnd.setUTCDate(deadlineEnd.getUTCDate() - 2);
  // پایان آن روز به وقت ایران: ۲۳:۵۹:۵۹.۹۹۹ ایران = ۲۰:۲۹:۵۹.۹۹۹ UTC
  deadlineEnd.setUTCHours(20, 29, 59, 999);

  const now = new Date();
  return now > deadlineEnd;
}

function getTodayStart() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return new Date(`${todayKey}T00:00:00.000Z`);
}

export async function GET(req, { params }) {
  try {
    const { studentId } = await params;
    const student = await resolveStudent(req, studentId);
    if (!student) return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const requestedDate = searchParams.get('date');
    let dateFilter = { date: { gte: getTodayStart() } };
    if (requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      const start = new Date(`${requestedDate}T00:00:00.000Z`);
      const end = new Date(start);
      end.setUTCDate(end.getUTCDate() + 1);
      dateFilter = {
        AND: [
          { date: { gte: getTodayStart() } },
          { date: { gte: start, lt: end } }
        ]
      };
    }

    const meals = await prisma.food_schedule.findMany({
      where: dateFilter,
      include: { breakfast_reservations: { where: { student_id: student.id }, select: { id: true, option_index: true } } },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json({
      success: true,
      meals: meals.map(meal => {
        const breakfasts = [meal.breakfast_1, meal.breakfast_2, meal.breakfast_3];
        const reservation = meal.breakfast_reservations[0] || null;
        const reservedIndex = reservation?.option_index || null;
        // مهلت رزرو: دو روز قبل از تاریخ وعده (پایان آن روز به وقت ایران)
        const deadline = new Date(meal.date);
        deadline.setUTCDate(deadline.getUTCDate() - 2);
        return {
          id: meal.id,
          date: meal.date,
          weekday: meal.weekday,
          day: weekDaysFa[meal.weekday] || meal.weekday,
          breakfasts,
          breakfastCount: breakfasts.filter(Boolean).length,
          lunch: meal.lunch,
          breakfastStatus: isExpired(meal.date)
            ? 'expired'
            : reservation ? 'reserved' : 'available',
          reservedOption: reservedIndex,
          reservedBreakfast: reservedIndex ? breakfasts[reservedIndex - 1] || null : null,
          reservationId: reservation?.id || null,
          reservationDeadline: deadline.toISOString().split('T')[0] // YYYY-MM-DD
        };
      })
    });
  } catch (error) {
    console.error('Error fetching student meals:', error);
    return NextResponse.json({ success: false, meals: [], message: 'خطا در دریافت برنامه غذایی' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const { studentId } = await params;
    const student = await resolveStudent(req, studentId);
    if (!student) return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    const { scheduleId, optionIndex } = await req.json();
    const optionIdx = Number(optionIndex) || 1;
    if (optionIdx < 1 || optionIdx > 3) {
      return NextResponse.json({ success: false, message: 'گزینه صبحانه نامعتبر است' }, { status: 400 });
    }
    const schedule = await prisma.food_schedule.findUnique({ where: { id: Number(scheduleId) } });
    if (!schedule) return NextResponse.json({ success: false, message: 'برنامه غذایی یافت نشد' }, { status: 404 });
    const options = [schedule.breakfast_1, schedule.breakfast_2, schedule.breakfast_3];
    if (!options.some(Boolean)) return NextResponse.json({ success: false, message: 'صبحانه‌ای برای این روز ثبت نشده است' }, { status: 404 });
    if (!options[optionIdx - 1]) return NextResponse.json({ success: false, message: 'این گزینه برای این روز ثبت نشده است' }, { status: 404 });
    if (isExpired(schedule.date)) return NextResponse.json({ success: false, message: 'مهلت رزرو این روز گذشته است' }, { status: 409 });
    const reservation = await prisma.breakfast_reservations.upsert({
      where: { student_id_schedule_id: { student_id: student.id, schedule_id: schedule.id } },
      update: { option_index: optionIdx },
      create: { student_id: student.id, schedule_id: schedule.id, option_index: optionIdx }
    });
    return NextResponse.json({ success: true, reservation });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در رزرو صبحانه' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { studentId } = await params;
    const student = await resolveStudent(req, studentId);
    if (!student) return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    const { scheduleId } = await req.json();
    const schedule = await prisma.food_schedule.findUnique({ where: { id: Number(scheduleId) }, select: { date: true } });
    if (!schedule) return NextResponse.json({ success: false, message: 'برنامه غذایی یافت نشد' }, { status: 404 });
    if (isExpired(schedule.date)) return NextResponse.json({ success: false, message: 'مهلت لغو رزرو این روز گذشته است' }, { status: 409 });
    await prisma.breakfast_reservations.delete({ where: { student_id_schedule_id: { student_id: student.id, schedule_id: Number(scheduleId) } } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error.code === 'P2025') return NextResponse.json({ success: false, message: 'رزروی برای این روز وجود ندارد' }, { status: 404 });
    return NextResponse.json({ success: false, message: 'خطا در لغو رزرو صبحانه' }, { status: 500 });
  }
}