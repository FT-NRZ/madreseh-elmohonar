import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const students = await prisma.students.findMany();
    return NextResponse.json({ students });
  } catch (error) {
    return NextResponse.json({ students: [] }, { status: 500 });
  }
}