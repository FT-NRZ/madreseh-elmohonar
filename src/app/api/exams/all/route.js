import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('class_id');
  let where = {};
  if (classId) where.class_id = Number(classId);

  const exams = await prisma.exams.findMany({
    where,
    orderBy: { id: 'desc' }
  });

  return NextResponse.json({ exams });
}