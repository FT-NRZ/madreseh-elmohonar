import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

// کمکی: تبدیل ورودی تاریخ به Date معتبر
function toJSDate(input) {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input) ? null : input;
  if (typeof input === 'string') {
    const d = new Date(input);
    return isNaN(d) ? null : d;
  }
  if (typeof input === 'object' && typeof input.toDate === 'function') {
    const d = input.toDate();
    return isNaN(d) ? null : d;
  }
  return null;
}

// اعتبارسنجی ورودی ویرایش پروفایل
const profileSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email().max(100).nullable().optional(),
  phone: z.string().min(8).max(15).nullable().optional(),
  birthDate: z.union([z.string(), z.date()]).nullable().optional(),
  profileImage: z.string().max(500).nullable().optional()
});

// GET: خواندن پروفایل + نقش
export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'توکن ارسال نشده' }, { status: 401 });
    }
    const token = auth.split(' ')[1];
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'توکن نامعتبر' }, { status: 401 });
    }

    // گرفتن entrance برای نقش، و users برای جزئیات
    const entrance = await prisma.entrances.findUnique({
      where: { user_id: payload.userId },
      include: {
        users: {
          include: { students: true, teachers: true },
        },
      },
    });

    if (!entrance?.users) {
      return NextResponse.json({ success: false, message: 'کاربر پیدا نشد' }, { status: 404 });
    }

    const u = entrance.users;

    return NextResponse.json({
      success: true,
      user: {
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        phone: u.phone,
        profileImage: u.profile_image,
        birthDate: u.birth_date ? u.birth_date.toISOString() : null,
        role: entrance.role,
        studentNumber: u.students?.student_number || null,
        teacherCode: u.teachers?.teacher_code || null,
        subject: u.teachers?.subject || null,
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GET /api/user/profile', e);
    }
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}

// PUT: به‌روزرسانی پروفایل (نام، ایمیل، موبایل، تاریخ تولد، عکس)
export async function PUT(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'توکن ارسال نشده' }, { status: 401 });
    }
    const token = auth.split(' ')[1];
    const payload = verifyJWT(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: 'توکن نامعتبر' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, message: 'فرمت ورودی نامعتبر است' }, { status: 400 });
    }
    const parseResult = profileSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'ورودی نامعتبر است' }, { status: 400 });
    }
    const { firstName, lastName, email, phone, birthDate, profileImage } = parseResult.data;

    // جلوگیری از تکراری بودن ایمیل یا موبایل (در صورت تغییر)
    if (email) {
      const exists = await prisma.users.findFirst({
        where: { email, id: { not: payload.userId } }
      });
      if (exists) {
        return NextResponse.json({ success: false, message: 'این ایمیل قبلاً ثبت شده است' }, { status: 400 });
      }
    }
    if (phone) {
      const exists = await prisma.users.findFirst({
        where: { phone, id: { not: payload.userId } }
      });
      if (exists) {
        return NextResponse.json({ success: false, message: 'این شماره موبایل قبلاً ثبت شده است' }, { status: 400 });
      }
    }

    const jsBirthDate = toJSDate(birthDate);

    const updated = await prisma.users.update({
      where: { id: payload.userId },
      data: {
        first_name: firstName ?? undefined,
        last_name: lastName ?? undefined,
        email: email ?? null,
        phone: phone ?? null,
        birth_date: jsBirthDate,
        profile_image: profileImage ?? undefined,
      },
    });

    // نقش را هم برگردانیم
    const entrance = await prisma.entrances.findUnique({
      where: { user_id: payload.userId },
      select: { role: true },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        firstName: updated.first_name,
        lastName: updated.last_name,
        email: updated.email,
        phone: updated.phone,
        profileImage: updated.profile_image,
        birthDate: updated.birth_date ? updated.birth_date.toISOString() : null,
        role: entrance?.role ?? null,
      },
    });
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PUT /api/user/profile', e);
    }
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}