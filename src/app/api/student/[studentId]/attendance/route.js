import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../prisma/client';

export async function GET(req, { params }) {
  const { studentId } = params;
  try {
    const attendances = await prisma.attendance.findMany({
      where: { studentId: Number(studentId) },
      orderBy: { date: 'desc' }
    });
    return NextResponse.json({ attendances });
  } catch (err) {
    return NextResponse.json({ attendances: [] }, { status: 500 });
  }
}