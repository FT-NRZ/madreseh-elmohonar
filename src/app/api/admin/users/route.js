import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword, isValidNationalCode } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

// GET - دریافت لیست کاربران
export async function GET(request) {
  try {
    console.log('🔍 GET Users API called');
    
    // بررسی احراز هویت
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return NextResponse.json({
        success: false,
        message: 'احراز هویت مورد نیاز است'
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      console.log('❌ Unauthorized access');
      return NextResponse.json({
        success: false,
        message: 'دسترسی مجاز نیست'
      }, { status: 403 });
    }

    console.log('✅ Authentication passed');

    // دریافت کاربران با try-catch جداگانه
    let users = [];
    try {
      users = await prisma.entrances.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              phone: true,
              email: true,
              is_active: true
            }
          }
        },
        where: {
          is_active: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      console.log(`📊 Found ${users.length} users`);
    } catch (dbError) {
      console.error('❌ Database error:', dbError);
      return NextResponse.json({
        success: false,
        message: 'خطا در اتصال به دیتابیس',
        users: []
      }, { status: 500 });
    }

    // تبدیل به فرمت مناسب
    const formattedUsers = users.map(entrance => {
      try {
        return {
          id: entrance.id,
          firstName: entrance.users?.first_name || 'نام نامشخص',
          lastName: entrance.users?.last_name || 'نام خانوادگی نامشخص',
          nationalCode: entrance.national_code,
          role: entrance.role,
          phone: entrance.users?.phone || '',
          email: entrance.users?.email || '',
          isActive: entrance.is_active,
          createdAt: entrance.created_at
        };
      } catch (formatError) {
        console.error('❌ Format error for user:', entrance.id, formatError);
        return {
          id: entrance.id,
          firstName: 'خطا در نمایش',
          lastName: '',
          nationalCode: entrance.national_code || '',
          role: entrance.role || 'unknown',
          phone: '',
          email: '',
          isActive: false,
          createdAt: entrance.created_at
        };
      }
    });

    console.log('✅ Users formatted successfully');

    return NextResponse.json({
      success: true,
      users: formattedUsers
    });

  } catch (error) {
    console.error('❌ Get users API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص'),
      users: []
    }, { status: 500 });
  }
}

// POST - ایجاد کاربر جدید
export async function POST(request) {
  try {
    console.log('🔍 POST Users API called');
    
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

    // دریافت داده‌ها
    const body = await request.json();
    const { firstName, lastName, nationalCode, phone, email, role, password } = body;

    console.log('📝 Creating user:', { firstName, lastName, nationalCode, role });

    // اعتبارسنجی
    if (!firstName || !lastName || !nationalCode || !role || !password) {
      return NextResponse.json({
        success: false,
        message: 'لطفاً تمام فیلدهای اجباری را پر کنید'
      }, { status: 400 });
    }

    // بررسی طول کد ملی
    if (nationalCode.length !== 10) {
      return NextResponse.json({
        success: false,
        message: 'کد ملی باید 10 رقم باشد'
      }, { status: 400 });
    }

    // بررسی تکراری نبودن کد ملی
    const existingEntrance = await prisma.entrances.findUnique({
      where: { national_code: nationalCode }
    });

    if (existingEntrance) {
      return NextResponse.json({
        success: false,
        message: 'کاربری با این کد ملی قبلاً ثبت شده است'
      }, { status: 409 });
    }

    // هش کردن رمز عبور
    const hashedPassword = await hashPassword(password);

    // ایجاد کاربر در یک transaction
    const result = await prisma.$transaction(async (tx) => {
      // ایجاد کاربر اصلی
      const user = await tx.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          email: email || null,
          is_active: true
        }
      });

      console.log('✅ User created with ID:', user.id);

      // ایجاد entrance
      const entrance = await tx.entrances.create({
        data: {
          user_id: user.id,
          national_code: nationalCode,
          password_hash: hashedPassword,
          role,
          is_active: true
        }
      });

      console.log('✅ Entrance created with ID:', entrance.id);

      // ایجاد رکورد تخصصی بر اساس نقش
      let specificInfo = {};
      
      try {
        if (role === 'student') {
          const studentNumber = generateStudentNumber();
          const student = await tx.students.create({
            data: {
              user_id: user.id,
              student_number: studentNumber,
              enrollment_date: new Date()
            }
          });
          specificInfo = { studentNumber: student.student_number };
          console.log('✅ Student record created');
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
          console.log('✅ Teacher record created');
        }
      } catch (roleError) {
        console.log('⚠️ Role-specific record creation failed, but user still created:', roleError.message);
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
    console.error('❌ Create user API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + (error.message || 'خطای نامشخص')
    }, { status: 500 });
  }
}

// تابع تولید شماره دانش‌آموز
function generateStudentNumber() {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${random}`;
}

// تابع تولید کد معلم
function generateTeacherCode() {
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `T${random}`;
}