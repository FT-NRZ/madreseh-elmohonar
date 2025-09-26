import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const student_id = searchParams.get('student_id');
  if (!student_id) {
    return NextResponse.json({ cards: [] });
  }
  const cards = await prisma.report_cards.findMany({
    where: { student_id: parseInt(student_id) },
    orderBy: { academic_year: 'desc' }
  });
  return NextResponse.json({ cards });
}
