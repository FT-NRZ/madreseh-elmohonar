
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null;
}

export async function GET(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const [students, teachers, admins, totalUsers] = await Promise.all([
      prisma.entrances.count({ where: { role: 'student', is_active: true } }),
      prisma.entrances.count({ where: { role: 'teacher', is_active: true } }),
      prisma.entrances.count({ where: { role: 'admin', is_active: true } }),
      prisma.entrances.count({ where: { is_active: true } })
    ]);

    return NextResponse.json({
      success: true,
      userStats: { students, teachers, admins, total: totalUsers }
    });
  } catch (error) {
    console.error('GET /api/admin/stats error:', error);
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}
