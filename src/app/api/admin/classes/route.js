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

    const classes = await prisma.classes.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, class_name: true, class_number: true, academic_year: true }
    });

    return NextResponse.json({ classes });
  } catch (e) {
    console.error('GET /api/admin/classes error:', e);
    return NextResponse.json({ success: false, message: 'خطا در دریافت کلاس‌ها' }, { status: 500 });
  }
}