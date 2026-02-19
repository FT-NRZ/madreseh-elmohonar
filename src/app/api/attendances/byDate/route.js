import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// اعتبارسنجی پارامترها
function validateDate(date) {
  if (!date || typeof date !== 'string') return false;
  
  // بررسی فرمت تاریخ
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  
  // بررسی محدوده منطقی (سال 2020 تا 10 سال آینده)
  const minDate = new Date('2020-01-01');
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  
  return d >= minDate && d <= maxDate;
}

function validateClassId(classId) {
  if (!classId) return false;
  const id = Number(classId);
  return Number.isInteger(id) && id > 0 && id <= 2147483647;
}

// دریافت IP کلاینت
function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// Rate limiting ساده
const rateLimitMap = new Map();
const RATE_LIMIT = 100; // درخواست در دقیقه
const TIME_WINDOW = 60 * 1000; // 1 دقیقه

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, []);
  }
  
  const requests = rateLimitMap.get(ip);
  // پاک کردن درخواست‌های قدیمی
  const recentRequests = requests.filter(time => time > windowStart);
  rateLimitMap.set(ip, recentRequests);
  
  if (recentRequests.length >= RATE_LIMIT) {
    return false;
  }
  
  recentRequests.push(now);
  return true;
}

// بررسی دسترسی اختیاری (فقط اگر توکن ارسال شده باشد)
function validateAccessIfTokenProvided(request) {
  const authHeader = request.headers.get('authorization');
  
  // اگر توکن ارسال نشده، دسترسی آزاد
  if (!authHeader) {
    return { valid: true, hasAuth: false };
  }
  
  // اگر توکن ارسال شده، باید معتبر باشد
  if (!authHeader.startsWith('Bearer ')) {
    return { valid: false, message: 'فرمت توکن نامعتبر است' };
  }
  
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return { valid: false, message: 'توکن خالی است' };
  }
  
  try {
    const payload = verifyJWT(token);
    if (!payload) {
      return { valid: false, message: 'توکن نامعتبر است' };
    }
    
    if (!['admin', 'teacher', 'student'].includes(payload.role)) {
      return { valid: false, message: 'نقش کاربر نامعتبر است' };
    }
    
    if (!payload.userId || typeof payload.userId !== 'number') {
      return { valid: false, message: 'شناسه کاربر نامعتبر است' };
    }
    
    return { valid: true, hasAuth: true, payload };
  } catch (error) {
    return { valid: false, message: 'خطا در اعتبارسنجی توکن' };
  }
}

export async function GET(request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است',
        attendances: []
      }, { status: 429 });
    }

    // بررسی دسترسی (اختیاری)
    const accessCheck = validateAccessIfTokenProvided(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message,
        attendances: []
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const classId = searchParams.get('classId');

    // اعتبارسنجی پارامترها
    if (!date || !classId) {
      return NextResponse.json({
        success: false,
        message: 'پارامترهای ناقص',
        attendances: []
      }, { status: 400 });
    }

    if (!validateDate(date) || !validateClassId(classId)) {
      return NextResponse.json({
        success: false,
        message: 'پارامترهای نامعتبر',
        attendances: []
      }, { status: 400 });
    }

    const classIdInt = parseInt(classId);

    // بررسی وجود کلاس (امنیت اضافی)
    const classExists = await prisma.classes.findUnique({
      where: { id: classIdInt },
      select: { id: true }
    });

    if (!classExists) {
      return NextResponse.json({
        success: false,
        message: 'کلاس مورد نظر یافت نشد',
        attendances: []
      }, { status: 404 });
    }

    // دریافت حضور و غیاب
    const attendances = await prisma.attendances.findMany({
      where: {
        date: new Date(date),
        class_id: classIdInt
      },
      select: {
        id: true,
        student_id: true,
        class_id: true,
        date: true,
        status: true,
        delay_minutes: true,
        delay_reason: true,
        created_at: true,
        updated_at: true
      },
      orderBy: [
        { student_id: 'asc' },
        { created_at: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      attendances
    });

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Get attendances by date error:', error);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'رکورد مورد نظر یافت نشد',
        attendances: []
      }, { status: 404 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت اطلاعات',
      attendances: []
    }, { status: 500 });
  }
}

// محدود کردن متدهای HTTP غیرمجاز
export async function POST(request) {
  return NextResponse.json({
    success: false,
    message: 'متد POST مجاز نیست'
  }, { status: 405 });
}

export async function PUT(request) {
  return NextResponse.json({
    success: false,
    message: 'متد PUT مجاز نیست'
  }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({
    success: false,
    message: 'متد DELETE مجاز نیست'
  }, { status: 405 });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    message: 'متد PATCH مجاز نیست'
  }, { status: 405 });
}