import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function POST(req) {
  try {
    const data = await req.json()
    const { user_id, student_number, class_id, enrollment_date } = data

    if (!user_id || !student_number || !class_id || !enrollment_date) {
      return NextResponse.json({ error: 'همه فیلدها الزامی است' }, { status: 400 })
    }

    // اطمینان از وجود کلاس
    const classExists = await prisma.classes.findUnique({ where: { id: Number(class_id) } })
    if (!classExists) {
      return NextResponse.json({ error: 'کلاس انتخاب شده وجود ندارد' }, { status: 400 })
    }

    // ثبت دانش‌آموز
    const student = await prisma.students.create({
      data: {
        user_id: Number(user_id),
        student_number: String(student_number),
        class_id: Number(class_id),
        enrollment_date: new Date(enrollment_date)
      }
    })

    return NextResponse.json(student)
  } catch (error) {
    console.error('ثبت دانش‌آموز error:', error)
    return NextResponse.json({ error: 'خطا در ثبت دانش‌آموز', detail: error.message }, { status: 500 })
  }
}