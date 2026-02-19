import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyPassword, DUMMY_PASSWORD_HASH, hashToken } from '@/lib/password';
import { signJWT } from '@/lib/jwt';
import { z } from 'zod';

// schema validation با محدودیت‌های امنیتی
const bodySchema = z.object({
  username: z.string()
    .min(5, 'نام کاربری باید حداقل 5 کاراکتر باشد')
    .max(50, 'نام کاربری باید حداکثر 50 کاراکتر باشد')
    .regex(/^[0-9]+$/, 'نام کاربری فقط باید شامل اعداد باشد')
    .transform(val => val.trim()),
  password: z.string()
    .min(6, 'رمز عبور باید حداقل 6 کاراکتر باشد')
    .max(200, 'رمز عبور خیلی طولانی است'),
  userType: z.enum(['student', 'teacher', 'admin']).optional()
});

// محدود کردن تعداد درخواست‌ها از هر IP (Rate limiting)
const attemptTracker = new Map();
const MAX_ATTEMPTS_PER_IP = 10;
const RESET_INTERVAL = 15 * 60 * 1000; // 15 دقیقه

function getRealIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0] ||
         request.headers.get('x-real-ip') ||
         request.headers.get('cf-connecting-ip') ||
         'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  const attempts = attemptTracker.get(ip) || { count: 0, lastReset: now };
  
  // ریست کردن اگر زمان گذشته
  if (now - attempts.lastReset > RESET_INTERVAL) {
    attempts.count = 0;
    attempts.lastReset = now;
  }
  
  attempts.count++;
  attemptTracker.set(ip, attempts);
  
  return attempts.count <= MAX_ATTEMPTS_PER_IP;
}

// اعتبارسنجی کد ملی
function validateNationalCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== 10) return false;
  if (!/^\d{10}$/.test(code)) return false;
  
  // بررسی کد ملی تکراری
  const invalidCodes = ['0000000000', '1111111111', '2222222222', '3333333333', '4444444444', '5555555555', '6666666666', '7777777777', '8888888888', '9999999999'];
  if (invalidCodes.includes(code)) return false;
  
  return true;
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    // بررسی Rate Limiting
    const clientIP = getRealIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه بعد تلاش کنید.'
      }, { status: 429 });
    }

    // اعتبارسنجی Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({
        success: false,
        message: 'نوع محتوا معتبر نیست'
      }, { status: 400 });
    }

    // محدود کردن اندازه درخواست
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > 1024) { // 1KB max
      return NextResponse.json({
        success: false,
        message: 'اندازه درخواست بیش از حد مجاز است'
      }, { status: 413 });
    }

    // دریافت و اعتبارسنجی ورودی
    let raw;
    try {
      raw = await request.text();
      if (!raw || raw.trim().length === 0) {
        return NextResponse.json({
          success: false,
          message: 'داده‌های ورودی خالی است'
        }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'خطا در خواندن داده‌های ورودی'
      }, { status: 400 });
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    // بررسی وجود فیلدهای اصلی
    if (!parsed || typeof parsed !== 'object') {
      return NextResponse.json({
        success: false,
        message: 'ساختار داده نامعتبر است'
      }, { status: 400 });
    }

    const parseResult = bodySchema.safeParse(parsed);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({
        success: false,
        message: `اطلاعات نامعتبر: ${errorMessage}`
      }, { status: 400 });
    }

    const { username, password, userType } = parseResult.data;

    // اعتبارسنجی کد ملی
    if (!validateNationalCode(username)) {
      // fake verify برای timing attack protection
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // تولید حالت‌های مختلف کد ملی (با و بدون صفرهای ابتدای)
    const rawCode = username.toString().trim();
    const paddedCode = rawCode.padStart(10, '0'); // اضافه کردن صفر به ابتدا
    const variants = Array.from(new Set([rawCode, paddedCode]));

    // ساخت شرط جستجو
    const where = {
      is_active: true,
      OR: variants.map(v => ({ national_code: v })),
      ...(userType ? { role: userType } : {})
    };

    // جستجوی کاربر
    const entrance = await prisma.entrances.findFirst({
      where,
      select: {
        id: true,
        user_id: true,
        national_code: true,
        password_hash: true,
        role: true,
        failed_attempts: true,
        locked_until: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            is_active: true,
            students: {
              select: {
                student_number: true
              }
            },
            teachers: {
              select: {
                teacher_code: true,
                subject: true
              }
            }
          }
        }
      }
    });

    // اگر کاربر نبود: fake verify برای جلوگیری از timing attack
    if (!entrance) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // بررسی فعال بودن کاربر
    if (!entrance.users?.is_active) {
      await verifyPassword(password, entrance.password_hash);
      return NextResponse.json({
        success: false,
        message: 'حساب کاربری شما غیرفعال است'
      }, { status: 403 });
    }

    // اگر userType ارسال شده و با role دیتابیس تطابق ندارد: fake verify
    if (userType && entrance.role !== userType) {
      await verifyPassword(password, entrance.password_hash);
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // بررسی قفل بودن حساب
    if (entrance.locked_until && entrance.locked_until > new Date()) {
      const lockTime = Math.ceil((entrance.locked_until.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json({
        success: false,
        message: `حساب کاربری شما به مدت ${lockTime} دقیقه قفل شده است`
      }, { status: 423 });
    }

    // بررسی رمز عبور
    const isPasswordValid = await verifyPassword(password, entrance.password_hash);

    if (!isPasswordValid) {
      // افزایش تلاش ناموفق و قفل در صورت نیاز (اتمیک)
      const updated = await prisma.entrances.update({
        where: { id: entrance.id },
        data: {
          failed_attempts: { increment: 1 },
          updated_at: new Date()
        },
        select: { failed_attempts: true }
      });

      let lockedUntil = null;
      if (updated.failed_attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.entrances.update({
          where: { id: entrance.id },
          data: { 
            locked_until: lockedUntil,
            updated_at: new Date()
          }
        });
      }

      return NextResponse.json({
        success: false,
        message: updated.failed_attempts >= 5 
          ? 'حساب کاربری شما قفل شد' 
          : 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // موفقیت: ریست تلاش‌های ناموفق و ثبت زمان ورود
    await prisma.entrances.update({
      where: { id: entrance.id },
      data: {
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
        updated_at: new Date()
      }
    });

    // ساخت JWT امن با exp و jti
    const jti = randomUUID();
    const tokenPayload = {
      userId: entrance.user_id,
      role: entrance.role,
      nationalCode: entrance.national_code,
      iat: Math.floor(Date.now() / 1000)
    };

    const accessToken = signJWT(tokenPayload, {
      expiresIn: '7d',
      jwtid: jti
    });

    // تولید و ذخیره refresh token (hash در DB)
    const refreshTokenPlain = `${randomUUID()}.${randomUUID()}.${Date.now()}`;
    const refreshTokenHash = await hashToken(refreshTokenPlain);

    // پاک کردن refresh token های قدیمی کاربر
    await prisma.refreshTokens.deleteMany({
      where: {
        user_id: entrance.user_id,
        expires_at: {
          lt: new Date()
        }
      }
    });

    await prisma.refreshTokens.create({
      data: {
        user_id: entrance.user_id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 روز
        created_at: new Date()
      }
    });

    // اطلاعات اضافه برای دانش‌آموز و معلم
    let additionalInfo = {};
    if (entrance.role === 'student' && entrance.users?.students) {
      additionalInfo = { studentNumber: entrance.users.students.student_number };
    } else if (entrance.role === 'teacher' && entrance.users?.teachers) {
      additionalInfo = { 
        teacherCode: entrance.users.teachers.teacher_code, 
        subject: entrance.users.teachers.subject 
      };
    }

    // محاسبه زمان پردازش
    const processingTime = Date.now() - startTime;
    
    // حداقل زمان انتظار برای timing attack protection
    const minResponseTime = 100;
    if (processingTime < minResponseTime) {
      await new Promise(resolve => setTimeout(resolve, minResponseTime - processingTime));
    }

    // ست کردن کوکی HttpOnly برای access و refresh token
    const res = NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      token: accessToken,
      user: {
        id: entrance.users.id,
        firstName: entrance.users.first_name,
        lastName: entrance.users.last_name,
        role: entrance.role,
        profileImage: entrance.users.profile_image,
        nationalCode: entrance.national_code,
        ...additionalInfo
      }
    });

    // تنظیمات امن کوکی
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookies.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    res.cookies.set({
      name: 'refresh_token',
      value: refreshTokenPlain,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 روز
    });

    // هدرهای امنیتی
    res.headers.set('X-Frame-Options', 'DENY');
    res.headers.set('X-Content-Type-Options', 'nosniff');
    res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return res;

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Login error:', error.message);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'خطا در پردازش درخواست'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطای سرور. لطفاً دوباره تلاش کنید.'
    }, { status: 500 });
  }
}

// محدود کردن متدهای HTTP
export async function GET(request) {
  return NextResponse.json({
    success: false,
    message: 'متد GET پشتیبانی نمی‌شود'
  }, { status: 405 });
}

export async function PUT(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}