import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  const student = await prisma.students.findUnique({
    where: { id: Number(studentId) },
    select: { class_id: true }
  });
  if (!student) return NextResponse.json({ exams: [] });
  const exams = await prisma.exams.findMany({
    where: { class_id: student.class_id },
    orderBy: { id: 'desc' }
  });
  return NextResponse.json({ exams });
}