import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null;
}

export async function PATCH(request, context) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    const entrance = await prisma.entrances.findFirst({ where: { user_id: userId } });
    if (!entrance) return NextResponse.json({ success: false, message: 'کاربر یافت نشد' }, { status: 404 });

    const toggled = await prisma.entrances.update({
      where: { id: entrance.id },
      data: { is_active: !entrance.is_active }
    });

    await prisma.users.update({ where: { id: userId }, data: { is_active: toggled.is_active } });

    return NextResponse.json({ success: true, isActive: toggled.is_active });
  } catch (e) {
    console.error('PATCH /api/admin/users/[id]/toggle-status error:', e);
    return NextResponse.json({ success: false, message: 'خطا در تغییر وضعیت' }, { status: 500 });
  }
}
