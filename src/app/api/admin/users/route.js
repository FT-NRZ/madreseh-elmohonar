import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword, generateStudentNumber, generateTeacherCode } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

// GET - دریافت لیست کاربران
export async function GET(request) {
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

    const entrances = await prisma.entrances.findMany({
      include: {
        users: true
      }
    });

    const users = entrances.map(e => ({
      id: e.users?.id,
      firstName: e.users?.first_name || '',
      lastName: e.users?.last_name || '',
      nationalCode: e.national_code,
      phone: e.users?.phone || '',
      email: e.users?.email || '',
      role: e.role,
      isActive: e.is_active
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص')
    }, { status: 500 });
  }
}

// POST - ایجاد کاربر جدید
export async function POST(request) {
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

    const body = await request.json();
    const { firstName, lastName, nationalCode, phone, email, role, password, classId, grade } = body;

    // اعتبارسنجی
    if (!firstName || !lastName || !nationalCode || !role || !password) {
      return NextResponse.json({ success: false, message: 'لطفاً تمام فیلدهای اجباری را پر کنید' }, { status: 400 });
    }
    if (nationalCode.length !== 10) {
      return NextResponse.json({ success: false, message: 'کد ملی باید 10 رقم باشد' }, { status: 400 });
    }
    const existingEntrance = await prisma.entrances.findUnique({
      where: { national_code: nationalCode }
    });
    if (existingEntrance) {
      return NextResponse.json({ success: false, message: 'کاربری با این کد ملی قبلاً ثبت شده است' }, { status: 409 });
    }
    // بررسی تکراری بودن ایمیل فقط اگر ایمیل وارد شده باشد
    if (email) {
      const existingUser = await prisma.users.findUnique({
        where: { email }
      });
      if (existingUser) {
        return NextResponse.json({
          success: false,
          message: 'ایمیل وارد شده قبلاً ثبت شده است'
        }, { status: 409 });
      }
    }
    const hashedPassword = await hashPassword(password);

    // تعیین کلاس بر اساس پایه اگر دانش‌آموز است و کلاس انتخاب نشده
    let realClassId = classId;
    if (role === 'student' && !realClassId && grade) {
      const classObj = await prisma.classes.findFirst({
        where: {
          grades: { grade_name: grade }
        }
      });
      if (!classObj) {
        return NextResponse.json({
          success: false,
          message: 'کلاس مناسب برای پایه انتخابی وجود ندارد. لطفاً ابتدا کلاس را ایجاد کنید.'
        }, { status: 400 });
      }
      realClassId = classObj.id;
    }

    // اگر دانش‌آموز است و کلاس پیدا نشد، خطا بده
    if (role === 'student' && !realClassId) {
      return NextResponse.json({
        success: false,
        message: 'کلاس معتبر برای دانش‌آموز انتخاب نشده است.'
      }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          email: email || null,
          is_active: true
        }
      });

      const entrance = await tx.entrances.create({
        data: {
          user_id: user.id,
          national_code: nationalCode,
          password_hash: hashedPassword,
          role,
          is_active: true
        }
      });

      let specificInfo = {};
      if (role === 'student') {
        const studentNumber = generateStudentNumber();
        const student = await tx.students.create({
          data: {
            user_id: user.id,
            student_number: studentNumber,
            enrollment_date: new Date(),
            class_id: Number(realClassId)
          }
        });
        specificInfo = { studentNumber: student.student_number };
      } else if (role === 'teacher') {
        const teacherCode = generateTeacherCode();
        const teacher = await tx.teachers.create({
          data: {
            user_id: user.id,
            teacher_code: teacherCode,
            hire_date: new Date(),
            subject: null
          }
        });
        specificInfo = { teacherCode: teacher.teacher_code };
      }

      return { user, entrance, specificInfo };
    });

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت ایجاد شد',
      user: {
        id: result.user.id,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        nationalCode: result.entrance.national_code,
        role: result.entrance.role,
        ...result.specificInfo
      }
    });

  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص')
    }, { status: 500 });
  }
}