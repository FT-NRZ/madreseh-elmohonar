import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

// Rate limiting پیشرفته
const rateLimitMap = new Map();
const suspiciousIPs = new Map();
const RATE_LIMIT = 60; // درخواست در دقیقه
const TIME_WINDOW = 60 * 1000; // 1 دقیقه
const SUSPICIOUS_THRESHOLD = 120; // آستانه مشکوک
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

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    // بررسی User-Agent
    const userAgent = request.headers.get('user-agent');
    if (!validateUserAgent(userAgent)) {
      return Response.json({
        success: false,
        error: 'درخواست نامعتبر'
      }, { status: 400 });
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return Response.json({
        success: false,
        error: 'تعداد درخواست‌های شما بیش از حد مجاز است'
      }, { status: 429 });
    }

    // احراز هویت و نقش admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 401 });
    }

    // بررسی طول هدر امنیتی
    if (authHeader.length > 1000) {
      return Response.json({
        success: false,
        error: 'هدر احراز هویت نامعتبر است'
      }, { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // بررسی طول توکن
    if (token.length > 500) {
      return Response.json({
        success: false,
        error: 'توکن بیش از حد طولانی است'
      }, { status: 400 });
    }

    // تشخیص حملات در توکن
    if (detectSecurityThreats(token)) {
      return Response.json({
        success: false,
        error: 'توکن مشکوک شناسایی شد'
      }, { status: 400 });
    }

    const payload = verifyJWT(token);
    if (!payload || !['admin', 'teacher'].includes(payload.role)) {
      return Response.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // بررسی انقضای توکن
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return Response.json({
        success: false,
        error: 'توکن منقضی شده است'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // teachers یا students

    // اعتبارسنجی پارامتر role
    const validRoles = ['teachers', 'students'];
    if (role && !validRoles.includes(role)) {
      return Response.json({
        success: false,
        error: 'نقش نامعتبر است'
      }, { status: 400 });
    }

    // تشخیص حملات در پارامتر
    if (role && detectSecurityThreats(role)) {
      return Response.json({
        success: false,
        error: 'پارامتر مشکوک شناسایی شد'
      }, { status: 400 });
    }

    let users = [];

    if (role === 'teachers') {
      users = await prisma.teachers.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true
            }
          }
        }
      });

      users = users.map(teacher => ({
        id: teacher.id,
        user_id: teacher.users.id,
        name: `${teacher.users.first_name} ${teacher.users.last_name}`,
        username: teacher.users.username,
        teacher_code: teacher.teacher_code
      }));

    } else if (role === 'students') {
      users = await prisma.students.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true
            }
          }
        }
      });

      users = users.map(student => ({
        id: student.users.id,
        name: `${student.users.first_name} ${student.users.last_name}`,
        username: student.users.username,
        student_number: student.student_number
      }));
    }

    // محاسبه زمان پردازش
    const processingTime = Date.now() - startTime;

    // پاسخ با هدرهای امنیتی
    const response = Response.json({ success: true, users }, { status: 200 });
    
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
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching users:', error);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2025') {
      return Response.json({
        success: false,
        error: 'رکورد مورد نظر یافت نشد'
      }, { status: 404 });
    }

    if (error.code === 'P2002') {
      return Response.json({
        success: false,
        error: 'تداخل در داده‌ها'
      }, { status: 409 });
    }

    return Response.json({
      success: false,
      error: 'خطا در دریافت کاربران'
    }, { status: 500 });

  } finally {
    await prisma.$disconnect();
  }
}

// محدود کردن متدهای HTTP غیرمجاز
export async function POST(request) {
  return Response.json({
    success: false,
    error: 'متد POST مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function PUT(request) {
  return Response.json({
    success: false,
    error: 'متد PUT مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function DELETE(request) {
  return Response.json({
    success: false,
    error: 'متد DELETE مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

export async function PATCH(request) {
  return Response.json({
    success: false,
    error: 'متد PATCH مجاز نیست'
  }, { 
    status: 405,
    headers: { 
      'Allow': 'GET',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}