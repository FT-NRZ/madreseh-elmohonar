import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const workshops = await prisma.workshops.findMany({
      where: {
        is_active: true
      },
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      workshops
    });
  } catch (error) {
    console.error('Error fetching workshops:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در دریافت کارگاه‌ها'
    }, { status: 500 });
  }
}