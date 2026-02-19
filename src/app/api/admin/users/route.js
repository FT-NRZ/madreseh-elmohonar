import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import jwt from 'jsonwebtoken';

// تابع دریافت توکن از هدر
function getToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return token.length > 0 ? token : null;
}

// اعتبارسنجی کد ملی
function validateNationalCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== 10) return false;
  if (!/^\d{10}$/.test(code)) return false;
  return true;
}

// تولید شماره دانش‌آموزی
function generateStudentNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${timestamp.slice(-8)}${random}`;
}

// تولید کد معلم
function generateTeacherCode() {
  return `T${Date.now().toString().slice(-6)}`;
}

// دریافت لیست کاربران (GET)
export async function GET(request) {
  try {
    // بررسی دسترسی ادمین (ساده شده)
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false,
        message: 'احراز هویت مورد نیاز است',
        users: [] 
      }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      return NextResponse.json({ 
        success: false,
        message: 'توکن نامعتبر است',
        users: [] 
      }, { status: 401 });
    }

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'دسترسی مجاز نیست',
        users: [] 
      }, { status: 403 });
    }

    console.log('🔍 دریافت لیست کاربران...');
// در بخش GET، query مربوط به users را اصلاح کن:

const users = await prisma.users.findMany({
  include: {
    entrances: {
      select: {
        national_code: true,
        role: true,
        is_active: true,
        last_login_at: true
      }
    },
    students: {
      include: {
        classes: {
          include: {
            grades: {
              select: {
                id: true,
                grade_name: true,
                grade_level: true
              }
            }
          }
        }
      }
    },
    teachers: {
      include: {
        workshop: {
          select: {
            id: true,
            workshop_name: true,
            icon: true
          }
        },
        // اضافه کردن relation برای پایه‌های معلم (از طریق کلاس‌ها)
        classes: {
          include: {
            grades: {
              select: {
                id: true,
                grade_name: true,
                grade_level: true
              }
            }
          },
          distinct: ['grade_id']
        }
      }
    }
  },
  orderBy: { created_at: 'desc' }
});

// و در بخش formattedUsers:
const formattedUsers = users.map(user => {
  const entrance = user.entrances;
  const student = user.students;
  const teacher = user.teachers;

  // اطلاعات اضافی برای دانش‌آموز
  let studentGradeInfo = null;
  if (student && student.classes && student.classes.grades) {
    studentGradeInfo = {
      gradeId: student.classes.grades.id,
      gradeName: student.classes.grades.grade_name,
      gradeLevel: student.classes.grades.grade_level
    };
  }

  // اطلاعات اضافی برای معلم
  let teacherDetails = null;
  if (teacher) {
    teacherDetails = {
      teachingType: teacher.teaching_type,
      subject: teacher.subject,
      workshopName: teacher.workshop?.workshop_name || null,
      workshopIcon: teacher.workshop?.icon || null,
      // پایه‌هایی که معلم تدریس می‌کند
      teachingGrades: teacher.classes?.map(cls => ({
        gradeId: cls.grades?.id,
        gradeName: cls.grades?.grade_name
      })).filter(grade => grade.gradeId) || []
    };
  }

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`,
    phone: user.phone,
    email: user.email,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    
    // اطلاعات ورود
    nationalCode: entrance?.national_code || 'نامشخص',
    role: entrance?.role || 'نامشخص',
    roleActive: entrance?.is_active || false,
    lastLogin: entrance?.last_login_at,
    
    // اطلاعات دانش‌آموز
    studentNumber: student?.student_number || null,
    className: student?.classes?.class_name || null,
    studentGrade: studentGradeInfo, // اضافه شده
    studentStatus: student?.status || null,
    enrollmentDate: student?.enrollment_date || null,
    
    // اطلاعات معلم
    teacherCode: teacher?.teacher_code || null,
    teacherDetails: teacherDetails, // اضافه شده
    teacherStatus: teacher?.status || null,
    hireDate: teacher?.hire_date || null
  };
});

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      message: 'لیست کاربران با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('💥 خطا در GET /api/admin/users:', error);
    return NextResponse.json({
      success: false,
      message: `خطا در دریافت کاربران: ${error.message}`,
      users: []
    }, { status: 500 });
  }
}

// ایجاد کاربر جدید (POST)
export async function POST(request) {
  try {
    console.log('🔍 شروع POST /api/admin/users...');

    // بررسی دسترسی ادمین
    const token = getToken(request);
    if (!token) {
      console.log('❌ توکن یافت نشد');
      return NextResponse.json({
        success: false,
        message: 'احراز هویت مورد نیاز است'
      }, { status: 401 });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ توکن معتبر است:', payload.role);
    } catch (jwtError) {
      console.log('❌ توکن نامعتبر:', jwtError.message);
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    if (!payload || payload.role !== 'admin') {
      console.log('❌ دسترسی مجاز نیست');
      return NextResponse.json({
        success: false,
        message: 'دسترسی مجاز نیست'
      }, { status: 403 });
    }

    // پارس کردن داده‌های ورودی
    let requestData;
    try {
      requestData = await request.json();
      console.log('📊 داده‌های دریافتی:', {
        ...requestData,
        password: '[محفوظ]'
      });
    } catch (parseError) {
      console.log('❌ خطا در پارس JSON:', parseError.message);
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    const {
      firstName, lastName, nationalCode, phone, email, role, password,
      classId, teachingType, gradeId, workshopId, subject
    } = requestData;

    // اعتبارسنجی فیلدهای اصلی
    if (!firstName || !lastName || !nationalCode || !role || !password) {
      console.log('❌ اطلاعات ناقص');
      return NextResponse.json({
        success: false,
        message: 'اطلاعات ناقص است'
      }, { status: 400 });
    }

    if (!validateNationalCode(nationalCode)) {
      console.log('❌ کد ملی نامعتبر');
      return NextResponse.json({
        success: false,
        message: 'کد ملی معتبر نیست'
      }, { status: 400 });
    }

    // اعتبارسنجی ویژه دانش‌آموز
    if (role === 'student' && !classId) {
      console.log('❌ کلاس دانش‌آموز انتخاب نشده');
      return NextResponse.json({
        success: false,
        message: 'انتخاب کلاس برای دانش‌آموز الزامی است'
      }, { status: 400 });
    }

    // اعتبارسنجی ویژه معلم
    if (role === 'teacher') {
      if (!teachingType) {
        console.log('❌ نوع تدریس معلم انتخاب نشده');
        return NextResponse.json({
          success: false,
          message: 'نوع تدریس معلم الزامی است'
        }, { status: 400 });
      }
      
      if (teachingType === 'grade' && !gradeId) {
        console.log('❌ پایه معلم انتخاب نشده');
        return NextResponse.json({
          success: false,
          message: 'انتخاب پایه برای معلم پایه‌ای الزامی است'
        }, { status: 400 });
      }
      
      if (teachingType === 'workshop' && !workshopId) {
        console.log('❌ کارگاه معلم انتخاب نشده');
        return NextResponse.json({
          success: false,
          message: 'انتخاب کارگاه برای معلم کارگاه الزامی است'
        }, { status: 400 });
      }
    }

    // بررسی تکراری بودن کد ملی
    const duplicateEntrance = await prisma.entrances.findUnique({
      where: { national_code: nationalCode },
      select: { id: true }
    });
    
    if (duplicateEntrance) {
      console.log('❌ کد ملی تکراری');
      return NextResponse.json({
        success: false,
        message: 'کاربری با این کد ملی قبلاً ثبت شده است'
      }, { status: 409 });
    }

    // هش کردن رمز عبور
    console.log('🔐 شروع هش کردن رمز عبور...');
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log('✅ رمز عبور هش شد');
    } catch (hashError) {
      console.error('❌ خطا در هش کردن رمز عبور:', hashError.message);
      return NextResponse.json({
        success: false,
        message: 'خطا در پردازش رمز عبور'
      }, { status: 500 });
    }

    // شروع تراکنش دیتابیس
    console.log('💾 شروع تراکنش دیتابیس...');
    const result = await prisma.$transaction(async (tx) => {
      // ایجاد کاربر
      console.log('👤 ایجاد کاربر...');
      const user = await tx.users.create({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          is_active: true
        }
      });
      console.log('✅ کاربر ایجاد شد:', user.id);

      // ایجاد اطلاعات ورود
      console.log('🔑 ایجاد اطلاعات ورود...');
      const entrance = await tx.entrances.create({
        data: {
          user_id: user.id,
          national_code: nationalCode,
          password_hash: hashedPassword,
          role: role,
          is_active: true
        }
      });
      console.log('✅ اطلاعات ورود ایجاد شد');

      let specificInfo = {};

      // ایجاد اطلاعات ویژه دانش‌آموز
      if (role === 'student') {
        console.log('🎓 ایجاد اطلاعات دانش‌آموز...');
        const studentNumber = generateStudentNumber();
        const student = await tx.students.create({
          data: {
            user_id: user.id,
            student_number: studentNumber,
            class_id: Number(classId),
            status: 'active',
            enrollment_date: new Date()
          }
        });
        console.log('✅ دانش‌آموز ایجاد شد');
        
        specificInfo = {
          studentNumber: student.student_number,
          classId: Number(classId)
        };
      }

      // ایجاد اطلاعات ویژه معلم
      else if (role === 'teacher') {
        console.log('👨‍🏫 ایجاد اطلاعات معلم...');
        const teacherCode = generateTeacherCode();
        const teacher = await tx.teachers.create({
          data: {
            user_id: user.id,
            teacher_code: teacherCode,
            hire_date: new Date(),
            subject: subject?.trim() || null,
            teaching_type: teachingType || 'grade',
            workshop_id: teachingType === 'workshop' ? Number(workshopId) : null,
            status: 'active'
          }
        });
        console.log('✅ معلم ایجاد شد');

        // اتصال خودکار کلاس به معلم پایه‌ای
        if (teachingType === 'grade' && gradeId) {
          console.log('🔗 اتصال کلاس‌ها به معلم...');
          const updatedClasses = await tx.classes.updateMany({
            where: {
              grade_id: Number(gradeId),
              teacher_id: null
            },
            data: {
              teacher_id: teacher.id
            }
          });
          console.log(`✅ ${updatedClasses.count} کلاس متصل شد`);
          
          specificInfo.connectedClasses = updatedClasses.count;
        }

        specificInfo = {
          ...specificInfo,
          teacherCode: teacher.teacher_code,
          teachingType: teacher.teaching_type,
          gradeId: teachingType === 'grade' ? Number(gradeId) : null,
          workshopId: teachingType === 'workshop' ? Number(workshopId) : null
        };
      }

      return { user, entrance, specificInfo };
    });

    console.log('✅ تراکنش کامل شد');

    // تعیین متن پیام موفقیت
    const roleText = role === 'teacher' ? 'معلم' : role === 'student' ? 'دانش‌آموز' : 'کاربر';
    let successMessage = `${roleText} با موفقیت ایجاد شد`;
    
    if (role === 'teacher' && teachingType === 'grade' && result.specificInfo.connectedClasses > 0) {
      successMessage += ` و به ${result.specificInfo.connectedClasses} کلاس متصل شد`;
    }

    return NextResponse.json({
      success: true,
      message: successMessage,
      user: {
        id: result.user.id,
        firstName: result.user.first_name,
        lastName: result.user.last_name,
        nationalCode: result.entrance.national_code,
        role: result.entrance.role,
        phone: result.user.phone,
        email: result.user.email,
        ...result.specificInfo
      }
    });

  } catch (error) {
    console.error('💥 خطا در POST /api/admin/users:', error);
    
    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'اطلاعات تکراری وجود دارد'
      }, { status: 409 });
    }

    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        message: 'ارجاع به رکورد نامعتبر'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: `خطا در ایجاد کاربر: ${error.message}`
    }, { status: 500 });
  }
}