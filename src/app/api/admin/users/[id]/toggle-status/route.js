import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// تابع دریافت توکن از هدر
function getToken(request) {
  const auth = request.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null;
}

// تغییر وضعیت فعال/غیرفعال کاربر (PATCH)
export async function PATCH(request, context) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: 'شناسه کاربر معتبر نیست'
      }, { status: 400 });
    }

    // یافتن اطلاعات ورود کاربر
    const entrance = await prisma.entrances.findFirst({
      where: { user_id: userId },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            is_active: true
          }
        }
      }
    });

    if (!entrance) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    // تغییر وضعیت در هر دو جدول
    const newStatus = !entrance.is_active;

    await prisma.$transaction(async (tx) => {
      // به‌روزرسانی وضعیت در جدول entrances
      await tx.entrances.update({
        where: { id: entrance.id },
        data: {
          is_active: newStatus,
          updated_at: new Date()
        }
      });

      // به‌روزرسانی وضعیت در جدول users
      await tx.users.update({
        where: { id: userId },
        data: {
          is_active: newStatus,
          updated_at: new Date()
        }
      });
    });

    const statusText = newStatus ? 'فعال' : 'غیرفعال';
    const userName = `${entrance.users.first_name} ${entrance.users.last_name}`;

    return NextResponse.json({
      success: true,
      isActive: newStatus,
      message: `وضعیت کاربر ${userName} به ${statusText} تغییر یافت`
    });

  } catch (error) {
    console.error('PATCH /api/admin/users/[id]/toggle-status error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در تغییر وضعیت کاربر'
    }, { status: 500 });
  }
}