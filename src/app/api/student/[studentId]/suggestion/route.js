import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// دریافت پیشنهادهای دانش‌آموز
export async function GET(req, { params }) {
  const { studentId } = params
  try {
    const suggestions = await prisma.suggestions.findMany({
      where: { student_id: Number(studentId) },
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json({ suggestions })
  } catch (error) {
    return NextResponse.json({ suggestions: [] }, { status: 500 })
  }
}

// ثبت پیشنهاد جدید
export async function POST(req, { params }) {
  const { studentId } = params
  try {
    const data = await req.json()
    const { text } = data
    if (!text) {
      return NextResponse.json({ error: 'متن پیشنهاد الزامی است' }, { status: 400 })
    }
    const suggestion = await prisma.suggestions.create({
      data: {
        student_id: Number(studentId),
        text
      }
    })
    return NextResponse.json({ suggestion })
  } catch (error) {
    return NextResponse.json({ error: 'خطا در ثبت پیشنهاد' }, { status: 500 })
  }
}