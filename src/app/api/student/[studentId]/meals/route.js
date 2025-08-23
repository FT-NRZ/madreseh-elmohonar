import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const weekDaysFa = {
  saturday: 'شنبه',
  sunday: 'یکشنبه',
  monday: 'دوشنبه',
  tuesday: 'سه‌شنبه',
  wednesday: 'چهارشنبه'
};

export async function GET(req, { params }) {
  const { searchParams } = new URL(req.url);
  let week_start = searchParams.get('week_start');
  // اگر week_start نبود، آخرین هفته را پیدا کن
  if (!week_start) {
    const last = await prisma.food_schedule.findFirst({
      orderBy: { week_start: 'desc' }
    });
    week_start = last ? last.week_start.toISOString().slice(0, 10) : null;
    if (!week_start) return NextResponse.json({ meals: [] });
  }
  const meals = await prisma.food_schedule.findMany({
    where: { week_start: new Date(week_start) },
    orderBy: { weekday: 'asc' }
  });
  // تبدیل به فرمت مناسب جدول دانش‌آموز
  let result = [];
  meals.forEach(m => {
    if (m.breakfast)
      result.push({ day: weekDaysFa[m.weekday], type: 'صبحانه', food: m.breakfast });
    if (m.lunch)
      result.push({ day: weekDaysFa[m.weekday], type: 'ناهار', food: m.lunch });
  });
  return NextResponse.json({ meals: result });
}