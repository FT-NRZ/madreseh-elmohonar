import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const teacherId = params.teacherId;
  const classes = await prisma.classes.findMany({
    where: { teacher_id: Number(teacherId) }
  });
  return NextResponse.json({ classes });
}