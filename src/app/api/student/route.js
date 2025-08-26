import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const students = await prisma.students.findMany({
      include: {
        users: true, // شامل کردن اطلاعات کاربر
        classes: true // شامل کردن اطلاعات کلاس
      },
      orderBy: { id: 'asc' }
    });
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ students: [] }, { status: 500 });
  }
}