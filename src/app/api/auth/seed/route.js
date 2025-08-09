import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';

export async function POST() {
  try {
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

    return NextResponse.json({
      success: true,
      message: 'مدیر سیستم با موفقیت ایجاد شد',
      credentials: {
        username: '1234567890',
        password: 'admin123',
        role: 'admin'
      },
      user: {
        id: result.adminUser.id,
        firstName: result.adminUser.first_name,
        lastName: result.adminUser.last_name
      }
    });

  } catch (error) {
    console.error('Seed admin error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد مدیر سیستم'
    }, { status: 500 });
  }
}