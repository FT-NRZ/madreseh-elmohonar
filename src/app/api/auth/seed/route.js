import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';
import { hashPassword } from '../../../../lib/password';

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET || 'dev-secret';

export async function POST(request) {
  try {
    // فقط در محیط توسعه یا با secret خاص اجازه اجرا بده
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || authHeader !== `Bearer ${ADMIN_SEED_SECRET}`) {
        return NextResponse.json({
          success: false,
          message: 'دسترسی غیرمجاز'
        }, { status: 403 });
      }
    }

    // بررسی وجود مدیر قبلی
    const existingAdmin = await prisma.entrances.findFirst({
      where: { role: 'admin' }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'مدیر قبلاً ایجاد شده است'
      }, { status: 409 });
    }

    // ایجاد کاربر مدیر اولیه
    const hashedPassword = await hashPassword('admin123');
    
    const result = await prisma.$transaction(async (tx) => {
      const adminUser = await tx.users.create({
        data: {
          first_name: 'مدیر',
          last_name: 'سیستم',
          phone: '09123456789',
          email: 'admin@madreseh-elmohonar.ir',
          is_active: true
        }
      });

      const adminEntrance = await tx.entrances.create({
        data: {
          user_id: adminUser.id,
          national_code: '1234567890',
          password_hash: hashedPassword,
          role: 'admin',
          is_active: true
        }
      });

      return { adminUser, adminEntrance };
    });

    // فقط در محیط توسعه credential را نمایش بده
    const responseData = {
      success: true,
      message: 'مدیر سیستم با موفقیت ایجاد شد',
      user: {
        id: result.adminUser.id,
        firstName: result.adminUser.first_name,
        lastName: result.adminUser.last_name
      }
    };

    if (process.env.NODE_ENV === 'development') {
      responseData.credentials = {
        username: '1234567890',
        password: 'admin123',
        role: 'admin'
      };
    }

    return NextResponse.json(responseData);

  } catch (error) {
    // اطلاعات حساس را لاگ نکن
    console.error('Seed admin error');
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد مدیر سیستم'
    }, { status: 500 });
  }
}

export async function GET(request) {
  return POST(request);
}