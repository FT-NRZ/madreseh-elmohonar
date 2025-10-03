import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const classId = searchParams.get('classId');

    if (!date || !classId) {
      return NextResponse.json({
        success: false,
        message: 'پارامترهای ناقص'
      }, { status: 400 });
    }

    const attendances = await prisma.attendances.findMany({
      where: {
        date: new Date(date),
        class_id: parseInt(classId)
      }
    });

    return NextResponse.json({
      success: true,
      attendances
    });

  } catch (error) {
    console.error('Get attendances by date error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت اطلاعات'
    }, { status: 500 });
  }
}