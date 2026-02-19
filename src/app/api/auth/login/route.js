export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/jwt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const schema = z.object({
  username: z.string().min(5).max(50),
  password: z.string().min(6).max(200),
  userType: z.enum(['student', 'teacher', 'admin']).optional()
});

function buildVariants(code) {
  const raw = (code ?? '').toString().trim();
  const withoutZeros = raw.replace(/^0+/, '');
  const tenDigit = raw.padStart(10, '0');
  return [...new Set([raw, withoutZeros, tenDigit])].filter(Boolean);
}

export async function POST(request) {
  try {
    // 1) خواندن امن بدنه + نرمال‌سازی کلیدها
    const bodyText = await request.text();
    if (!bodyText) {
      return NextResponse.json({ success: false, message: 'بدنه خالی است' }, { status: 400 });
    }

    let raw;
    try {
      raw = JSON.parse(bodyText);
    } catch {
      return NextResponse.json({ success: false, message: 'JSON نامعتبر است' }, { status: 400 });
    }

    const normalized = {
      username: raw.username ?? raw.nationalCode ?? raw.user,
      password: raw.password ?? raw.pass ?? raw.pwd,
      userType: raw.userType ?? raw.role
    };

    const parsed = schema.safeParse(normalized);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: 'اطلاعات نامعتبر', details: parsed.error.issues },
        { status: 400 }
      );
    }

    // 2) جستجوی کاربر
    const { username, password, userType } = parsed.data;
    const variants = buildVariants(username);

    const where = {
      is_active: true,
      OR: variants.map(v => ({ national_code: v })),
      ...(userType ? { role: userType } : {})
    };

    const entrance = await prisma.entrances.findFirst({
      where,
      select: {
        id: true,
        user_id: true,
        national_code: true,
        password_hash: true,
        role: true,
        is_active: true,
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            is_active: true
          }
        }
      }
    });

    if (!entrance) {
      return NextResponse.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }
    if (!entrance.users?.is_active || !entrance.is_active) {
      return NextResponse.json({ success: false, message: 'حساب کاربری غیرفعال است' }, { status: 403 });
    }

    const ok = await bcrypt.compare(password, entrance.password_hash);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'نام کاربری یا رمز عبور اشتباه است' }, { status: 401 });
    }

    // 3) ساخت توکن و پاسخ
  const token = signJWT({
    user_id: entrance.user_id,    // ✅ اضافه شد
    uid: entrance.user_id,        // ✅ سازگاری با کلاینت فعلی
    role: entrance.role,
    nc: entrance.national_code
  });
    const res = NextResponse.json({
      success: true,
      message: 'ورود موفق',
      token,
      user: {
        id: entrance.users.id,
        firstName: entrance.users.first_name,
        lastName: entrance.users.last_name,
        role: entrance.role,
        nationalCode: entrance.national_code,
        profileImage: entrance.users.profile_image
      }
    });

    res.cookies.set('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60
    });

    return res;
  } catch (e) {
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}