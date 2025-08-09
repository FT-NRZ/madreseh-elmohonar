import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request) {
  try {
    // بررسی احراز هویت
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'احراز هویت مورد نیاز است'
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی مجاز نیست'
      }, { status: 403 });
    }

    // شمارش کاربران بر اساس نقش - با admins اضافه شده
    const [students, teachers, admins, totalUsers] = await Promise.all([
      prisma.entrances.count({
        where: { 
          role: 'student',
          is_active: true 
        }
      }),
      prisma.entrances.count({
        where: { 
          role: 'teacher',
          is_active: true 
        }
      }),
      prisma.entrances.count({
        where: { 
          role: 'admin',
          is_active: true 
        }
      }),
      prisma.entrances.count({
        where: { 
          is_active: true 
        }
      })
    ]);

    console.log('📊 Stats calculated:', { students, teachers, admins, totalUsers }); // Debug

    return NextResponse.json({
      success: true,
      userStats: {
        students,
        teachers,
        admins,        // 👈 این خط اضافه شده
        total: totalUsers
      }
    });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + error.message
    }, { status: 500 });
  }
}