import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('student_id');
  if (!studentId) return NextResponse.json({ results: [] });
  const results = await prisma.exam_results.findMany({
    where: { student_id: Number(studentId) },
    include: { exams: true },
    orderBy: { id: 'desc' }
  });
  return NextResponse.json({ results });
}