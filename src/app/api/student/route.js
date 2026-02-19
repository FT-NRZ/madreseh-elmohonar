import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// دریافت IP کلاینت
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

// Rate limiting ساده
const rateLimitMap = new Map();
const RATE_LIMIT = 60; // درخواست در دقیقه
const TIME_WINDOW = 60 * 1000; // 1 دقیقه

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  const requests = rateLimitMap.get(ip);
  const recentRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, recentRequests);
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  recentRequests.push(now);
  return true;
}

// تشخیص حملات SQL Injection/XSS
function detectAttack(value) {
  if (typeof value !== 'string') return false;
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  return patterns.some(pattern => pattern.test(value));
}

export async function GET(request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است',
        students: []
      }, { status: 429 });
    }

    // احراز هویت - اما اگر توکن نباشد، خطا نده
    const authHeader = request.headers.get('authorization');
    let isAuthorized = false;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // جلوگیری از حملات هدر
      if (authHeader.length > 1000) {
        return NextResponse.json({
          success: false,
          message: 'هدر احراز هویت نامعتبر است',
          students: []
        }, { status: 400 });
      }
      const token = authHeader.replace('Bearer ', '').trim();
      if (token.length > 500) {
        return NextResponse.json({
          success: false,
          message: 'توکن بیش از حد طولانی است',
          students: []
        }, { status: 400 });
      }
      if (detectAttack(token)) {
        return NextResponse.json({
          success: false,
          message: 'توکن مشکوک شناسایی شد',
          students: []
        }, { status: 400 });
      }
      const payload = verifyJWT(token);
      if (payload && (payload.role === 'admin' || payload.role === 'teacher' || payload.role === 'student')) { // ✅ student مجاز شد
        // بررسی انقضای توکن
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return NextResponse.json({
            success: false,
            message: 'توکن منقضی شده است',
            students: []
          }, { status: 401 });
        }
        isAuthorized = true;
      }
    }

    // اگر احراز هویت نشده، دسترسی ندارد
    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز',
        students: []
      }, { status: 401 });
    }

    // فقط اطلاعات غیرحساس دانش‌آموزان را برگردان
    const students = await prisma.students.findMany({
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            phone: true
          }
        },
        classes: {
          select: {
            id: true,
            class_name: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // حذف اطلاعات حساس و ساختاردهی خروجی
    const safeStudents = students.map(stu => ({
      id: stu.id,
      user_id: stu.user_id,
      studentNumber: stu.student_number,
      class_id: stu.class_id,
      users: {
        id: stu.users.id,
        first_name: stu.users.first_name,
        last_name: stu.users.last_name,
        firstName: stu.users.first_name,
        lastName: stu.users.last_name,
        profileImage: stu.users.profile_image,
        phone: stu.users.phone
      },
      class: stu.classes
        ? { id: stu.classes.id, name: stu.classes.class_name }
        : null
    }));

    // هدرهای امنیتی
    const response = NextResponse.json({ success: true, students: safeStudents });
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/student:', error);
    }
    return NextResponse.json({
      success: false,
      students: [],
      message: 'خطای سرور'
    }, { status: 500 });
  }
}