import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// فیلدهای قابل ویرایش/حذف جداگانه
const EDITABLE_FIELDS = ['breakfast_1', 'breakfast_2', 'breakfast_3', 'lunch'];

// تابع محاسبه شروع هفته (شنبه)
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = یکشنبه, 1 = دوشنبه, ..., 6 = شنبه
  const diff = day === 6 ? 0 : (day === 0 ? -1 : 6 - day); // تنظیم برای شنبه به عنوان شروع هفته
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// نرمال‌سازی ورودی صبحانه: آرایه سه‌تایی یا مقدار تکی قدیمی
function normalizeBreakfasts(body) {
  if (Array.isArray(body.breakfasts)) {
    return [
      body.breakfasts[0]?.trim() || null,
      body.breakfasts[1]?.trim() || null,
      body.breakfasts[2]?.trim() || null
    ];
  }
  return [body.breakfast?.trim() || null, null, null];
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const where = {};
    if (from && /^\d{4}-\d{2}-\d{2}$/.test(from)) {
      where.date = { ...(where.date || {}), gte: new Date(`${from}T00:00:00.000Z`) };
    }
    if (to && /^\d{4}-\d{2}-\d{2}$/.test(to)) {
      const end = new Date(`${to}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      where.date = { ...(where.date || {}), lt: end };
    }

    console.log('Getting food schedules...', where);
    const schedules = await prisma.food_schedule.findMany({
      where,
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

    const { date, weekday, lunch } = body;
    const [breakfast_1, breakfast_2, breakfast_3] = normalizeBreakfasts(body);

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

    const data = {
      breakfast_1,
      breakfast_2,
      breakfast_3,
      lunch: lunch?.trim() || null,
      week_start: weekStartDate,
      updated_at: new Date()
    };

    // بررسی وجود برنامه قبلی برای همان تاریخ و روز
    const existingSchedule = await prisma.food_schedule.findFirst({
      where: {
        date: dateObj,
        weekday: weekday
      }
    });

    if (existingSchedule) {
      // به‌روزرسانی برنامه موجود
      const updatedFood = await prisma.food_schedule.update({
        where: { id: existingSchedule.id },
        data
      });
      console.log('Updated existing schedule:', updatedFood.id);
      return NextResponse.json({ success: true, food: updatedFood, message: 'برنامه غذایی به‌روزرسانی شد' });
    } else {
      // ایجاد برنامه جدید
      const food = await prisma.food_schedule.create({
        data: { date: dateObj, weekday, ...data }
      });
      console.log('Created new schedule:', food.id);
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

// ویرایش یا حذف یک وعده/گزینه به‌صورت جداگانه
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, field, value } = body;

    if (!id || !field || !EDITABLE_FIELDS.includes(field)) {
      return NextResponse.json({ success: false, message: 'شناسه یا فیلد نامعتبر است' }, { status: 400 });
    }

    const updated = await prisma.food_schedule.update({
      where: { id: parseInt(id) },
      data: {
        [field]: value?.trim() ? value.trim() : null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true, food: updated, message: value?.trim() ? 'وعده به‌روزرسانی شد' : 'وعده حذف شد' });
  } catch (error) {
    console.error('Error in PATCH:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ success: false, message: 'برنامه غذایی یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: false, message: 'خطا در ویرایش برنامه غذایی' }, { status: 500 });
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