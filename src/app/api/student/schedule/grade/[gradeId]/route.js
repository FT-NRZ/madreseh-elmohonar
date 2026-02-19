export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getAuthToken(request) {
  const bearer = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  if (bearer && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return (cookieToken || '').trim();
}

export async function GET(request, { params }) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز', 
        schedules: [] 
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || !['admin', 'teacher'].includes(payload.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست', 
        schedules: [] 
      }, { status: 403 });
    }

    const { gradeId } = params || {};
    if (!gradeId || isNaN(parseInt(gradeId))) {
      return NextResponse.json({ 
        success: false, 
        message: 'درخواست نامعتبر', 
        schedules: [] 
      }, { status: 400 });
    }

    const gradeIdNum = parseInt(gradeId, 10);

    // پیدا کردن کلاس‌های این پایه
    const classes = await prisma.classes.findMany({
      where: { grade_id: gradeIdNum },
      select: { id: true, class_name: true, grade_id: true }
    });

    if (classes.length === 0) {
      return NextResponse.json({ 
        success: true, 
        schedules: [],
        message: 'اطلاعاتی یافت نشد'
      });
    }

    const classIds = classes.map(c => c.id);

    // دریافت برنامه‌های این کلاس‌ها
    const schedules = await prisma.weekly_schedule.findMany({
      where: { class_id: { in: classIds } },
      include: {
        classes: {
          select: { class_name: true, grade_id: true }
        },
        teachers: {
          include: {
            users: {
              select: { first_name: true, last_name: true }
            }
          }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });

    // فرمت کردن داده‌ها
    const formattedSchedules = schedules.map(schedule => {
      let time = '';
      try {
        if (schedule.start_time && schedule.end_time) {
          const start = new Date(`1970-01-01T${schedule.start_time}`);
          const end = new Date(`1970-01-01T${schedule.end_time}`);
          time = `${start.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${end.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        }
      } catch (e) {
        time = `${schedule.start_time || ''} - ${schedule.end_time || ''}`;
      }

      const teacherName = schedule.teachers?.users
        ? `${schedule.teachers.users.first_name} ${schedule.teachers.users.last_name}`
        : 'نامشخص';

      return {
        id: schedule.id,
        dayKey: getDayKeyFromString(schedule.day_of_week),
        subject: schedule.subject || 'نامشخص',
        time,
        teacher: teacherName,
        className: schedule.classes?.class_name || 'نامشخص',
        room: schedule.room_number || ''
      };
    });
    
    const specialClasses = await prisma.$queryRaw`
      SELECT sc.id, sc.title, sc.description, sc.day_of_week, sc.start_time, sc.end_time, 
            c.class_name
      FROM special_classes sc
      LEFT JOIN classes c ON sc.class_id = c.id
      WHERE c.grade_id = ${gradeIdNum}
      ORDER BY sc.day_of_week, sc.start_time
    `;
    const formattedSpecials = (specialClasses || []).map(sc => ({
      id: `special-${sc.id}`,
      dayKey: getDayKeyFromString(sc.day_of_week),
      subject: sc.title || 'کلاس فوق‌العاده',
      time: `${sc.start_time} - ${sc.end_time}`,
      teacher: 'کلاس فوق‌العاده',
      className: sc.class_name || 'نامشخص',
      room: sc.description || '',
      isSpecial: true
    }));
    const allSchedules = [
      ...formattedSchedules,
      ...formattedSpecials
    ];

    return NextResponse.json({
      success: true,
      schedules: allSchedules
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔒 Grade Schedule Error:', error.message);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطای داخلی سیستم', 
      schedules: [] 
    }, { status: 500 });
  }
}

function getDayKeyFromString(dayString) {
  const dayMap = {
    'شنبه': 'saturday',
    'یکشنبه': 'sunday', 
    'دوشنبه': 'monday',
    'سه‌شنبه': 'tuesday',
    'چهارشنبه': 'wednesday',
    'پنج‌شنبه': 'thursday',
    'جمعه': 'friday',
    'saturday': 'saturday',
    'sunday': 'sunday',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    '1': 'saturday',
    '2': 'sunday',
    '3': 'monday',
    '4': 'tuesday',
    '5': 'wednesday',
    '6': 'thursday',
    '7': 'friday'
  };
  
  return dayMap[dayString?.toLowerCase()] || 'unknown';
}

export async function POST() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}
export async function PUT() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}
export async function DELETE() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}
export async function PATCH() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}