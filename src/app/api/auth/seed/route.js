import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';
import { hashPassword } from '../../../../lib/password';

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET || 'change-this-secret-key-in-production';

// تابع اعتبارسنجی secret
function validateSecret(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.replace('Bearer ', '').trim();
  return token === ADMIN_SEED_SECRET && token.length >= 16;
}

export async function POST(request) {
  try {
    // در production همیشه secret ضروری است
    if (process.env.NODE_ENV === 'production') {
      if (!validateSecret(request)) {
        return NextResponse.json({
          success: false,
          message: 'دسترسی غیرمجاز'
        }, { status: 403 });
      }
      
      // در production اگر secret پیش‌فرض باشد، اجازه نده
      if (ADMIN_SEED_SECRET === 'change-this-secret-key-in-production') {
        return NextResponse.json({
          success: false,
          message: 'secret پیش‌فرض در production مجاز نیست'
        }, { status: 403 });
      }
    }

    // در development هم secret را چک کن
    if (process.env.NODE_ENV === 'development') {
      const authHeader = request.headers.get('authorization');
      if (authHeader && !validateSecret(request)) {
        return NextResponse.json({
          success: false,
          message: 'secret نامعتبر است'
        }, { status: 403 });
      }
    }

    // بررسی وجود مدیر قبلی
    const existingAdmin = await prisma.entrances.findFirst({
      where: { 
        role: 'admin',
        is_active: true
      },
      select: {
        id: true
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: 'مدیر فعال قبلاً ایجاد شده است'
      }, { status: 409 });
    }

    // تولید رمز عبور قوی در production
    const defaultPassword = process.env.NODE_ENV === 'production' 
      ? `Admin${Date.now()}!` 
      : 'admin123456';

    // اعتبارسنجی طول رمز عبور
    if (defaultPassword.length < 8) {
      return NextResponse.json({
        success: false,
        message: 'رمز عبور باید حداقل 8 کاراکتر باشد'
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(defaultPassword);
    
    // تولید کد ملی منحصر به فرد
    const nationalCode = process.env.NODE_ENV === 'production'
      ? `${Date.now().toString().slice(-10)}`
      : '1234567890';

    // بررسی تکراری نبودن کد ملی
    const existingNationalCode = await prisma.entrances.findUnique({
      where: { national_code: nationalCode },
      select: { id: true }
    });

    if (existingNationalCode) {
      return NextResponse.json({
        success: false,
        message: 'کد ملی تکراری است'
      }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const adminUser = await tx.users.create({
        data: {
          first_name: 'مدیر',
          last_name: 'سیستم',
          phone: process.env.NODE_ENV === 'production' ? null : '09123456789',
          email: process.env.NODE_ENV === 'production' ? null : 'admin@madreseh-elmohonar.ir',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      const adminEntrance = await tx.entrances.create({
        data: {
          user_id: adminUser.id,
          national_code: nationalCode,
          password_hash: hashedPassword,
          role: 'admin',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return { adminUser, adminEntrance };
    });

    const responseData = {
      success: true,
      message: 'مدیر سیستم با موفقیت ایجاد شد',
      user: {
        id: result.adminUser.id,
        firstName: result.adminUser.first_name,
        lastName: result.adminUser.last_name,
        nationalCode: result.adminEntrance.national_code
      }
    };

    // فقط در development credential را نمایش بده
    if (process.env.NODE_ENV === 'development') {
      responseData.credentials = {
        username: nationalCode,
        password: defaultPassword,
        role: 'admin'
      };
      responseData.warning = 'این اطلاعات فقط در محیط توسعه نمایش داده می‌شود';
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Seed admin error:', error.message);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'اطلاعات تکراری وجود دارد'
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد مدیر سیستم'
    }, { status: 500 });
  }
}

// GET method را غیرفعال کن برای امنیت بیشتر
export async function GET(request) {
  return NextResponse.json({
    success: false,
    message: 'متد GET پشتیبانی نمی‌شود. از POST استفاده کنید.'
  }, { status: 405 });
}

// سایر متدها را رد کن
export async function PUT(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}

export async function DELETE(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}