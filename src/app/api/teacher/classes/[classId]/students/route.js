import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(req, { params }) {
  const { classId } = params
  try {
    const students = await prisma.students.findMany({
      where: { class_id: Number(classId) },
      include: {
        user: true
      },
      orderBy: { user: { last_name: 'asc' } }
    })
    return NextResponse.json({
      students: students.map(s => ({
        id: s.id,
        firstName: s.user.first_name,
        lastName: s.user.last_name,
        studentNumber: s.student_number
      }))
    })
  } catch (error) {
    return NextResponse.json({ students: [] }, { status: 500 })
  }
}