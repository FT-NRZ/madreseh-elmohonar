import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

// تابع دریافت توکن از هدر
function getToken(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || '';
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
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ 
        success: false,
        message: 'دسترسی غیرمجاز',
        users: [] 
      }, { status: 403 });
    }

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
                    grade_name: true
                  }
                }
              }
            }
          }
        },
        teachers: {
          include: {
            workshop: {  // تغییر از workshops به workshop
              select: {
                workshop_name: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // فرمت کردن داده‌ها برای نمایش
    const formattedUsers = users.map(user => {
      const entrance = user.entrances;
      const student = user.students;
      const teacher = user.teachers;

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
        gradeName: student?.classes?.grades?.grade_name || null,
        studentStatus: student?.status || null,
        enrollmentDate: student?.enrollment_date || null,
        
        // اطلاعات معلم
        teacherCode: teacher?.teacher_code || null,
        subject: teacher?.subject || null,
        teachingType: teacher?.teaching_type || null,
        teacherStatus: teacher?.status || null,
        hireDate: teacher?.hire_date || null,
        workshopName: teacher?.workshop?.workshop_name || null  // تغییر از workshops به workshop
      };
    });

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      total: formattedUsers.length,
      message: 'لیست کاربران با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت کاربران',
      users: []
    }, { status: 500 });
  }
}

// ایجاد کاربر جدید (POST)
export async function POST(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName, lastName, nationalCode, phone, email, role, password,
      classId, grade,
      teachingType, gradeId, workshopId, subject
    } = body;

    console.log('Creating user with data:', {
      firstName, lastName, nationalCode, role, teachingType, gradeId, workshopId
    });

    // اعتبارسنجی فیلدهای اصلی
    if (!firstName || !lastName || !nationalCode || !role || !password) {
      return NextResponse.json({
        success: false,
        message: 'لطفاً تمام فیلدهای اجباری را پر کنید'
      }, { status: 400 });
    }

    // اعتبارسنجی کد ملی
    if (String(nationalCode).length !== 10) {
      return NextResponse.json({
        success: false,
        message: 'کد ملی باید 10 رقم باشد'
      }, { status: 400 });
    }

    // اعتبارسنجی ویژه دانش‌آموز
    if (role === 'student') {
      let realClassId = classId ? Number(classId) : null;
      
      if (!realClassId && grade) {
        const cls = await prisma.classes.findFirst({ 
          where: { class_name: grade } 
        });
        if (cls) {
          realClassId = cls.id;
        }
      }
      
      if (!realClassId) {
        return NextResponse.json({
          success: false,
          message: 'کلاس معتبر برای دانش‌آموز انتخاب نشده است'
        }, { status: 400 });
      }
    }

    // اعتبارسنجی ویژه معلم
    if (role === 'teacher') {
      if (!teachingType) {
        return NextResponse.json({
          success: false,
          message: 'نوع تدریس معلم الزامی است'
        }, { status: 400 });
      }
      
      if (teachingType === 'grade' && !gradeId) {
        return NextResponse.json({
          success: false,
          message: 'انتخاب پایه برای معلم پایه‌ای الزامی است'
        }, { status: 400 });
      }
      
      if (teachingType === 'workshop' && !workshopId) {
        return NextResponse.json({
          success: false,
          message: 'انتخاب کارگاه برای معلم کارگاه الزامی است'
        }, { status: 400 });
      }
    }

    // بررسی تکراری بودن کد ملی
    const duplicateEntrance = await prisma.entrances.findUnique({
      where: { national_code: String(nationalCode) }
    });
    
    if (duplicateEntrance) {
      return NextResponse.json({
        success: false,
        message: 'کاربری با این کد ملی قبلاً ثبت شده است'
      }, { status: 409 });
    }

    // بررسی تکراری بودن شماره تلفن
    if (phone) {
      const duplicatePhone = await prisma.users.findUnique({
        where: { phone: String(phone) }
      });
      if (duplicatePhone) {
        return NextResponse.json({
          success: false,
          message: 'شماره تلفن تکراری است'
        }, { status: 409 });
      }
    }

    // هش کردن رمز عبور
    const hashedPassword = await hashPassword(password);

    // تعیین کلاس نهایی برای دانش‌آموز
    let finalClassId = null;
    if (role === 'student') {
      finalClassId = classId ? Number(classId) : null;
      if (!finalClassId && grade) {
        const cls = await prisma.classes.findFirst({
          where: { class_name: grade }
        });
        if (cls) {
          finalClassId = cls.id;
        }
      }
    }

    // شروع تراکنش دیتابیس
    const result = await prisma.$transaction(async (tx) => {
      // ایجاد کاربر
      const user = await tx.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          email: email || null,
          is_active: true
        }
      });

      // ایجاد اطلاعات ورود
      const entrance = await tx.entrances.create({
        data: {
          user_id: user.id,
          national_code: String(nationalCode),
          password_hash: hashedPassword,
          role: role,
          is_active: true
        }
      });

      let specificInfo = {};

      // ایجاد اطلاعات ویژه دانش‌آموز
      if (role === 'student') {
        const studentNumber = generateStudentNumber();
        const student = await tx.students.create({
          data: {
            user_id: user.id,
            student_number: studentNumber,
            class_id: finalClassId,
            status: 'active',
            enrollment_date: new Date()
          }
        });
        
        specificInfo = {
          studentNumber: student.student_number,
          classId: finalClassId
        };
        
        console.log(`Student created with class_id: ${finalClassId}`);
      }

      // ایجاد اطلاعات ویژه معلم
      else if (role === 'teacher') {
        const teacherCode = generateTeacherCode();
        const teacher = await tx.teachers.create({
          data: {
            user_id: user.id,
            teacher_code: teacherCode,
            hire_date: new Date(),
            subject: subject || null,
            teaching_type: teachingType || 'grade',
            workshop_id: teachingType === 'workshop' ? Number(workshopId) : null,
            status: 'active'
          }
        });

        console.log(`Teacher created with ID: ${teacher.id}, teaching_type: ${teachingType}`);

        // اتصال خودکار کلاس به معلم پایه‌ای
        if (teachingType === 'grade' && gradeId) {
          const updatedClasses = await tx.classes.updateMany({
            where: {
              grade_id: Number(gradeId),
              teacher_id: null  // فقط کلاس‌هایی که معلم ندارند
            },
            data: {
              teacher_id: teacher.id
            }
          });

          console.log(`Connected ${updatedClasses.count} classes to teacher for grade ${gradeId}`);
          
          specificInfo.connectedClasses = updatedClasses.count;
        }

        specificInfo = {
          ...specificInfo,
          teacherCode: teacher.teacher_code,
          teachingType: teacher.teaching_type,
          gradeId: teachingType === 'grade' ? gradeId : null,
          workshopId: teachingType === 'workshop' ? workshopId : null
        };
      }

      return { user, entrance, specificInfo };
    });

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
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ایجاد کاربر: ' + error.message
    }, { status: 500 });
  }
}