import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request) {
  try {
    const { attendances } = await request.json();
    
    if (!Array.isArray(attendances) || attendances.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'داده‌های نامعتبر'
      }, { status: 400 });
    }

    console.log('Received attendances:', attendances); // برای دیباگ

    // ثبت یا بروزرسانی همه رکوردها
    const results = await Promise.all(
      attendances.map(async attendance => {
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
      attendances: results
    });

  } catch (error) {
    console.error('Bulk attendance error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ثبت حضور و غیاب',
      error: error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}