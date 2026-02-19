import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

// اسکیما اعتبارسنجی حضور و غیاب
const attendanceSchema = z.object({
  student_id: z.coerce.number().int().positive().max(2147483647),
  class_id: z.coerce.number().int().positive().max(2147483647),
  date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'فرمت تاریخ نامعتبر است' }),
  status: z.enum(['present', 'absent', 'late', 'justified']),
  reason: z.string().max(200).optional().nullable(),
  is_justified: z.coerce.boolean().optional().nullable(),
  delay_minutes: z.coerce.number().int().min(0).max(300).optional().nullable(),
  delay_reason: z.string().max(200).optional().nullable()
});

// اسکیما اعتبارسنجی ویرایش تاخیر
const delaySchema = z.object({
  id: z.coerce.number().int().positive().max(2147483647),
  delay_minutes: z.coerce.number().int().min(0).max(300).optional().nullable(),
  delay_reason: z.string().max(200).optional().nullable()
});

// تابع دریافت توکن از هدر
function getToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return token.length > 0 ? token : null;
}

// بررسی دسترسی ادمین یا معلم
async function validateAccess(request) {
  const token = getToken(request);
  if (!token) return { valid: false, message: 'احراز هویت مورد نیاز است' };

  try {
    const payload = verifyJWT(token);
    if (!payload) {
      return { valid: false, message: 'توکن نامعتبر است' };
    }

    // فقط ادمین و معلم مجاز هستند
    if (!['admin', 'teacher'].includes(payload.role)) {
      return { valid: false, message: 'دسترسی مجاز نیست' };
    }

    // اعتبارسنجی اضافی payload
    if (!payload.userId || typeof payload.userId !== 'number') {
      return { valid: false, message: 'توکن نامعتبر است' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, message: 'توکن نامعتبر است' };
  }
}

// لیست حضور و غیاب همه دانش‌آموزان (ادمین/معلم)
export async function GET(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message,
        attendances: []
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    const attendances = await prisma.attendances.findMany({
      include: { 
        students: {
          select: {
            id: true,
            student_number: true,
            users: { select: { first_name: true, last_name: true } }
          }
        },
        classes: true
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, attendances });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GET attendances error:', error);
    }
    return NextResponse.json({ 
      success: false,
      attendances: [],
      message: 'خطا در دریافت لیست حضور و غیاب'
    }, { status: 500 });
  }
}

// ثبت حضور و غیاب جدید (POST)
export async function POST(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    // اعتبارسنجی ورودی
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    const parseResult = attendanceSchema.safeParse(requestData);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({
        success: false,
        message: `اطلاعات نامعتبر: ${errorMessage}`
      }, { status: 400 });
    }

    const {
      student_id, class_id, date, status, reason, is_justified, delay_minutes, delay_reason
    } = parseResult.data;

    // بررسی وجود دانش‌آموز
    const student = await prisma.students.findUnique({
      where: { id: student_id },
      select: { id: true }
    });
    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'دانش‌آموز انتخاب شده وجود ندارد'
      }, { status: 404 });
    }

    // بررسی وجود کلاس
    const classObj = await prisma.classes.findUnique({
      where: { id: class_id },
      select: { id: true }
    });
    if (!classObj) {
      return NextResponse.json({
        success: false,
        message: 'کلاس انتخاب شده وجود ندارد'
      }, { status: 404 });
    }

    // تبدیل تاریخ به Date object
    const dateObj = new Date(date);

    // بررسی وجود رکورد قبلی
    const existing = await prisma.attendances.findFirst({
      where: {
        student_id,
        date: dateObj
      }
    });

    let attendance;
    if (existing) {
      // اگر رکورد وجود دارد، آن را به‌روزرسانی کن
      attendance = await prisma.attendances.update({
        where: { id: existing.id },
        data: {
          class_id,
          status,
          reason: reason || null,
          is_justified: Boolean(is_justified),
          delay_minutes: delay_minutes ?? null,
          delay_reason: delay_reason || null,
          updated_at: new Date()
        }
      });
    } else {
      // اگر رکورد وجود ندارد، رکورد جدید ایجاد کن
      attendance = await prisma.attendances.create({
        data: {
          student_id,
          class_id,
          date: dateObj,
          status,
          reason: reason || null,
          is_justified: Boolean(is_justified),
          delay_minutes: delay_minutes ?? null,
          delay_reason: delay_reason || null
        }
      });
    }

    return NextResponse.json({
      success: true,
      attendance,
      message: existing ? 'وضعیت به‌روزرسانی شد' : 'حضور و غیاب ثبت شد'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('POST attendances error:', error.message);
    }
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت حضور و غیاب'
    }, { status: 500 });
  }
}

// حذف یا ویرایش حضور و غیاب (فقط تاخیر)
export async function PUT(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    // اعتبارسنجی ورودی
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    const parseResult = delaySchema.safeParse(requestData);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({
        success: false,
        message: `اطلاعات نامعتبر: ${errorMessage}`
      }, { status: 400 });
    }

    const { id, delay_minutes, delay_reason } = parseResult.data;

    // بررسی وجود رکورد حضور و غیاب
    const attendance = await prisma.attendances.findUnique({
      where: { id },
      select: { id: true }
    });
    if (!attendance) {
      return NextResponse.json({
        success: false,
        message: 'رکورد حضور و غیاب یافت نشد'
      }, { status: 404 });
    }

    const updated = await prisma.attendances.update({
      where: { id },
      data: {
        delay_minutes: delay_minutes ?? null,
        delay_reason: delay_reason || null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      attendance: updated,
      message: 'تاخیر به‌روزرسانی شد'
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PUT attendances error:', error);
    }
    return NextResponse.json({
      success: false,
      message: 'خطا در به‌روزرسانی تاخیر'
    }, { status: 500 });
  }
}

// محدود کردن متدهای غیرمجاز
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