import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.replace('Bearer ', '').trim();
  return token.length > 0 ? token : null;
}

export async function GET(request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'احراز هویت مورد نیاز است',
        userStats: { students: 0, teachers: 0, admins: 0, total: 0 }
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست',
        userStats: { students: 0, teachers: 0, admins: 0, total: 0 }
      }, { status: 403 });
    }

    // اعتبارسنجی payload
    if (!payload.userId || typeof payload.userId !== 'number') {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است',
        userStats: { students: 0, teachers: 0, admins: 0, total: 0 }
      }, { status: 401 });
    }

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

    // اعتبارسنجی نتایج
    const safeStudents = Math.max(0, students || 0);
    const safeTeachers = Math.max(0, teachers || 0);
    const safeAdmins = Math.max(0, admins || 0);
    const safeTotalUsers = Math.max(0, totalUsers || 0);

    return NextResponse.json({
      success: true,
      userStats: { 
        students: safeStudents, 
        teachers: safeTeachers, 
        admins: safeAdmins, 
        total: safeTotalUsers 
      }
    });

  } catch (error) {
    // در production هیچ اطلاعات خطا را لاگ نکن
    if (process.env.NODE_ENV === 'development') {
      console.error('GET /api/admin/stats error:', error.message);
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطای سرور',
      userStats: { students: 0, teachers: 0, admins: 0, total: 0 }
    }, { status: 500 });
  }
}