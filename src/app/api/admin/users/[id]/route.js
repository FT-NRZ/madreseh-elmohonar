import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { hashPassword } from '@/lib/password';
import { verifyJWT } from '@/lib/jwt';

// تابع دریافت توکن از هدر
function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    const t = auth.slice(7).trim().replace(/^bearer\s+/i,'').replace(/^"+|"+$/g,'').replace(/^'+|'+$/g,'');
    if (t && t !== 'undefined' && t !== 'null') return t;
  }
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  if (m?.[1]) return decodeURIComponent(m[1]);
  return null;
}

function authorizeAdmin(request) {
  const token = getToken(request);
  const payload = verifyJWT(token);
  if (!payload) return { error: NextResponse.json({ success:false, message:'توکن نامعتبر است' }, { status:401 }) };
  if (payload.role !== 'admin') return { error: NextResponse.json({ success:false, message:'دسترسی مجاز نیست' }, { status:403 }) };
  return { payload };
}

// دریافت اطلاعات یک کاربر (GET)
export async function GET(request, context) {
  const auth = authorizeAdmin(request);
  if (auth.error) return auth.error;
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: 'شناسه کاربر معتبر نیست'
      }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
      where: { id: userId },
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
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    const formattedUser = {
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
      nationalCode: user.entrances?.national_code,
      role: user.entrances?.role,
      roleActive: user.entrances?.is_active,
      lastLogin: user.entrances?.last_login_at,
      
      // اطلاعات دانش‌آموز
      studentInfo: user.students ? {
        studentNumber: user.students.student_number,
        classId: user.students.class_id,
        className: user.students.classes?.class_name,
        gradeName: user.students.classes?.grades?.grade_name,
        status: user.students.status,
        enrollmentDate: user.students.enrollment_date
      } : null,
      
      // اطلاعات معلم
      teacherInfo: user.teachers ? {
        teacherCode: user.teachers.teacher_code,
        subject: user.teachers.subject,
        teachingType: user.teachers.teaching_type,
        workshopId: user.teachers.workshop_id,
        workshopName: user.teachers.workshop?.workshop_name,  // تغییر از workshops به workshop
        status: user.teachers.status,
        hireDate: user.teachers.hire_date
      } : null
    };

    return NextResponse.json({
      success: true,
      user: formattedUser,
      message: 'اطلاعات کاربر با موفقیت دریافت شد'
    });

  } catch (error) {
    console.error('GET /api/admin/users/[id] error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت اطلاعات کاربر'
    }, { status: 500 });
  }
}

// ویرایش کاربر (PUT)
export async function PUT(request, context) {
  const auth = authorizeAdmin(request);
  if (auth.error) return auth.error;
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: 'شناسه کاربر معتبر نیست'
      }, { status: 400 });
    }

    const body = await request.json();
    const {
      firstName, lastName, nationalCode, phone, email, role,
      grade, classId, password, subject, teachingType, gradeId, workshopId
    } = body;

    // اعتبارسنجی فیلدهای اصلی
    if (!firstName || !lastName || !nationalCode || !role) {
      return NextResponse.json({
        success: false,
        message: 'اطلاعات ناقص است'
      }, { status: 400 });
    }

    // یافتن کاربر موجود
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        entrances: true,
        students: true,
        teachers: true
      }
    });

    if (!existingUser || !existingUser.entrances) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یا اطلاعات ورود یافت نشد'
      }, { status: 404 });
    }

    // شروع تراکنش برای به‌روزرسانی
    await prisma.$transaction(async (tx) => {
      // به‌روزرسانی اطلاعات کاربر
      await tx.users.update({
        where: { id: userId },
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          email: email || null,
          updated_at: new Date()
        }
      });

      // به‌روزرسانی اطلاعات ورود
      const entranceUpdate = {
        national_code: String(nationalCode),
        role: role,
        updated_at: new Date()
      };

      if (password) {
        entranceUpdate.password_hash = await hashPassword(password);
      }

      await tx.entrances.update({
        where: { id: existingUser.entrances.id },
        data: entranceUpdate
      });

      // به‌روزرسانی اطلاعات ویژه دانش‌آموز
      if (role === 'student') {
        let newClassId = classId ? Number(classId) : null;
        
        if (!newClassId && grade) {
          const cls = await tx.classes.findFirst({
            where: { class_name: grade }
          });
          if (cls) {
            newClassId = cls.id;
          }
        }

        if (newClassId && existingUser.students) {
          await tx.students.update({
            where: { user_id: userId },
            data: {
              class_id: newClassId,
              updated_at: new Date()
            }
          });
        }
      }

      // به‌روزرسانی اطلاعات ویژه معلم
      if (role === 'teacher' && existingUser.teachers) {
        const teacherUpdate = {
          subject: subject || null,
          teaching_type: teachingType || 'grade',
          workshop_id: teachingType === 'workshop' ? Number(workshopId) : null,
          updated_at: new Date()
        };

        await tx.teachers.update({
          where: { user_id: userId },
          data: teacherUpdate
        });

        // اگر تغییر پایه داشته، کلاس‌ها را به‌روزرسانی کن
        if (teachingType === 'grade' && gradeId) {
          // ابتدا کلاس‌های قبلی را از معلم جدا کن
          await tx.classes.updateMany({
            where: { teacher_id: existingUser.teachers.id },
            data: { teacher_id: null }
          });

          // سپس کلاس‌های جدید را وصل کن
          await tx.classes.updateMany({
            where: {
              grade_id: Number(gradeId),
              teacher_id: null
            },
            data: { teacher_id: existingUser.teachers.id }
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد'
    });

  } catch (error) {
    console.error('PUT /api/admin/users/[id] error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در ویرایش کاربر: ' + error.message
    }, { status: 500 });
  }
}

// حذف کاربر (DELETE)
export async function DELETE(request, context) {
  const auth = authorizeAdmin(request);
  if (auth.error) return auth.error;
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    const { id } = await context.params;
    const userId = Number(id);

    if (!userId || isNaN(userId)) {
      return NextResponse.json({
        success: false,
        message: 'شناسه کاربر معتبر نیست'
      }, { status: 400 });
    }

    // بررسی وجود کاربر
    const existingUser = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        teachers: true
      }
    });

    if (!existingUser) {
      return NextResponse.json({
        success: false,
        message: 'کاربر یافت نشد'
      }, { status: 404 });
    }

    // اگر کاربر معلم است، کلاس‌هایش را آزاد کن
    if (existingUser.teachers) {
      await prisma.classes.updateMany({
        where: { teacher_id: existingUser.teachers.id },
        data: { teacher_id: null }
      });
    }

    // حذف کاربر (سایر رکوردها به دلیل CASCADE حذف می‌شوند)
    await prisma.users.delete({
      where: { id: userId }
    });

    return NextResponse.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        message: 'ابتدا اطلاعات وابسته را حذف کنید'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در حذف کاربر'
    }, { status: 500 });
  }
}