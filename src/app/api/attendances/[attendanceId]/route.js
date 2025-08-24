import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function PUT(request, { params }) {
  const id = Number(params.attendanceId);
  const data = await request.json();
  const attendance = await prisma.attendance.update({
    where: { id },
    data
  });
  return NextResponse.json({ attendance });
}

export async function DELETE(request, { params }) {
  const id = Number(params.attendanceId);
  await prisma.attendance.delete({ where: { id } });
  return NextResponse.json({ success: true });
}