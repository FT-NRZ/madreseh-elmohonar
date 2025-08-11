import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

// DELETE - حذف کاربر
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
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

    const userId = parseInt(id);

    // حذف کاربر (CASCADE خودکار اتفاق می‌افتد)
    await prisma.users.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در حذف کاربر'
    }, { status: 500 });
  }
}

// PUT - ویرایش کاربر
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
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

    const userId = parseInt(id);
    const body = await request.json();
    const { firstName, lastName, nationalCode, phone, email, role, password } = body;

    console.log('📝 ویرایش کاربر:', { userId, firstName, lastName, role });

    // اعتبارسنجی اولیه
    if (!firstName || !lastName || !nationalCode || !role) {
      return NextResponse.json({
        success: false,
        message: 'لطفاً تمام فیلدهای اجباری را پر کنید'
      }, { status: 400 });
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        entrances: true,
        students: true,
        teachers: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    // بررسی تکراری نبودن کد ملی (در صورت تغییر)
    if (nationalCode !== existingUser.entrances?.national_code) {
      const duplicateEntrance = await prisma.entrances.findFirst({
        where: {
          national_code: nationalCode,
          id: { not: existingUser.entrances?.id }
        }
      });

      if (duplicateEntrance) {
        return NextResponse.json({
          success: false,
          message: 'کاربری با این کد ملی قبلاً ثبت شده است'
        }, { status: 409 });
      }
    }

    // آپدیت در transaction
    const result = await prisma.$transaction(async (tx) => {
      // آپدیت اطلاعات کاربر
      const updatedUser = await tx.users.update({
        where: { id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          email: email || null,
          updated_at: new Date()
        }
      });

      // آپدیت entrance
      const entranceUpdateData = {
        national_code: nationalCode,
        role: role,
        updated_at: new Date()
      };

      // اگر رمز عبور ارسال شده، هش کن و اضافه کن
      if (password && password.trim() !== '') {
        entranceUpdateData.password_hash = await hashPassword(password);
      }

      const updatedEntrance = await tx.entrances.update({
        where: { user_id: userId },
        data: entranceUpdateData
      });

      return { updatedUser, updatedEntrance };
    });

    console.log('✅ کاربر با موفقیت ویرایش شد');

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت ویرایش شد',
      user: {
        id: result.updatedUser.id,
        firstName: result.updatedUser.first_name,
        lastName: result.updatedUser.last_name,
        nationalCode: result.updatedEntrance.national_code,
        role: result.updatedEntrance.role,
        phone: result.updatedUser.phone,
        email: result.updatedUser.email,
        updatedAt: result.updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('❌ Edit user API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص')
    }, { status: 500 });
  }
}

// GET - دریافت اطلاعات یک کاربر
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
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

    const userId = parseInt(id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        entrances: true,
        students: true,
        teachers: true
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        nationalCode: user.entrances?.national_code,
        role: user.entrances?.role,
        phone: user.phone,
        email: user.email,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        studentInfo: user.students ? {
          studentNumber: user.students.student_number,
          classId: user.students.class_id,
          status: user.students.status
        } : null,
        teacherInfo: user.teachers ? {
          teacherCode: user.teachers.teacher_code,
          subject: user.teachers.subject,
          status: user.teachers.status
        } : null
      }
    });

  } catch (error) {
    console.error('❌ Get user API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص')
    }, { status: 500 });
  }
}