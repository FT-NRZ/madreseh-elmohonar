export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// Rate limiting
const rateLimitMap = new Map();
const MAX_REQUESTS = 20;
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

// بررسی مجوز دسترسی
function checkAccess(tokenPayload, requestedStudentId) {
  // اگر خود دانش‌آموز است
  if (tokenPayload.id === requestedStudentId || tokenPayload.user_id === requestedStudentId) {
    return true;
  }
  
  // اگر والدین است
  if (tokenPayload.role === 'parent' && tokenPayload.student_id === requestedStudentId) {
    return true;
  }
  
  // اگر معلم یا ادمین است
  if (['admin', 'teacher'].includes(tokenPayload.role)) {
    return true;
  }
  
  return false;
}

export async function GET(request, { params }) {
  const ip = getClientIP(request);
  
  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ 
        success: false, 
        message: 'تعداد درخواست‌ها بیش از حد مجاز' 
      }, { status: 429 });
    }

    // احراز هویت
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 401 });
    }

    const studentId = parseInt(params.studentId);
    if (isNaN(studentId)) {
      return NextResponse.json({
        success: false,
        message: 'درخواست نامعتبر'
      }, { status: 400 });
    }

    // بررسی مجوز دسترسی
    if (!checkAccess(payload, studentId)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست' 
      }, { status: 403 });
    }

    // دریافت پارامتر فیلتر
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // تعیین محدوده تاریخ بر اساس فیلتر
    let dateFilter = {};
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateFilter = { gte: weekAgo };
        break;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateFilter = { gte: monthAgo };
        break;
      case 'threeMonths':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        dateFilter = { gte: threeMonthsAgo };
        break;
      default:
        // همه زمان‌ها
        break;
    }

    // پیدا کردن دانش‌آموز - بررسی user_id و id
    const student = await prisma.students.findFirst({
      where: {
        OR: [
          { user_id: studentId },
          { id: studentId }
        ]
      },
      select: {
        id: true,
        user_id: true,
        class_id: true
      }
    });

    if (!student) {
      return NextResponse.json({ 
        success: false,
        message: 'اطلاعات یافت نشد'
      }, { status: 404 });
    }
    
    // دریافت حضور و غیاب‌ها
    const whereClause = {
      student_id: student.id,
      ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
    };

    const attendances = await prisma.attendances.findMany({
      where: whereClause,
      select: {
        id: true,
        date: true,
        status: true,
        delay_minutes: true,
        delay_reason: true,
        notes: true,
        is_justified: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    // فرمت کردن داده‌ها - بدون اطلاعات حساس
    const formattedAttendances = attendances.map(att => ({
      id: att.id,
      date: att.date.toISOString().split('T')[0], // فرمت YYYY-MM-DD
      status: att.status,
      delay_minutes: att.delay_minutes || null,
      delay_reason: att.delay_reason || null,
      notes: att.notes || null,
      is_justified: att.is_justified || false
    }));

    // محاسبه آمار
    const stats = attendances.reduce((acc, curr) => {
      switch(curr.status) {
        case 'present':
          acc.present++;
          break;
        case 'absent':
          if (curr.is_justified) {
            acc.excused++;
          } else {
            acc.absent++;
          }
          break;
        case 'late':
          acc.late++;
          break;
      }
      return acc;
    }, {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    });

    const response = NextResponse.json({
      success: true,
      attendances: formattedAttendances,
      stats
    });

    // هدرهای امنیتی
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Referrer-Policy', 'no-referrer');

    return response;

  } catch (error) {
    // لاگ امنیتی محدود
    if (process.env.NODE_ENV === 'development') {
      console.error('🔒 Attendance API Error:', error.message);
    }

    return NextResponse.json({ 
      success: false,
      message: 'خطای داخلی سیستم'
    }, { status: 500 });
  }
}

// محدود کردن متدهای HTTP
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