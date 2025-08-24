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
    return NextResponse.json({ attendances: [] }, { status: 500 });
  }
}

// ثبت حضور و غیاب جدید (POST)
export async function POST(request) {
  try {
    const { student_id, class_id, date, status, reason, is_justified } = await request.json();
    const existing = await prisma.attendances.findUnique({
      where: { student_id_date: { student_id, date } }
    });
    if (existing) {
      return NextResponse.json({ error: 'قبلاً ثبت شده' }, { status: 400 });
    }
    const attendance = await prisma.attendances.create({
      data: { student_id, class_id, date, status, reason, is_justified }
    });
    return NextResponse.json({ attendance });
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ثبت حضور و غیاب' }, { status: 500 });
  }
}