import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

const ADMIN_CHECK_SECRET = process.env.ADMIN_CHECK_SECRET || 'change-this-secret-key';

export async function GET(request) {
  try {
    // در محیط production همیشه secret ضروری است
    if (process.env.NODE_ENV === 'production') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({
          success: false,
          message: 'دسترسی غیرمجاز'
        }, { status: 403 });
      }

      const token = authHeader.replace('Bearer ', '').trim();
      if (token !== ADMIN_CHECK_SECRET || !token || token.length < 8) {
        return NextResponse.json({
          success: false,
          message: 'دسترسی غیرمجاز'
        }, { status: 403 });
      }
    }

    // در محیط development هم امنیت اولیه داشته باش
    if (process.env.NODE_ENV === 'development') {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        if (token && token !== ADMIN_CHECK_SECRET) {
          return NextResponse.json({
            success: false,
            message: 'دسترسی غیرمجاز'
          }, { status: 403 });
        }
      }
    }

    // فقط چک کردن وجود مدیر، بدون برگرداندن اطلاعات اضافی
    const adminExists = await prisma.entrances.findFirst({
      where: {
        role: 'admin',
        is_active: true
      },
      select: {
        id: true // فقط id برای چک وجود
      }
    });

    return NextResponse.json({
      success: true,
      hasAdmin: !!adminExists
    });

  } catch (error) {
    // هیچ اطلاعات خطا را لاگ نکن در production
    if (process.env.NODE_ENV === 'development') {
      console.error('Admin check error:', error.message);
    }
    
    return NextResponse.json({
      success: false,
      hasAdmin: false,
      message: 'خطای سرور'
    }, { status: 500 });
  }
}