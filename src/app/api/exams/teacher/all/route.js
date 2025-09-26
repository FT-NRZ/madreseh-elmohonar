import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET: لیست آزمون‌های معلم (بر اساس teacher_id)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get('teacher_id');
  // فرض: هر آزمون یک کلاس دارد و هر کلاس یک معلم دارد
  const classes = await prisma.classes.findMany({
    where: { teacher_id: Number(teacherId) },
    select: { id: true }
  });
  const classIds = classes.map(c => c.id);
  const exams = await prisma.exams.findMany({
    where: { class_id: { in: classIds } },
    orderBy: { id: 'desc' }
  });
  return NextResponse.json({ exams });
}
