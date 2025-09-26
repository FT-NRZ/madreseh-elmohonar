import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization');
  return auth?.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null;
}

// GET
export async function GET(request, context) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    const { id } = await context.params;
    const userId = Number(id);

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { entrances: true, students: true, teachers: true }
    });
    if (!user) return NextResponse.json({ success: false, message: 'کاربر یافت نشد' }, { status: 404 });

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
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}

// PUT
export async function PUT(request, context) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    const { id } = await context.params;
    const userId = Number(id);

    const body = await request.json();
    const { firstName, lastName, nationalCode, phone, email, role, grade, classId, password } = body;
    if (!firstName || !lastName || !nationalCode || !role) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const existing = await prisma.users.findUnique({ where: { id: userId }, include: { entrances: true, students: true } });
    if (!existing || !existing.entrances) {
      return NextResponse.json({ success: false, message: 'کاربر یا اطلاعات ورود یافت نشد' }, { status: 404 });
    }

    await prisma.users.update({
      where: { id: userId },
      data: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        email: email || null
      }
    });

    const entUpdate = { national_code: String(nationalCode), role };
    if (password) entUpdate.password_hash = await hashPassword(password);
    await prisma.entrances.update({ where: { id: existing.entrances.id }, data: entUpdate });

    // به‌روزرسانی کلاس دانش‌آموز در صورت ارسال
    if (role === 'student') {
      let newClassId = classId ? Number(classId) : null;
      if (!newClassId && grade) {
        const cls = await prisma.classes.findFirst({ where: { class_name: grade } });
        if (cls) newClassId = cls.id;
      }
      if (newClassId) {
        await prisma.students.update({
          where: { user_id: userId },
          data: { class_id: newClassId }
        }).catch(() => {});
      }
    }

    return NextResponse.json({ success: true, message: 'کاربر با موفقیت ویرایش شد' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'خطا در ویرایش کاربر' }, { status: 500 });
  }
}

// DELETE
export async function DELETE(request, context) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    const { id } = await context.params;
    const userId = Number(id);

    await prisma.users.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: 'کاربر با موفقیت حذف شد' });
  } catch (error) {
    if (error.code === 'P2003') {
      return NextResponse.json({ success: false, message: 'ابتدا اطلاعات وابسته را حذف کنید' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: 'خطا در حذف کاربر' }, { status: 500 });
  }
}

