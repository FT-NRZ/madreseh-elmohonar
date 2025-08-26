import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyPassword } from '@/lib/password';
import { signJWT } from '@/lib/jwt';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password, userType } = body;

    if (!username || !password || !userType) {
      return NextResponse.json({
        success: false,
        message: 'لطفاً تمام فیلدها را پر کنید'
      }, { status: 400 });
    }

    // یافتن کاربر
    const entrance = await prisma.entrances.findFirst({
      where: {
        national_code: username,
        role: userType,
        is_active: true
      },
      include: {
        users: {
          include: {
            students: true,
            teachers: true
          }
        }
      }
    });

    if (!entrance) {
      return NextResponse.json({
        success: false,
        message: 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // بررسی قفل بودن حساب
    if (entrance.locked_until && entrance.locked_until > new Date()) {
      const lockTime = Math.ceil((entrance.locked_until.getTime() - Date.now()) / (1000 * 60));
      return NextResponse.json({
        success: false,
        message: `حساب کاربری شما به مدت ${lockTime} دقیقه قفل شده است`
      }, { status: 423 });
    }

    // بررسی رمز عبور
    const isPasswordValid = await verifyPassword(password, entrance.password_hash);

    if (!isPasswordValid) {
      const newFailedAttempts = entrance.failed_attempts + 1;
      let lockedUntil = null;

      if (newFailedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      }

      await prisma.entrances.update({
        where: { id: entrance.id },
        data: {
          failed_attempts: newFailedAttempts,
          locked_until: lockedUntil
        }
      });

      return NextResponse.json({
        success: false,
        message: newFailedAttempts >= 5 
          ? 'حساب کاربری شما قفل شد'
          : 'نام کاربری یا رمز عبور اشتباه است'
      }, { status: 401 });
    }

    // اطلاعات تکمیلی
    let additionalInfo = {};
    
    if (entrance.role === 'student' && entrance.users.students) {
      additionalInfo = {
        studentNumber: entrance.users.students.student_number
      };
    } else if (entrance.role === 'teacher' && entrance.users.teachers) {
      additionalInfo = {
        teacherCode: entrance.users.teachers.teacher_code,
        subject: entrance.users.teachers.subject
      };
    }

    // به‌روزرسانی اطلاعات ورود
    await prisma.entrances.update({
      where: { id: entrance.id },
      data: {
        last_login_at: new Date(),
        failed_attempts: 0,
        locked_until: null
      }
    });

    // ایجاد JWT Token
    const token = signJWT({
      userId: entrance.user_id,
      role: entrance.role,
      nationalCode: entrance.national_code,
      iat: Math.floor(Date.now() / 1000)
    });

    return NextResponse.json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
      user: {
        id: entrance.users.id,
        firstName: entrance.users.first_name,
        lastName: entrance.users.last_name,
        role: entrance.role,
        profileImage: entrance.users.profile_image,
        nationalCode: entrance.national_code,
        ...additionalInfo
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور'
    }, { status: 500 });
  }
}