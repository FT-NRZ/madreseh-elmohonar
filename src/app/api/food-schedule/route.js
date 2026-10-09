import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// محاسبه بازه هفته جاری (شنبه تا چهارشنبه) بر اساس ساعت ایران (UTC+3:30)
function getCurrentWeekRange() {
  const now = new Date();
  const iranNow = new Date(now.getTime() + 3.5 * 60 * 60 * 1000);
  const day = iranNow.getUTCDay(); // 6 = شنبه، 0 = یکشنبه
  const daysSinceSaturday = day === 6 ? 0 : day + 1;
  const start = new Date(Date.UTC(iranNow.getUTCFullYear(), iranNow.getUTCMonth(), iranNow.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - daysSinceSaturday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 5); // تا پایان چهارشنبه (پنجشنبه شامل نمی‌شود)
  return { start, end };
}

export async function GET() {
  try {
    const { start, end } = getCurrentWeekRange();

    // واکشی فقط برنامه غذایی هفته جاری از جدول food_schedule
    const schedules = await prisma.food_schedule.findMany({
      where: { date: { gte: start, lt: end } },
      orderBy: { date: 'asc' }
    });

    // تبدیل داده‌ها به فرمت مورد نیاز فرانت
    const result = schedules.map(item => ({
      id: item.id,
      date: item.date,
      weekday: item.weekday,
      breakfast: [item.breakfast_1, item.breakfast_2, item.breakfast_3].filter(Boolean).join('، ') || '-',
      lunch: item.lunch || '-'
    }));

    return NextResponse.json({ success: true, schedules: result });
  } catch (error) {
    console.error('Error fetching food schedules:', error);
    return NextResponse.json({ success: false, schedules: [], error: error.message }, { status: 500 });
  }
}