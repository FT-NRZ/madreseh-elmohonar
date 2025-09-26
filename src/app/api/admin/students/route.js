import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt'
import { z } from 'zod'

// اعتبارسنجی ورودی
const studentSchema = z.object({
  user_id: z.number().int().positive(),
  student_number: z.string().min(3).max(20),
  class_id: z.number().int().positive(),
  enrollment_date: z.string().refine(val => !isNaN(Date.parse(val)), { message: 'تاریخ نامعتبر است' })
})

// استخراج و اعتبارسنجی توکن ادمین
async function getAdminPayload(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  const token = authHeader.replace('Bearer ', '')
  if (!token) return null
  const payload = verifyJWT(token)
  if (!payload || payload.role !== 'admin') return null
  return payload
}

export async function POST(req) {
  try {
    // احراز هویت و نقش
    const payload = await getAdminPayload(req)
    if (!payload) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 })
    }

    // اعتبارسنجی ورودی
    let data
    try {
      data = await req.json()
    } catch {
      return NextResponse.json({ error: 'فرمت ورودی نامعتبر است' }, { status: 400 })
    }
    const parseResult = studentSchema.safeParse({
      ...data,
      user_id: Number(data.user_id),
      class_id: Number(data.class_id)
    })
    if (!parseResult.success) {
      return NextResponse.json({ error: 'ورودی نامعتبر است' }, { status: 400 })
    }
    const { user_id, student_number, class_id, enrollment_date } = parseResult.data

    // اطمینان از وجود کلاس
    const classExists = await prisma.classes.findUnique({ where: { id: class_id } })
    if (!classExists) {
      return NextResponse.json({ error: 'کلاس انتخاب شده وجود ندارد' }, { status: 400 })
    }

    // اطمینان از وجود کاربر
    const userExists = await prisma.users.findUnique({ where: { id: user_id } })
    if (!userExists) {
      return NextResponse.json({ error: 'کاربر انتخاب شده وجود ندارد' }, { status: 400 })
    }

    // جلوگیری از ثبت دانش‌آموز تکراری با user_id
    const duplicateStudent = await prisma.students.findUnique({ where: { user_id } })
    if (duplicateStudent) {
      return NextResponse.json({ error: 'این کاربر قبلاً به عنوان دانش‌آموز ثبت شده است' }, { status: 400 })
    }

    // جلوگیری از تکراری بودن student_number
    const duplicateNumber = await prisma.students.findFirst({ where: { student_number } })
    if (duplicateNumber) {
      return NextResponse.json({ error: 'شماره دانش‌آموز قبلاً ثبت شده است' }, { status: 400 })
    }

    // ثبت دانش‌آموز
    const student = await prisma.students.create({
      data: {
        user_id,
        student_number,
        class_id,
        enrollment_date: new Date(enrollment_date)
      }
    })

    // فقط اطلاعات غیرحساس را برگردان
    return NextResponse.json({
      id: student.id,
      user_id: student.user_id,
      student_number: student.student_number,
      class_id: student.class_id,
      enrollment_date: student.enrollment_date
    })
  } catch (error) {
    // اطلاعات حساس را لاگ نکن
    console.error('ثبت دانش‌آموز error')
    return NextResponse.json({ error: 'خطا در ثبت دانش‌آموز' }, { status: 500 })
  }
}