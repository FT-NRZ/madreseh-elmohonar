import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// لیست حضور و غیاب همه دانش‌آموزان (ادمین)
export async function GET() {
  try {
    const attendances = await prisma.attendances.findMany({
      include: { students: true, classes: true },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json({ attendances });
  } catch (error) {
    console.error('GET attendances error:', error);
    return NextResponse.json({ attendances: [] }, { status: 500 });
  }
}

// ثبت حضور و غیاب جدید (POST)
export async function POST(request) {
  try {
    const { 
      student_id, 
      class_id, 
      date, 
      status, 
      reason, 
      is_justified, 
      delay_minutes, 
      delay_reason 
    } = await request.json();
    
    console.log('Received data:', { 
      student_id, 
      class_id, 
      date, 
      status, 
      delay_minutes, 
      delay_reason 
    });
    
    // بررسی مقادیر ورودی
    if (!student_id || !class_id || !date || !status) {
      return NextResponse.json({ 
        error: 'اطلاعات ناقص است',
        details: 'student_id, class_id, date, status باید مقدار داشته باشند' 
      }, { status: 400 });
    }
    
    // تبدیل تاریخ به Date object
    const dateObj = new Date(date);
    
    // بررسی وجود رکورد قبلی
    const existing = await prisma.attendances.findFirst({
      where: {
        student_id: parseInt(student_id),
        date: dateObj
      }
    });
    
    let attendance;
    
    if (existing) {
      // اگر رکورد وجود دارد، آن را به‌روزرسانی کن
      attendance = await prisma.attendances.update({
        where: { id: existing.id },
        data: {
          class_id: parseInt(class_id),
          status,
          reason: reason || null,
          is_justified: Boolean(is_justified),
          delay_minutes: delay_minutes ? parseInt(delay_minutes) : null,
          delay_reason: delay_reason || null,
          updated_at: new Date()
        }
      });
    } else {
      // اگر رکورد وجود ندارد، رکورد جدید ایجاد کن
      attendance = await prisma.attendances.create({
        data: {
          student_id: parseInt(student_id),
          class_id: parseInt(class_id),
          date: dateObj,
          status,
          reason: reason || null,
          is_justified: Boolean(is_justified),
          delay_minutes: delay_minutes ? parseInt(delay_minutes) : null,
          delay_reason: delay_reason || null
        }
      });
    }
    
    return NextResponse.json({ 
      attendance,
      message: existing ? 'وضعیت به‌روزرسانی شد' : 'حضور و غیاب ثبت شد'
    });
  } catch (error) {
    console.error('POST attendances error:', error.message);
    return NextResponse.json({ 
      error: 'خطا در ثبت حضور و غیاب',
      details: error.message 
    }, { status: 500 });
  }
}

// حذف یا ویرایش حضور و غیاب
export async function PUT(request) {
  try {
    const { id, delay_minutes, delay_reason } = await request.json();
    
    const attendance = await prisma.attendances.update({
      where: { id: parseInt(id) },
      data: {
        delay_minutes: delay_minutes ? parseInt(delay_minutes) : null,
        delay_reason: delay_reason || null,
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ 
      attendance,
      message: 'تاخیر به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('PUT attendances error:', error);
    return NextResponse.json({ 
      error: 'خطا در به‌روزرسانی تاخیر' 
    }, { status: 500 });
  }
}