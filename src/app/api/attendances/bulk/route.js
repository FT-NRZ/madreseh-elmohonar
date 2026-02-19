import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

// اسکیما اعتبارسنجی
const attendanceSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  class_id: z.coerce.number().int().positive(),
  date: z.string().refine(val => !isNaN(Date.parse(val)), 'فرمت تاریخ نامعتبر'),
  status: z.enum(['present', 'absent', 'late', 'justified']),
  delay_minutes: z.coerce.number().int().min(0).max(480).optional().nullable(),
  delay_reason: z.string().max(500).optional().nullable()
});

// دریافت IP کلاینت
function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         request.headers.get('x-real-ip') ||
         'unknown';
}

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT = 50; // درخواست در دقیقه
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

// اعتبارسنجی توکن (اختیاری)
function validateTokenIfPresent(request) {
  const authHeader = request.headers.get('authorization');
  
  // اگر توکن نیست، دسترسی آزاد
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { valid: true, hasAuth: false };
  }
  
  try {
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return { valid: true, hasAuth: false };
    
    const payload = verifyJWT(token);
    if (payload && ['admin', 'teacher'].includes(payload.role)) {
      return { valid: true, hasAuth: true, payload };
    }
    
    return { valid: true, hasAuth: false };
  } catch {
    return { valid: true, hasAuth: false };
  }
}

export async function POST(request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({
        success: false,
        message: 'تعداد درخواست‌های شما بیش از حد مجاز است'
      }, { status: 429 });
    }

    // اعتبارسنجی توکن (اختیاری)
    const authCheck = validateTokenIfPresent(request);
    
    // دریافت داده‌ها
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    const { attendances } = requestData;
    
    if (!Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'داده‌های نامعتبر'
      }, { status: 400 });
    }

    // محدود کردن تعداد رکوردها
    if (attendances.length > 200) {
      return NextResponse.json({
        success: false,
        message: 'تعداد رکوردها بیش از حد مجاز است'
      }, { status: 400 });
    }

    console.log('Received attendances:', attendances); // برای دیباگ

    // اعتبارسنجی هر رکورد
    const validatedAttendances = [];
    for (const [index, attendance] of attendances.entries()) {
      const parseResult = attendanceSchema.safeParse(attendance);
      if (!parseResult.success) {
        return NextResponse.json({
          success: false,
          message: `رکورد ${index + 1}: ${parseResult.error.errors[0].message}`
        }, { status: 400 });
      }
      validatedAttendances.push(parseResult.data);
    }

    // ثبت یا بروزرسانی همه رکوردها
    const results = await Promise.all(
      validatedAttendances.map(async attendance => {
        try {
          // تبدیل تاریخ به فرمت صحیح
          const formattedDate = new Date(attendance.date);
          
          // بررسی وجود رکورد قبلی
          const existing = await prisma.attendances.findFirst({
            where: {
              student_id: attendance.student_id,
              date: formattedDate
            }
          });

          const data = {
            student_id: attendance.student_id,
            class_id: attendance.class_id,
            date: formattedDate,
            status: attendance.status,
            delay_minutes: attendance.delay_minutes ? parseInt(attendance.delay_minutes) : null,
            delay_reason: attendance.delay_reason || null,
            updated_at: new Date()
          };

          if (existing) {
            // بروزرسانی رکورد موجود
            return prisma.attendances.update({
              where: { id: existing.id },
              data: data
            });
          }

          // ایجاد رکورد جدید
          return prisma.attendances.create({
            data: data
          });

        } catch (error) {
          console.error('Error processing attendance:', error, attendance);
          throw error;
        }
      })
    );

    return NextResponse.json({
      success: true,
      message: 'حضور و غیاب با موفقیت ثبت شد',
      attendances: results,
      count: results.length
    });

  } catch (error) {
    console.error('Bulk attendance error:', error);
    
    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'رکورد تکراری وجود دارد'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت حضور و غیاب',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// محدود کردن متدهای HTTP
export async function GET() {
  return NextResponse.json({
    success: false,
    message: 'متد GET مجاز نیست'
  }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({
    success: false,
    message: 'متد PUT مجاز نیست'
  }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({
    success: false,
    message: 'متد DELETE مجاز نیست'
  }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({
    success: false,
    message: 'متد PATCH مجاز نیست'
  }, { status: 405 });
}