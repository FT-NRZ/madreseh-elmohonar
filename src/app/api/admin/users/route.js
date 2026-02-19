import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt'; // ✅ این خط را اضافه کن

// پاک‌سازی توکن
function cleanToken(raw) {
  if (!raw) return null;
  let t = String(raw).trim();
  t = t.replace(/^bearer\s+/i, '').trim();
  t = t.replace(/^bearer\s+/i, '').trim();
  t = t.replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '');
  if (!t || t === 'undefined' || t === 'null' || t.length < 10) return null;
  return t;
}

// تابع دریافت توکن از هدر یا کوکی
function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const t = auth.slice(7).trim();
    const cleaned = cleanToken(t);
    if (cleaned) return cleaned;
  }
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (m?.[1]) return cleanToken(decodeURIComponent(m[1]));
  return null;
}

function authorizeAdmin(request) {
  const token = getToken(request);
  const payload = verifyJWT(token); // ✅ حالا کار می‌کند
  if (!payload) {
    return { error: NextResponse.json({ success: false, message: 'توکن نامعتبر است' }, { status: 401 }) };
  }
  if (payload.role !== 'admin') {
    return { error: NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 }) };
  }
  return { payload };
}

// اعتبارسنجی کد ملی
function validateNationalCode(code) {
  if (!code || typeof code !== 'string') return false;
  if (code.length !== 10) return false;
  if (!/^\d{10}$/.test(code)) return false;
  return true;
}

function generateStudentNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${timestamp.slice(-8)}${random}`;
}

function generateTeacherCode() {
  return `T${Date.now().toString().slice(-6)}`;
}

// دریافت لیست کاربران (GET)
export async function GET(request) {
  const auth = authorizeAdmin(request);
  if (auth.error) return auth.error;

  try {
    console.log('🔍 دریافت لیست کاربران...');

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
                  select: { id: true, grade_name: true, grade_level: true }
                }
              }
            }
          }
        },
        teachers: {
          include: {
            workshop: {
              select: { id: true, workshop_name: true, icon: true }
            },
            classes: {
              include: {
                grades: {
                  select: { id: true, grade_name: true, grade_level: true }
                }
              },
              distinct: ['grade_id']
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedUsers = users.map(user => {
      const entrance = user.entrances;
      const student = user.students;
      const teacher = user.teachers;

      let studentGradeInfo = null;
      if (student && student.classes && student.classes.grades) {
        studentGradeInfo = {
          gradeId: student.classes.grades.id,
          gradeName: student.classes.grades.grade_name,
          gradeLevel: student.classes.grades.grade_level
        };
      }

      let teacherDetails = null;
      if (teacher) {
        teacherDetails = {
          teachingType: teacher.teaching_type,
          subject: teacher.subject,
          workshopName: teacher.workshop?.workshop_name || null,
          workshopIcon: teacher.workshop?.icon || null,
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
        nationalCode: entrance?.national_code || 'نامشخص',
        role: entrance?.role || 'نامشخص',
        roleActive: entrance?.is_active || false,
        lastLogin: entrance?.last_login_at,
        studentNumber: student?.student_number || null,
        className: student?.classes?.class_name || null,
        studentGrade: studentGradeInfo,
        studentStatus: student?.status || null,
        enrollmentDate: student?.enrollment_date || null,
        teacherCode: teacher?.teacher_code || null,
        teacherDetails,
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
  const auth = authorizeAdmin(request);
  if (auth.error) return auth.error;

  try {
    console.log('🔍 شروع POST /api/admin/users...');

    let requestData;
    try {
      requestData = await request.json();
      console.log('📊 داده‌های دریافتی:', { ...requestData, password: '[محفوظ]' });
    } catch (parseError) {
      console.log('❌ خطا در پارس JSON:', parseError.message);
      return NextResponse.json({ success: false, message: 'فرمت JSON نامعتبر است' }, { status: 400 });
    }

    const {
      firstName, lastName, nationalCode, phone, email, role, password,
      teachingType, gradeId, workshopId, subject
    } = requestData;

    if (!firstName || !lastName || !nationalCode || !role || !password) {
      console.log('❌ اطلاعات ناقص');
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است' }, { status: 400 });
    }
    if (!validateNationalCode(nationalCode)) {
      console.log('❌ کد ملی نامعتبر');
      return NextResponse.json({ success: false, message: 'کد ملی معتبر نیست' }, { status: 400 });
    }

    // بررسی فیلدهای خاص هر نقش
    if (role === 'student' && !gradeId) {
      console.log('❌ پایه دانش‌آموز انتخاب نشده');
      return NextResponse.json({ success: false, message: 'انتخاب پایه برای دانش‌آموز الزامی است' }, { status: 400 });
    }
    if (role === 'teacher') {
      if (!teachingType) {
        console.log('❌ نوع تدریس معلم انتخاب نشده');
        return NextResponse.json({ success: false, message: 'نوع تدریس معلم الزامی است' }, { status: 400 });
      }
      if (teachingType === 'grade' && !gradeId) {
        console.log('❌ پایه معلم انتخاب نشده');
        return NextResponse.json({ success: false, message: 'انتخاب پایه برای معلم پایه‌ای الزامی است' }, { status: 400 });
      }
      if (teachingType === 'workshop' && !workshopId) {
        console.log('❌ کارگاه معلم انتخاب نشده');
        return NextResponse.json({ success: false, message: 'انتخاب کارگاه برای معلم کارگاه الزامی است' }, { status: 400 });
      }
    }

    const duplicateEntrance = await prisma.entrances.findUnique({
      where: { national_code: nationalCode },
      select: { id: true }
    });
    if (duplicateEntrance) {
      console.log('❌ کد ملی تکراری');
      return NextResponse.json({ success: false, message: 'کاربری با این کد ملی قبلاً ثبت شده است' }, { status: 409 });
    }

    console.log('🔐 شروع هش کردن رمز عبور...');
    let hashedPassword;
    try {
      hashedPassword = await hashPassword(password);
      console.log('✅ رمز عبور هش شد');
    } catch (hashError) {
      console.error('❌ خطا در هش کردن رمز عبور:', hashError.message);
      return NextResponse.json({ success: false, message: 'خطا در پردازش رمز عبور' }, { status: 500 });
    }

    console.log('💾 شروع تراکنش دیتابیس...');
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          is_active: true
        }
      });

      const entrance = await tx.entrances.create({
        data: {
          user_id: user.id,
          national_code: nationalCode,
          password_hash: hashedPassword,
          role: role,
          is_active: true
        }
      });

      let specificInfo = {};
      if (role === 'student') {
        const studentNumber = generateStudentNumber();
        
        // پیدا کردن کلاس بر اساس grade_id یا ایجاد آن
        let targetClass = await tx.classes.findFirst({
          where: { grade_id: Number(gradeId) },
          orderBy: { id: 'asc' }
        });
        
        // اگر کلاس وجود نداشت، ایجاد کن با همان نام پایه
        if (!targetClass) {
          const grade = await tx.grades.findUnique({
            where: { id: Number(gradeId) },
            select: { id: true, grade_name: true }
          });
          
          if (!grade) {
            throw new Error(`پایه با شناسه ${gradeId} یافت نشد`);
          }
          
          // ایجاد کلاس با نام پایه (یکپارچگی grades = classes)
          targetClass = await tx.classes.create({
            data: {
              grade_id: Number(gradeId),
              class_name: grade.grade_name, // 🎯 همان نام پایه
              class_number: '1',
              academic_year: '1403-1404',
              capacity: 30,
              created_at: new Date(),
              updated_at: new Date()
            }
          });
          console.log('✅ کلاس جدید ایجاد شد (همنام پایه):', targetClass.class_name);
        }
        
        // ایجاد دانش‌آموز با class_id
        const student = await tx.students.create({
          data: {
            user_id: user.id,
            student_number: studentNumber,
            class_id: targetClass.id,
            status: 'active',
            enrollment_date: new Date()
          }
        });
        
        specificInfo = { 
          studentNumber: student.student_number, 
          classId: targetClass.id,
          className: targetClass.class_name,
          gradeId: Number(gradeId)
        };
        console.log('✅ دانش‌آموز ایجاد شد در کلاس:', targetClass.class_name);
        
      } else if (role === 'teacher') {
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

        // برای معلم پایه: اتصال به کلاس‌های همان پایه
        if (teachingType === 'grade' && gradeId) {
          // پیدا کردن یا ایجاد کلاس برای این پایه
          let gradeClass = await tx.classes.findFirst({
            where: { grade_id: Number(gradeId) }
          });
          
          if (!gradeClass) {
            const grade = await tx.grades.findUnique({
              where: { id: Number(gradeId) },
              select: { id: true, grade_name: true }
            });
            
            if (grade) {
              gradeClass = await tx.classes.create({
                data: {
                  grade_id: Number(gradeId),
                  class_name: grade.grade_name,
                  class_number: '1',
                  academic_year: '1403-1404',
                  capacity: 30,
                  teacher_id: teacher.id, // مستقیم معلم را متصل کن
                  created_at: new Date(),
                  updated_at: new Date()
                }
              });
              console.log('✅ کلاس جدید برای معلم ایجاد شد:', gradeClass.class_name);
            }
          } else {
            // اگر کلاس وجود داشت، معلم را به آن متصل کن
            await tx.classes.update({
              where: { id: gradeClass.id },
              data: { teacher_id: teacher.id }
            });
            console.log('✅ معلم به کلاس موجود متصل شد:', gradeClass.class_name);
          }
          
          specificInfo.connectedClasses = 1;
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
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, message: 'اطلاعات تکراری وجود دارد' }, { status: 409 });
    }
    if (error.code === 'P2003') {
      return NextResponse.json({ success: false, message: 'ارجاع به رکورد نامعتبر' }, { status: 400 });
    }
    return NextResponse.json({ success: false, message: `خطا در ایجاد کاربر: ${error.message}` }, { status: 500 });
  }
}