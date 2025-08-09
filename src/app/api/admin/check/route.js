import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const adminExists = await prisma.entrances.findFirst({
      where: {
        role: 'admin',
        is_active: true
      }
    });

    return NextResponse.json({
      success: true,
      hasAdmin: !!adminExists,
      message: adminExists ? 'مدیر سیستم موجود است' : 'مدیر سیستم یافت نشد'
    });

  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({
      success: false,
      hasAdmin: false,
      message: 'خطا در بررسی وضعیت مدیر'
    }, { status: 500 });
  }
}