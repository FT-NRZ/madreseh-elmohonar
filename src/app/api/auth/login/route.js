import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyPassword, DUMMY_PASSWORD_HASH, hashToken } from '@/lib/password';
import { signJWT } from '@/lib/jwt';
import { z } from 'zod';

// schema validation
const bodySchema = z.object({
  username: z.string().min(5).max(50), // adjust to your national_code rules
  password: z.string().min(8).max(200),
  userType: z.enum(['student','teacher','admin']).optional()
});

export async function POST(request) {
  try {
    // دریافت و اعتبارسنجی ورودی
    const raw = await request.text();
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'درخواست نامعتبر' }, { status: 400 });
    }
    const parseResult = bodySchema.safeParse(parsed);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'لطفاً ورودی‌ها را بررسی کنید' }, { status: 400 });
    }
    const { username, password, userType } = parseResult.data;

    // تولید حالت‌های مختلف کد ملی (با و بدون صفرهای ابتدای)
    const rawCode = username.toString().trim();
    const noLeading = rawCode.replace(/^0+/, '');
    const variants = Array.from(new Set([rawCode, noLeading]));

    // ساخت شرط جستجو
    const where = {
      is_active: true,
      OR: variants.map(v => ({ national_code: v })),
      ...(userType ? { role: userType } : {})
    };

    // جستجوی کاربر
    const entrance = await prisma.entrances.findFirst({
      where,
      include: {
        users: {
          include: {
            students: true,
            teachers: true
          }
        }
      }
    });

    // اگر کاربر نبود: fake verify برای جلوگیری از timing attack
    if (!entrance) {
      await verifyPassword(password, DUMMY_PASSWORD_HASH);
      return NextResponse.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    // اگر userType ارسال شده و با role دیتابیس تطابق ندارد: fake verify
    if (userType && entrance.role !== userType) {
      await verifyPassword(password, entrance.password_hash);
      return NextResponse.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    // بررسی قفل بودن حساب
    if (entrance.locked_until && entrance.locked_until > new Date()) {
      const lockTime = Math.ceil((entrance.locked_until.getTime() - Date.now()) / (1000 * 60));
      // پیام دقیق برای کاربر خودش، پیام کلی برای دیگران (در اینجا پیام دقیق)
      return NextResponse.json({ success: false, message: `حساب کاربری شما به مدت ${lockTime} دقیقه قفل شده است` }, { status: 423 });
    }

    // بررسی رمز عبور
    const isPasswordValid = await verifyPassword(password, entrance.password_hash);

    if (!isPasswordValid) {
      // افزایش تلاش ناموفق و قفل در صورت نیاز (اتمیک)
      const updated = await prisma.entrances.update({
        where: { id: entrance.id },
        data: {
          failed_attempts: { increment: 1 }
        },
        select: { failed_attempts: true }
      });

      let lockedUntil = null;
      if (updated.failed_attempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.entrances.update({
          where: { id: entrance.id },
          data: { locked_until: lockedUntil }
        });
      }

      return NextResponse.json({
        success: false,
        message: updated.failed_attempts >= 5 ? 'حساب کاربری شما قفل شد' : 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // موفقیت: ریست تلاش‌های ناموفق و ثبت زمان ورود
    await prisma.entrances.update({
      where: { id: entrance.id },
      data: {
        failed_attempts: 0,
        locked_until: null,
        last_login_at: new Date()
      }
    });

    // ساخت JWT امن با exp و jti
    const jti = randomUUID();
    const accessToken = signJWT({
      userId: entrance.user_id,
      role: entrance.role,
      nationalCode: entrance.national_code
    }, {
      expiresIn: '7d', // مطابق کد شما
      jwtid: jti
    });

    // تولید و ذخیره refresh token (hash در DB)
    const refreshTokenPlain = randomUUID() + '.' + randomUUID();
    const refreshTokenHash = await hashToken(refreshTokenPlain);

    await prisma.refreshTokens.create({
      data: {
        user_id: entrance.user_id,
        token_hash: refreshTokenHash,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 روز
      }
    });

    // اطلاعات اضافه برای دانش‌آموز و معلم
    let additionalInfo = {};
    if (entrance.role === 'student' && entrance.users?.students) {
      additionalInfo = { studentNumber: entrance.users.students.student_number };
    } else if (entrance.role === 'teacher' && entrance.users?.teachers) {
      additionalInfo = { teacherCode: entrance.users.teachers.teacher_code, subject: entrance.users.teachers.subject };
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

    res.cookies.set({
      name: 'access_token',
      value: accessToken,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 // 7 روز
    });

    res.cookies.set({
      name: 'refresh_token',
      value: refreshTokenPlain,
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 روز
    });

    return res;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور'
    }, { status: 500 });
  }
}