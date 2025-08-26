import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

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

// GET: خواندن پروفایل + نقش
export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) return NextResponse.json({ success: false, message: 'توکن ارسال نشده' }, { status: 401 });

    const token = auth.split(' ')[1];
    const payload = verifyJWT(token);
    if (!payload) return NextResponse.json({ success: false, message: 'توکن نامعتبر' }, { status: 401 });

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
        birthDate: u.birth_date ? u.birth_date.toISOString() : null, // ISO
        role: entrance.role, // student | teacher | admin
        // اطلاعات تکمیلی در صورت نیاز
        studentNumber: u.students?.student_number || null,
        teacherCode: u.teachers?.teacher_code || null,
        subject: u.teachers?.subject || null,
      },
    });
  } catch (e) {
    console.error('GET /api/user/profile', e);
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}

// PUT: به‌روزرسانی پروفایل (نام، ایمیل، موبایل، تاریخ تولد، عکس)
export async function PUT(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) return NextResponse.json({ success: false, message: 'توکن ارسال نشده' }, { status: 401 });

    const token = auth.split(' ')[1];
    const payload = verifyJWT(token);
    if (!payload) return NextResponse.json({ success: false, message: 'توکن نامعتبر' }, { status: 401 });

    const body = await req.json();
    const jsBirthDate = toJSDate(body.birthDate); // می‌تونه ISO یا DateObject یا Date باشه

    const updated = await prisma.users.update({
      where: { id: payload.userId },
      data: {
        first_name: body.firstName ?? undefined,
        last_name: body.lastName ?? undefined,
        email: body.email ?? null,          // اجازه خالی بودن
        phone: body.phone ?? null,          // اجازه خالی بودن
        birth_date: jsBirthDate,            // می‌تونه null باشه
        profile_image: body.profileImage ?? undefined, // base64 یا URL
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
    console.error('PUT /api/user/profile', e);
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}
