import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

const ADMIN_CHECK_SECRET = process.env.ADMIN_CHECK_SECRET || 'dev-secret';

export async function GET(request) {
  try {
    // فقط در محیط توسعه یا با secret خاص اجازه بده
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${ADMIN_CHECK_SECRET}`) {
        return NextResponse.json({
          success: false,
          message: 'دسترسی غیرمجاز'
        }, { status: 403 });
      }
    }

    const adminExists = await prisma.entrances.findFirst({
      where: {
        role: 'admin',
        is_active: true
      }
    });

    return NextResponse.json({
      success: true,
      hasAdmin: !!adminExists
    });

  } catch (error) {
    // اطلاعات حساس را لاگ نکن
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin check error:', error);
    }
    return NextResponse.json({
      success: false,
      hasAdmin: false,
      message: 'خطای سرور'
    }, { status: 500 });
  }
}