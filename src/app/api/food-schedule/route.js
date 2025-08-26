import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // واکشی داده‌ها از جدول food_schedule
    const schedules = await prisma.food_schedule.findMany({
      orderBy: { date: 'asc' }
    });

    // تبدیل داده‌ها به فرمت مورد نیاز فرانت
    const result = schedules.map(item => ({
      id: item.id,
      date: item.date,
      weekday: item.weekday,
      breakfast: item.breakfast || '-',
      lunch: item.lunch || '-'
    }));

    return NextResponse.json({ success: true, schedules: result });
  } catch (error) {
    console.error('Error fetching food schedules:', error);
    return NextResponse.json({ success: false, schedules: [], error: error.message }, { status: 500 });
  }
}