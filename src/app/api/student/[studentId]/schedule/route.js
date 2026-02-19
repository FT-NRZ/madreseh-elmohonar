import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// Rate limiting پیشرفته
const rateLimitMap = new Map();
const suspiciousIPs = new Map();
const RATE_LIMIT = 100; // درخواست در دقیقه
const TIME_WINDOW = 60 * 1000; // 1 دقیقه
const SUSPICIOUS_THRESHOLD = 200; // آستانه مشکوک
const BAN_DURATION = 15 * 60 * 1000; // 15 دقیقه

function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (forwardedFor) {
    const ips = forwardedFor.split(',').map(ip => ip.trim());
    return ips[0];
  }
  
  return realIP || cfConnectingIP || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  
  // بررسی IP های بن شده
  if (suspiciousIPs.has(ip)) {
    const banTime = suspiciousIPs.get(ip);
    if (now - banTime < BAN_DURATION) {
      return false;
    } else {
      suspiciousIPs.delete(ip);
    }
  }
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  const recentRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, recentRequests);
  
  // اگر درخواست‌ها بیش از حد مشکوک باشد، IP را بن کن
  if (recentRequests.length >= SUSPICIOUS_THRESHOLD) {
    suspiciousIPs.set(ip, now);
    return false;
  }
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  return true;
}

// تشخیص حملات امنیتی
function detectSecurityThreats(value) {
  if (typeof value !== 'string') return false;
  
  const threatPatterns = [
    // SQL Injection
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC|EXECUTE)\b)/i,
    /(--|\/\*|\*\/|;|\||&&)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /'(\s*(OR|AND)\s*')/i,
    /(\bUNION\s+SELECT)/i,
    
    // XSS
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi,
    
    // Path Traversal
    /\.\.[\/\\]/,
    /[\/\\]\.\.[\/\\]/,
    
    // Command Injection
    /[;&|`$()]/,
    /\b(wget|curl|nc|netcat|telnet|ssh)\b/i
  ];
  
  return threatPatterns.some(pattern => pattern.test(value));
}

// اعتبارسنجی User-Agent
function validateUserAgent(userAgent) {
  if (!userAgent) return false;
  if (userAgent.length < 10 || userAgent.length > 500) return false;
  
  // بررسی الگوهای مشکوک
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /burpsuite/i,
    /nmap/i,
    /masscan/i,
    /dirb/i,
    /gobuster/i
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

export async function GET(request, { params }) {
  const startTime = Date.now();
  
  try {
    // بررسی User-Agent
    const userAgent = request.headers.get('user-agent');
    if (!validateUserAgent(userAgent)) {
      return NextResponse.json({
        success: false,
        message: 'درخواست نامعتبر',
        schedule: []
      }, { status: 400 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است',
        schedule: []
      }, { status: 429 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است',
        schedule: []
      }, { status: 401 });
    }

    // بررسی طول هدر امنیتی
    if (authHeader.length > 1000) {
      return NextResponse.json({
        success: false,
        message: 'هدر احراز هویت نامعتبر است',
        schedule: []
      }, { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    
    // بررسی طول توکن
    if (token.length > 500) {
      return NextResponse.json({
        success: false,
        message: 'توکن بیش از حد طولانی است',
        schedule: []
      }, { status: 400 });
    }

    // تشخیص حملات در توکن
    if (detectSecurityThreats(token)) {
      return NextResponse.json({
        success: false,
        message: 'توکن مشکوک شناسایی شد',
        schedule: []
      }, { status: 400 });
    }
    
    const payload = verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است',
        schedule: []
      }, { status: 401 });
    }

    // بررسی انقضای توکن
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return NextResponse.json({
        success: false,
        message: 'توکن منقضی شده است',
        schedule: []
      }, { status: 401 });
    }

    // await کردن params برای حل خطای NextJS
    const resolvedParams = await params;
    const { studentId } = resolvedParams;
    
    if (!studentId || studentId === 'null' || studentId === 'undefined') {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه دانش‌آموز مشخص نشده است',
        schedule: []
      }, { status: 400 });
    }

    // تشخیص حملات در پارامتر
    if (detectSecurityThreats(studentId)) {
      return NextResponse.json({
        success: false,
        message: 'پارامتر مشکوک شناسایی شد',
        schedule: []
      }, { status: 400 });
    }

    // اعتبارسنجی عددی studentId
    const studentIdNum = parseInt(studentId);
    if (!Number.isInteger(studentIdNum) || studentIdNum <= 0 || studentIdNum > 2147483647) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه دانش‌آموز نامعتبر است',
        schedule: []
      }, { status: 400 });
    }

    // دریافت اطلاعات دانش‌آموز
    const student = await prisma.students.findFirst({
      where: { user_id: studentIdNum },
      include: { 
        classes: {
          select: {
            id: true,
            class_name: true
          }
        }
      }
    });

    if (!student || !student.class_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'دانش‌آموز یا کلاس یافت نشد',
        schedule: []
      }, { status: 404 });
    }

    // تغییر مدل Prisma به weekly_schedule
    const schedules = await prisma.weekly_schedule.findMany({
      where: { class_id: student.class_id },
      include: {
        classes: {
          select: {
            class_name: true
          }
        },
        subject: {
          select: {
            subject_name: true
          }
        },
        teacher: {
          select: {
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

    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      dayKey: getDayKey(schedule.day_of_week),
      subject: schedule.subject?.subject_name || 'نامشخص',
      time: `${schedule.start_time?.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - ${schedule.end_time?.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      teacher: schedule.teacher?.users 
        ? `${schedule.teacher.users.first_name} ${schedule.teacher.users.last_name}`
        : 'نامشخص',
      className: schedule.classes?.class_name || 'نامشخص'
    }));

    // محاسبه زمان پردازش
    const processingTime = Date.now() - startTime;

    // پاسخ با هدرهای امنیتی
    const response = NextResponse.json({ 
      success: true, 
      schedule: formattedSchedules,
      studentInfo: {
        className: student.classes?.class_name || 'نامشخص'
      }
    });

    // هدرهای امنیتی
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('X-Response-Time', `${processingTime}ms`);
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    return response;

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/student/[studentId]/schedule:', error);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'رکورد مورد نظر یافت نشد',
        schedule: []
      }, { status: 404 });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'تداخل در داده‌ها',
        schedule: []
      }, { status: 409 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'خطای سرور',
      schedule: []
    }, { status: 500 });
  }
}

function getDayKey(dayNumber) {
  const days = {
    1: 'saturday',
    2: 'sunday',
    3: 'monday',
    4: 'tuesday',
    5: 'wednesday',
    6: 'thursday',
    7: 'friday'
  };
  return days[dayNumber] || 'unknown';
}

// محدود کردن متدهای HTTP غیرمجاز
export async function POST(request) {
  return NextResponse.json({
    success: false,
    message: 'متد POST مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function PUT(request) {
  return NextResponse.json({
    success: false,
    message: 'متد PUT مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function DELETE(request) {
  return NextResponse.json({
    success: false,
    message: 'متد DELETE مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    message: 'متد PATCH مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}