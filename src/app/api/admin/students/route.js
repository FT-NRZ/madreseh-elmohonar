import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt'
import { z } from 'zod'

// اعتبارسنجی ورودی با قوانین امنیتی
const studentSchema = z.object({
  user_id: z.number().int().positive().max(2147483647), // محدودیت INT در MySQL
  student_number: z.string()
    .min(3, 'شماره دانش‌آموز حداقل 3 کاراکتر باشد')
    .max(20, 'شماره دانش‌آموز حداکثر 20 کاراکتر باشد')
    .regex(/^[A-Za-z0-9]+$/, 'شماره دانش‌آموز فقط شامل حروف و اعداد انگلیسی'),
  class_id: z.number().int().positive().max(2147483647),
  enrollment_date: z.string()
    .refine(val => !isNaN(Date.parse(val)), { message: 'فرمت تاریخ نامعتبر است' })
    .refine(val => {
      const date = new Date(val);
      const now = new Date();
      const minDate = new Date('2020-01-01');
      return date >= minDate && date <= now;
    }, { message: 'تاریخ ثبت‌نام باید بین سال 2020 تا امروز باشد' })
})

// استخراج و اعتبارسنجی امن توکن
function getToken(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '').trim()
  return token.length > 0 ? token : null
}

// بررسی دسترسی ادمین
async function validateAdminAccess(request) {
  const token = getToken(request)
  if (!token) return { valid: false, message: 'احراز هویت مورد نیاز است' }

  try {
    const payload = verifyJWT(token)
    if (!payload || payload.role !== 'admin') {
      return { valid: false, message: 'دسترسی مجاز نیست' }
    }

    // اعتبارسنجی اضافی payload
    if (!payload.userId || typeof payload.userId !== 'number') {
      return { valid: false, message: 'توکن نامعتبر است' }
    }

    return { valid: true, payload }
  } catch (error) {
    return { valid: false, message: 'توکن نامعتبر است' }
  }
}

export async function POST(request) {
  try {
    // بررسی دسترسی ادمین
    const adminCheck = await validateAdminAccess(request)
    if (!adminCheck.valid) {
      return NextResponse.json({ 
        success: false,
        error: adminCheck.message 
      }, { status: adminCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 })
    }

    // پارس کردن داده‌های ورودی
    let requestData
    try {
      requestData = await request.json()
    } catch {
      return NextResponse.json({ 
        success: false,
        error: 'فرمت JSON نامعتبر است' 
      }, { status: 400 })
    }

    // تبدیل امن رشته‌ها به عدد
    const parseResult = studentSchema.safeParse({
      ...requestData,
      user_id: parseInt(requestData.user_id, 10),
      class_id: parseInt(requestData.class_id, 10)
    })

    if (!parseResult.success) {
      const errorMessage = parseResult.error.errors.map(e => e.message).join(', ')
      return NextResponse.json({ 
        success: false,
        error: `اطلاعات نامعتبر: ${errorMessage}` 
      }, { status: 400 })
    }

    const { user_id, student_number, class_id, enrollment_date } = parseResult.data

    // بررسی وجود کاربر و نقش آن
    const user = await prisma.users.findUnique({ 
      where: { id: user_id },
      include: {
        entrances: {
          select: {
            role: true,
            is_active: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: 'کاربر انتخاب شده وجود ندارد' 
      }, { status: 404 })
    }

    if (!user.entrances || user.entrances.role !== 'student') {
      return NextResponse.json({ 
        success: false,
        error: 'کاربر انتخاب شده دانش‌آموز نیست' 
      }, { status: 400 })
    }

    if (!user.entrances.is_active) {
      return NextResponse.json({ 
        success: false,
        error: 'کاربر انتخاب شده غیرفعال است' 
      }, { status: 400 })
    }

    // بررسی وجود کلاس
    const classExists = await prisma.classes.findUnique({ 
      where: { id: class_id },
      select: { id: true, class_name: true }
    })

    if (!classExists) {
      return NextResponse.json({ 
        success: false,
        error: 'کلاس انتخاب شده وجود ندارد' 
      }, { status: 404 })
    }

    // بررسی تکراری بودن user_id
    const existingStudent = await prisma.students.findUnique({ 
      where: { user_id },
      select: { id: true }
    })

    if (existingStudent) {
      return NextResponse.json({ 
        success: false,
        error: 'این کاربر قبلاً به عنوان دانش‌آموز ثبت شده است' 
      }, { status: 409 })
    }

    // بررسی تکراری بودن student_number
    const duplicateNumber = await prisma.students.findFirst({ 
      where: { student_number },
      select: { id: true }
    })

    if (duplicateNumber) {
      return NextResponse.json({ 
        success: false,
        error: 'شماره دانش‌آموز قبلاً ثبت شده است' 
      }, { status: 409 })
    }

    // ثبت دانش‌آموز در تراکنش
    const student = await prisma.$transaction(async (tx) => {
      const newStudent = await tx.students.create({
        data: {
          user_id,
          student_number: student_number.trim(),
          class_id,
          enrollment_date: new Date(enrollment_date),
          status: 'active'
        }
      })

      // به‌روزرسانی وضعیت کاربر
      await tx.users.update({
        where: { id: user_id },
        data: { 
          is_active: true,
          updated_at: new Date()
        }
      })

      return newStudent
    })

    return NextResponse.json({
      success: true,
      message: 'دانش‌آموز با موفقیت ثبت شد',
      student: {
        id: student.id,
        user_id: student.user_id,
        student_number: student.student_number,
        class_id: student.class_id,
        enrollment_date: student.enrollment_date,
        status: student.status
      }
    }, { status: 201 })

  } catch (error) {
    // لاگ امن خطا (فقط در development)
    if (process.env.NODE_ENV === 'development') {
      console.error('POST /api/admin/students error:', error.message)
    }

    // بررسی خطاهای خاص دیتابیس
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: false,
        error: 'اطلاعات تکراری وجود دارد' 
      }, { status: 409 })
    }

    if (error.code === 'P2003') {
      return NextResponse.json({ 
        success: false,
        error: 'ارجاع به رکورد نامعتبر' 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: false,
      error: 'خطای سرور در ثبت دانش‌آموز' 
    }, { status: 500 })
  }
}

// دریافت لیست دانش‌آموزان (GET)
export async function GET(request) {
  try {
    // بررسی دسترسی ادمین
    const adminCheck = await validateAdminAccess(request)
    if (!adminCheck.valid) {
      return NextResponse.json({ 
        success: false,
        error: adminCheck.message,
        students: []
      }, { status: adminCheck.message === 'احراز هویت مورد نیاز است' ? 401 : 403 })
    }

    const students = await prisma.students.findMany({
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            phone: true,
            email: true,
            is_active: true
          }
        },
        classes: {
          select: {
            class_name: true,
            class_number: true,
            grades: {
              select: {
                grade_name: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })

    const formattedStudents = students.map(student => ({
      id: student.id,
      student_number: student.student_number,
      first_name: student.users?.first_name || 'نامشخص',
      last_name: student.users?.last_name || 'نامشخص',
      full_name: `${student.users?.first_name || ''} ${student.users?.last_name || ''}`.trim() || 'نامشخص',
      phone: student.users?.phone || null,
      email: student.users?.email || null,
      class_name: student.classes?.class_name || 'نامشخص',
      class_number: student.classes?.class_number || null,
      grade_name: student.classes?.grades?.grade_name || 'نامشخص',
      status: student.status,
      enrollment_date: student.enrollment_date,
      is_active: student.users?.is_active || false
    }))

    return NextResponse.json({
      success: true,
      students: formattedStudents,
      total: formattedStudents.length,
      message: 'لیست دانش‌آموزان با موفقیت دریافت شد'
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GET /api/admin/students error:', error.message)
    }

    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت لیست دانش‌آموزان',
      students: []
    }, { status: 500 })
  }
}