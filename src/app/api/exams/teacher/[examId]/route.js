import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET: جزئیات آزمون
export async function GET(req, { params }) {
  const examId = Number(params.examId);
  const exam = await prisma.exams.findUnique({ where: { id: examId } });
  if (!exam) return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });
  return NextResponse.json({ exam });
}

// PUT: ویرایش آزمون
export async function PUT(req, { params }) {
  const examId = Number(params.examId);
  const data = await req.json();
  const exam = await prisma.exams.update({
    where: { id: examId },
    data
  });
  return NextResponse.json({ success: true, exam });
}

// DELETE: حذف آزمون
export async function DELETE(req, { params }) {
  const examId = Number(params.examId);
  await prisma.exams.delete({ where: { id: examId } });
  return NextResponse.json({ success: true });
}