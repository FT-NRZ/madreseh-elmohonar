import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// تابع محاسبه شروع هفته (شنبه)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = یکشنبه, 1 = دوشنبه, ..., 6 = شنبه
  const diff = day === 6 ? 0 : (day === 0 ? -1 : 6 - day); // تنظیم برای شنبه به عنوان شروع هفته
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    console.log('Getting food schedules...');
    const schedules = await prisma.food_schedule.findMany({
      orderBy: [{ date: 'asc' }, { weekday: 'asc' }]
    });
    console.log('Found schedules:', schedules.length);
    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت برنامه‌ها' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Received POST request:', body);
    
    const { date, weekday, breakfast, lunch } = body;
    
    if (!date || !weekday) {
      console.log('Missing required fields');
      return NextResponse.json({ success: false, message: 'تاریخ و روز هفته الزامی است' }, { status: 400 });
    }
    
    // بررسی معتبر بودن تاریخ
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.log('Invalid date:', date);
      return NextResponse.json({ success: false, message: 'تاریخ نامعتبر است' }, { status: 400 });
    }
    
    // محاسبه شروع هفته
    const weekStartDate = getWeekStart(dateObj);
    
    console.log('Date object created:', dateObj);
    console.log('Week start date:', weekStartDate);
    
    // بررسی وجود برنامه قبلی برای همان تاریخ و روز
    const existingSchedule = await prisma.food_schedule.findFirst({
      where: {
        date: dateObj,
        weekday: weekday
      }
    });
    
    console.log('Existing schedule:', existingSchedule);
    
    if (existingSchedule) {
      // به‌روزرسانی برنامه موجود
      const updatedFood = await prisma.food_schedule.update({
        where: { id: existingSchedule.id },
        data: {
          breakfast: breakfast || null,
          lunch: lunch || null,
          week_start: weekStartDate,
          updated_at: new Date()
        }
      });
      console.log('Updated existing schedule:', updatedFood);
      return NextResponse.json({ success: true, food: updatedFood, message: 'برنامه غذایی به‌روزرسانی شد' });
    } else {
      // ایجاد برنامه جدید
      const food = await prisma.food_schedule.create({
        data: {
          date: dateObj,
          weekday,
          breakfast: breakfast || null,
          lunch: lunch || null,
          week_start: weekStartDate
        }
      });
      console.log('Created new schedule:', food);
      return NextResponse.json({ success: true, food, message: 'برنامه غذایی ثبت شد' });
    }
    
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ثبت برنامه غذایی: ' + error.message 
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    console.log('Received DELETE request:', body);
    
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه ارسال نشده' }, { status: 400 });
    }
    
    await prisma.food_schedule.delete({ 
      where: { id: parseInt(id) } 
    });
    
    console.log('Deleted schedule with id:', id);
    return NextResponse.json({ success: true, message: 'برنامه غذایی حذف شد' });
  } catch (error) {
    console.error('Error in DELETE:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'برنامه غذایی یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در حذف برنامه غذایی' 
    }, { status: 500 });
  }
}