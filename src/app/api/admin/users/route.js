import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader?.replace('Bearer ', '') || '';
}

function generateStudentNumber() {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `${timestamp.slice(-8)}${random}`;
}

function generateTeacherCode() {
  return `T${Date.now().toString().slice(-6)}`;
}

export async function GET(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ users: [] }, { status: 403 });
    }

    const users = await prisma.users.findMany({
      include: {
        entrances: true,
        students: {
          include: {
            classes: {
              include: {
                grades: true
              }
            }
          }
        },
        teachers: {
          include: {
            workshop: true
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    const formattedUsers = users.map(user => {
      const entrance = user.entrances;
      const student = user.students;
      const teacher = user.teachers;

      return {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        email: user.email,
        isActive: user.is_active,
        role: entrance?.role || 'نامشخص',
        nationalCode: entrance?.national_code || '',
        className: student?.classes?.class_name || '',
        gradeName: student?.classes?.grades?.grade_name || '',
        studentNumber: student?.student_number || '',
        teacherCode: teacher?.teacher_code || '',
        teachingType: teacher?.teaching_type || '',
        workshopName: teacher?.workshop?.workshop_name || '',
        subject: teacher?.subject || ''
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return NextResponse.json({ users: [] }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      firstName, lastName, nationalCode, phone, email, role, password, 
      classId, grade, 
      // فیلدهای جدید برای معلم
      teachingType, gradeId, workshopId, subject 
    } = body;

    if (!firstName || !lastName || !nationalCode || !role || !password) {
      return NextResponse.json({ success: false, message: 'لطفاً تمام فیلدهای اجباری را پر کنید' }, { status: 400 });
    }

    // اعتبارسنجی برای معلم
    if (role === 'teacher') {
      if (!teachingType) {
        return NextResponse.json({ success: false, message: 'نوع تدریس معلم الزامی است' }, { status: 400 });
      }
      if (teachingType === 'grade' && !gradeId) {
        return NextResponse.json({ success: false, message: 'انتخاب پایه برای معلم پایه‌ای الزامی است' }, { status: 400 });
      }
      if (teachingType === 'workshop' && !workshopId) {
        return NextResponse.json({ success: false, message: 'انتخاب کارگاه برای معلم کارگاه الزامی است' }, { status: 400 });
      }
    }

    if (String(nationalCode).length !== 10) {
      return NextResponse.json({ success: false, message: 'کد ملی باید 10 رقم باشد' }, { status: 400 });
    }

    // بررسی تکراری بودن
    const duplicateEntrance = await prisma.entrances.findUnique({ where: { national_code: String(nationalCode) } });
    if (duplicateEntrance) {
      return NextResponse.json({ success: false, message: 'کاربری با این کد ملی قبلاً ثبت شده است' }, { status: 409 });
    }

    if (phone) {
      const duplicatePhone = await prisma.users.findUnique({ where: { phone: String(phone) } });
      if (duplicatePhone) return NextResponse.json({ success: false, message: 'شماره تلفن تکراری است' }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    // تعیین کلاس برای دانش‌آموز
    let realClassId = classId ? Number(classId) : null;
    if (role === 'student' && !realClassId && grade) {
      const cls = await prisma.classes.findFirst({ where: { class_name: grade } });
      if (!cls) {
        return NextResponse.json({ success: false, message: 'کلاس مناسب برای پایه انتخابی وجود ندارد' }, { status: 400 });
      }
      realClassId = cls.id;
    }
    if (role === 'student' && !realClassId) {
      return NextResponse.json({ success: false, message: 'کلاس معتبر برای دانش‌آموز انتخاب نشده است' }, { status: 400 });
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
          national_code: String(nationalCode),
          password_hash: hashed,
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
            subject: subject || null,
            teaching_type: teachingType || 'grade',
            workshop_id: teachingType === 'workshop' ? Number(workshopId) : null
          }
        });
        
        // اگر معلم پایه‌ای است، به کلاس‌های آن پایه تخصیص بده
        if (teachingType === 'grade' && gradeId) {
          await tx.classes.updateMany({
            where: { grade_id: Number(gradeId) },
            data: { teacher_id: teacher.id }
          });
        }
        
        specificInfo = { 
          teacherCode: teacher.teacher_code,
          teachingType: teacher.teaching_type,
          gradeId: teachingType === 'grade' ? gradeId : null,
          workshopId: teachingType === 'workshop' ? workshopId : null
        };
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
        phone: result.user.phone,
        email: result.user.email,
        ...result.specificInfo
      }
    });
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return NextResponse.json({ success: false, message: 'خطای سرور' }, { status: 500 });
  }
}