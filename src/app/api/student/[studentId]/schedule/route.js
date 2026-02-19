export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// Rate limiting
const rateLimitMap = new Map();
const MAX_REQUESTS = 30;
const TIME_WINDOW = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  
  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
  rateLimitMap.set(ip, requests);
  
  if (requests.length >= MAX_REQUESTS) return false;
  requests.push(now);
  return true;
}

function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return realIP || cfConnectingIP || 'unknown';
}

function getAuthToken(request) {
  const bearer = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  if (bearer && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return (cookieToken || '').trim();
}

function checkAccess(tokenPayload, requestedStudentId) {
  if (tokenPayload.id === requestedStudentId || tokenPayload.user_id === requestedStudentId) {
    return true;
  }
  if (tokenPayload.role === 'parent' && tokenPayload.student_id === requestedStudentId) {
    return true;
  }
  if (['admin', 'teacher'].includes(tokenPayload.role)) {
    return true;
  }
  return false;
}

// تبدیل day_of_week string به dayKey
function getDayKeyFromString(dayString) {
  const dayMap = {
    'شنبه': 'saturday',
    'یکشنبه': 'sunday', 
    'دوشنبه': 'monday',
    'سه‌شنبه': 'tuesday',
    'چهارشنبه': 'wednesday',
    'پنج‌شنبه': 'thursday',
    'جمعه': 'friday',
    // انگلیسی
    'saturday': 'saturday',
    'sunday': 'sunday',
    'monday': 'monday',
    'tuesday': 'tuesday',
    'wednesday': 'wednesday',
    'thursday': 'thursday',
    'friday': 'friday',
    // شماره روز
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

export async function GET(request, { params }) {
  const ip = getClientIP(request);
  
  try {
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ 
        success: false, 
        message: 'تعداد درخواست‌ها بیش از حد مجاز', 
        schedule: [] 
      }, { status: 429 });
    }

    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز', 
        schedule: [] 
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز', 
        schedule: [] 
      }, { status: 401 });
    }

    const { studentId } = params || {};
    if (!studentId || isNaN(parseInt(studentId))) {
      return NextResponse.json({ 
        success: false, 
        message: 'درخواست نامعتبر', 
        schedule: [] 
      }, { status: 400 });
    }

    const studentIdNum = parseInt(studentId, 10);

    if (!checkAccess(payload, studentIdNum)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست', 
        schedule: [] 
      }, { status: 403 });
    }

    // پیدا کردن دانش‌آموز
    const student = await prisma.students.findFirst({
      where: {
        OR: [
          { id: studentIdNum },
          { user_id: studentIdNum }
        ]
      },
      select: {
        id: true,
        class_id: true,
        classes: {
          select: {
            id: true,
            class_name: true,
            grade_id: true
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({ 
        success: false, 
        message: 'اطلاعات یافت نشد', 
        schedule: [] 
      }, { status: 404 });
    }

    if (!student.class_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'برنامه درسی تعریف نشده', 
        schedule: [] 
      }, { status: 404 });
    }

    // دریافت برنامه هفتگی کلاس
    const schedules = await prisma.weekly_schedule.findMany({
      where: { 
        class_id: student.class_id 
      },
      include: {
        classes: {
          select: { 
            class_name: true,
            grade_id: true
          }
        },
        teachers: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });

    // فرمت کردن برنامه عادی
    const formattedSchedules = schedules.map(schedule => {
      // فرمت زمان
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

      // نام معلم
      const teacherName = schedule.teachers?.users
        ? `${schedule.teachers.users.first_name} ${schedule.teachers.users.last_name}`
        : 'نامشخص';

      return {
        id: schedule.id,
        dayKey: getDayKeyFromString(schedule.day_of_week),
        subject: schedule.subject || 'نامشخص',
        time,
        teacher: teacherName,
        room: schedule.room_number || '',
        isSpecial: false
      };
    });

    // 🔥 دریافت کلاس‌های فوق‌العاده
    const specialClasses = await prisma.$queryRaw`
      SELECT sc.id, sc.title, sc.description, sc.day_of_week, sc.start_time, sc.end_time, 
             c.class_name, c.grade_id
      FROM special_classes sc
      LEFT JOIN classes c ON sc.class_id = c.id
      WHERE (c.grade_id = ${student.classes?.grade_id} OR sc.class_id = ${student.class_id})
      ORDER BY sc.day_of_week, sc.start_time
    `;

    console.log('🔍 Special classes found:', specialClasses?.length || 0);

    // فرمت کردن کلاس‌های فوق‌العاده
    const formattedSpecials = (specialClasses || []).map(sc => {
      // فرمت زمان برای کلاس فوق‌العاده
      let time = '';
      try {
        if (sc.start_time && sc.end_time) {
          const start = new Date(`1970-01-01T${sc.start_time}`);
          const end = new Date(`1970-01-01T${sc.end_time}`);
          time = `${start.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })} - ${end.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
        }
      } catch (e) {
        time = `${sc.start_time || ''} - ${sc.end_time || ''}`;
      }

      return {
        id: `special-${sc.id}`,
        dayKey: getDayKeyFromString(sc.day_of_week),
        subject: sc.title || 'کلاس فوق‌العاده',
        time,
        teacher: 'کلاس فوق‌العاده',
        room: sc.description || '',
        isSpecial: true
      };
    });

    // 🔥 ترکیب برنامه عادی + کلاس‌های فوق‌العاده
    const allSchedules = [
      ...formattedSchedules,
      ...formattedSpecials
    ];

    console.log('📊 Total schedules (normal + special):', allSchedules.length);

    return NextResponse.json({
      success: true,
      schedule: allSchedules,
      className: student.classes?.class_name || 'نامشخص'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔒 Schedule API Error:', error.message);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطای داخلی سیستم', 
      schedule: [] 
    }, { status: 500 });
  }
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