import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const classes = await prisma.classes.findMany({
      orderBy: { id: 'asc' },
      include: {
        grades: true // دریافت اطلاعات پایه مرتبط با کلاس
      }
    });

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('💥 Error fetching classes:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}