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
// PUT - ویرایش کاربر
export async function PUT(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, message: 'احراز هویت مورد نیاز است' }, { status: 401 });
    }
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    // بررسی صحت ID
    if (isNaN(userId)) {
      return NextResponse.json({ success: false, message: 'شناسه کاربر نامعتبر است' }, { status: 400 });
    }

    const body = await request.json();
    const { firstName, lastName, nationalCode, phone, email, role, grade, password } = body;

    if (!firstName || !lastName || !nationalCode || !role) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است' }, { status: 400 });
    }

    // بررسی وجود کاربر قبل از ویرایش
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        entrances: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: `کاربر با شناسه ${userId} یافت نشد` 
      }, { status: 404 });
    }

    if (!existingUser.entrances) {
      return NextResponse.json({ 
        success: false, 
        message: 'اطلاعات ورود کاربر یافت نشد' 
      }, { status: 404 });
    }

    // بروزرسانی اطلاعات کاربر
    await prisma.users.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        email: email || null,
      }
    });

    // آماده کردن داده‌های بروزرسانی برای entrance
    const updateData = {
      national_code: nationalCode,
      role,
    };

    // اگر رمز عبور جدید وارد شده باشد
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    await prisma.entrances.update({
      where: { id: existingUser.entrances.id },
      data: updateData
    });

    // اگر دانش‌آموز است، پایه را هم بروزرسانی کن (در صورت وجود جدول مربوطه)
    // if (role === 'student' && grade) {
    //   await prisma.students.update({ where: { user_id: userId }, data: { grade } });
    // }

    return NextResponse.json({ success: true, message: 'کاربر با موفقیت ویرایش شد' });
  } catch (error) {
    console.error('Edit user error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ویرایش کاربر: ' + error.message 
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