import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';
import { z } from 'zod';

// اسکیما اعتبارسنجی
const assignmentSchema = z.object({
  teacherId: z.coerce.number().int().positive().max(2147483647),
  studentId: z.coerce.number().int().positive().max(2147483647)
});

// تابع دریافت توکن از هدر
function getToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.replace('Bearer ', '').trim();
  return token.length > 0 ? token : null;
}

// بررسی دسترسی ادمین یا معلم
async function validateAccess(request) {
  const token = getToken(request);
  if (!token) return { valid: false, message: 'احراز هویت مورد نیاز است' };

  try {
    const payload = verifyJWT(token);
    if (!payload) {
      return { valid: false, message: 'توکن نامعتبر است' };
    }

    // فقط ادمین و معلم مجاز هستند
    if (!['admin', 'teacher'].includes(payload.role)) {
      return { valid: false, message: 'دسترسی مجاز نیست' };
    }

    // اعتبارسنجی اضافی payload
    if (!payload.userId || typeof payload.userId !== 'number') {
      return { valid: false, message: 'توکن نامعتبر است' };
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, message: 'توکن نامعتبر است' };
  }
}

// تخصیص دانش‌آموز به معلم (POST)
export async function POST(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    // پارس کردن داده‌های ورودی
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    // اعتبارسنجی داده‌های ورودی
    const parseResult = assignmentSchema.safeParse(requestData);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({
        success: false,
        message: `اطلاعات نامعتبر: ${errorMessage}`
      }, { status: 400 });
    }

    const { teacherId, studentId } = parseResult.data;

    // اگر کاربر معلم است، فقط مجاز به تخصیص خود است
    if (accessCheck.payload.role === 'teacher') {
      const teacherRecord = await prisma.teachers.findFirst({
        where: { user_id: accessCheck.payload.userId },
        select: { id: true }
      });

      if (!teacherRecord || teacherRecord.id !== teacherId) {
        return NextResponse.json({
          success: false,
          message: 'شما فقط مجاز به تخصیص دانش‌آموز به خود هستید'
        }, { status: 403 });
      }
    }

    // بررسی وجود معلم
    const teacher = await prisma.teachers.findUnique({
      where: { id: teacherId },
      include: {
        users: {
          select: {
            is_active: true,
            entrances: {
              select: {
                is_active: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: 'معلم انتخاب شده وجود ندارد'
      }, { status: 404 });
    }

    if (!teacher.users?.is_active || !teacher.users?.entrances?.is_active) {
      return NextResponse.json({
        success: false,
        message: 'معلم انتخاب شده غیرفعال است'
      }, { status: 400 });
    }

    if (teacher.users?.entrances?.role !== 'teacher') {
      return NextResponse.json({
        success: false,
        message: 'کاربر انتخاب شده معلم نیست'
      }, { status: 400 });
    }

    // بررسی وجود دانش‌آموز
    const student = await prisma.students.findUnique({
      where: { id: studentId },
      include: {
        users: {
          select: {
            is_active: true,
            entrances: {
              select: {
                is_active: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'دانش‌آموز انتخاب شده وجود ندارد'
      }, { status: 404 });
    }

    if (!student.users?.is_active || !student.users?.entrances?.is_active) {
      return NextResponse.json({
        success: false,
        message: 'دانش‌آموز انتخاب شده غیرفعال است'
      }, { status: 400 });
    }

    if (student.users?.entrances?.role !== 'student') {
      return NextResponse.json({
        success: false,
        message: 'کاربر انتخاب شده دانش‌آموز نیست'
      }, { status: 400 });
    }

    // بررسی تخصیص قبلی
    const existingAssignment = await prisma.student_teacher.findFirst({
      where: {
        teacher_id: teacherId,
        student_id: studentId
      },
      select: { id: true }
    });

    if (existingAssignment) {
      return NextResponse.json({
        success: false,
        message: 'این دانش‌آموز قبلاً به این معلم تخصیص داده شده'
      }, { status: 409 });
    }

    // تخصیص دانش‌آموز به معلم
    const assignment = await prisma.student_teacher.create({
      data: {
        teacher_id: teacherId,
        student_id: studentId,
        assigned_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'دانش‌آموز با موفقیت به معلم تخصیص داده شد',
      data: {
        id: assignment.id,
        teacherId: assignment.teacher_id,
        studentId: assignment.student_id,
        assignedAt: assignment.assigned_at
      }
    });

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Assignment error:', error.message);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'این دانش‌آموز قبلاً به این معلم تخصیص داده شده'
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
      message: 'خطا در تخصیص دانش‌آموز'
    }, { status: 500 });
  }
}

// حذف تخصیص (DELETE)
export async function DELETE(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    // پارس کردن داده‌های ورودی
    let requestData;
    try {
      requestData = await request.json();
    } catch {
      return NextResponse.json({
        success: false,
        message: 'فرمت JSON نامعتبر است'
      }, { status: 400 });
    }

    // اعتبارسنجی داده‌های ورودی
    const parseResult = assignmentSchema.safeParse(requestData);
    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ');
      return NextResponse.json({
        success: false,
        message: `اطلاعات نامعتبر: ${errorMessage}`
      }, { status: 400 });
    }

    const { teacherId, studentId } = parseResult.data;

    // اگر کاربر معلم است، فقط مجاز به حذف تخصیص خود است
    if (accessCheck.payload.role === 'teacher') {
      const teacherRecord = await prisma.teachers.findFirst({
        where: { user_id: accessCheck.payload.userId },
        select: { id: true }
      });

      if (!teacherRecord || teacherRecord.id !== teacherId) {
        return NextResponse.json({
          success: false,
          message: 'شما فقط مجاز به حذف تخصیص خود هستید'
        }, { status: 403 });
      }
    }

    // بررسی وجود تخصیص قبل از حذف
    const existingAssignment = await prisma.student_teacher.findFirst({
      where: {
        teacher_id: teacherId,
        student_id: studentId
      },
      select: { id: true }
    });

    if (!existingAssignment) {
      return NextResponse.json({
        success: false,
        message: 'تخصیص مورد نظر وجود ندارد'
      }, { status: 404 });
    }

    // حذف تخصیص
    await prisma.student_teacher.deleteMany({
      where: {
        teacher_id: teacherId,
        student_id: studentId
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تخصیص با موفقیت حذف شد'
    });

  } catch (error) {
    // لاگ امن خطا
    if (process.env.NODE_ENV === 'development') {
      console.error('Remove assignment error:', error.message);
    }

    // بررسی خطاهای خاص Prisma
    if (error.code === 'P2003') {
      return NextResponse.json({
        success: false,
        message: 'ارجاع به رکورد نامعتبر'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در حذف تخصیص'
    }, { status: 500 });
  }
}

// دریافت لیست تخصیص‌ها (GET)
export async function GET(request) {
  try {
    // بررسی دسترسی
    const accessCheck = await validateAccess(request);
    if (!accessCheck.valid) {
      return NextResponse.json({
        success: false,
        message: accessCheck.message,
        assignments: []
      }, { status: accessCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 });
    }

    let whereClause = {};

    // اگر کاربر معلم است، فقط تخصیص‌های خودش را ببیند
    if (accessCheck.payload.role === 'teacher') {
      const teacherRecord = await prisma.teachers.findFirst({
        where: { user_id: accessCheck.payload.userId },
        select: { id: true }
      });

      if (!teacherRecord) {
        return NextResponse.json({
          success: false,
          message: 'اطلاعات معلم یافت نشد',
          assignments: []
        }, { status: 404 });
      }

      whereClause.teacher_id = teacherRecord.id;
    }

    const assignments = await prisma.student_teacher.findMany({
      where: whereClause,
      include: {
        teachers: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        },
        students: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: {
        assigned_at: 'desc'
      }
    });

    const formattedAssignments = assignments.map(assignment => ({
      id: assignment.id,
      teacherId: assignment.teacher_id,
      studentId: assignment.student_id,
      teacherName: `${assignment.teachers?.users?.first_name || ''} ${assignment.teachers?.users?.last_name || ''}`.trim(),
      studentName: `${assignment.students?.users?.first_name || ''} ${assignment.students?.users?.last_name || ''}`.trim(),
      assignedAt: assignment.assigned_at
    }));

    return NextResponse.json({
      success: true,
      assignments: formattedAssignments,
      total: formattedAssignments.length,
      message: 'لیست تخصیص‌ها با موفقیت دریافت شد'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GET assignments error:', error.message);
    }

    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت لیست تخصیص‌ها',
      assignments: []
    }, { status: 500 });
  }
}

// محدود کردن متدهای HTTP
export async function PUT(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}

export async function PATCH(request) {
  return NextResponse.json({
    success: false,
    message: 'متد مجاز نیست'
  }, { status: 405 });
}