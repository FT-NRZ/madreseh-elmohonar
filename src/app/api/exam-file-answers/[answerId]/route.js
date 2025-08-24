import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

export async function PUT(req, context) {
  const params = await context.params;
  const { answerId } = params;
  const { grade_desc, teacher_feedback } = await req.json();
  const updated = await prisma.exam_file_answers.update({
    where: { id: Number(answerId) },
    data: {
      grade_desc,
      teacher_feedback
    }
  });
  return NextResponse.json({ success: true, updated });
}