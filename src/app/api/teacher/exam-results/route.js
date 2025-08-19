import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// دریافت لیست آزمون‌ها
export async function GET() {
  try {
    const exams = await prisma.exams.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json(exams)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در دریافت آزمون‌ها' }, { status: 500 })
  }
}

// ثبت آزمون جدید
export async function POST(req) {
  try {
    const data = await req.json()
    const { type, title, pdf_url, image_url, questions } = data

    if (!title || !type) {
      return NextResponse.json({ error: 'عنوان و نوع آزمون الزامی است' }, { status: 400 })
    }

    let exam
    if (type === 'pdf') {
      if (!pdf_url) return NextResponse.json({ error: 'فایل PDF الزامی است' }, { status: 400 })
      exam = await prisma.exams.create({
        data: { title, type, pdf_url }
      })
    } else if (type === 'image') {
      if (!image_url) return NextResponse.json({ error: 'تصویر آزمون الزامی است' }, { status: 400 })
      exam = await prisma.exams.create({
        data: { title, type, image_url }
      })
    } else if (type === 'quiz') {
      if (!questions || !Array.isArray(questions) || questions.length === 0)
        return NextResponse.json({ error: 'سوالات الزامی است' }, { status: 400 })
      exam = await prisma.exams.create({
        data: {
          title,
          type,
          // اگر خواستی سوالات را جدا ذخیره کنی باید اینجا تغییر بدهی
        }
      })
      // اینجا می‌توانی سوالات را در جدول exam_questions ذخیره کنی
    } else {
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 })
    }

    return NextResponse.json(exam)
  } catch (e) {
    return NextResponse.json({ error: 'خطا در ثبت آزمون' }, { status: 500 })
  }
}