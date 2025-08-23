import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// ایجاد instance از Prisma
const prisma = new PrismaClient();

// دریافت تمام برنامه‌های غذایی
export async function GET() {
  try {
    const schedules = await prisma.food_schedule.findMany({
      orderBy: { date: 'desc' }
    });
    
    return NextResponse.json({ 
      success: true, 
      schedules: schedules || [] 
    });
  } catch (error) {
    console.error('خطا در دریافت برنامه غذایی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در دریافت برنامه غذایی',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// ایجاد برنامه غذایی جدید
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, meal_type, items } = body;

    // اعتبارسنجی ورودی
    if (!date || !meal_type || !items) {
      return NextResponse.json(
        {
          success: false,
          error: 'تاریخ، نوع وعده و آیتم‌ها الزامی هستند'
        },
        { status: 400 }
      );
    }

    // بررسی وجود برنامه برای آن روز و وعده
    const existingSchedule = await prisma.food_schedule.findFirst({
      where: {
        date: new Date(date),
        meal_type: meal_type
      }
    });

    let schedule;
    if (existingSchedule) {
      // به‌روزرسانی برنامه موجود
      schedule = await prisma.food_schedule.update({
        where: { id: existingSchedule.id },
        data: {
          items,
          updated_at: new Date()
        }
      });
    } else {
      // ایجاد برنامه جدید
      schedule = await prisma.food_schedule.create({
        data: {
          date: new Date(date),
          meal_type,
          items
        }
      });
    }

    return NextResponse.json({
      success: true,
      schedule,
      message: existingSchedule ? 'برنامه غذایی به‌روزرسانی شد' : 'برنامه غذایی ایجاد شد'
    });
  } catch (error) {
    console.error('خطا در ثبت برنامه غذایی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در ثبت برنامه غذایی',
        details: error.message
      },
      { status: 500 }
    );
  }
}

// حذف برنامه غذایی
export async function DELETE(request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'شناسه برنامه غذایی الزامی است' },
        { status: 400 }
      );
    }

    await prisma.food_schedule.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'برنامه غذایی با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('خطا در حذف برنامه غذایی:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'خطا در حذف برنامه غذایی',
        details: error.message
      },
      { status: 500 }
    );
  }
}