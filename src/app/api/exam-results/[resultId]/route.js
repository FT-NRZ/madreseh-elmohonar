import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function PUT(req, context) {
  const params = await context.params;
  const { resultId } = params;
  const { grade_desc } = await req.json();
  const updated = await prisma.exam_results.update({
    where: { id: Number(resultId) },
    data: {
      grade_desc,
      status: 'completed'
    }
  });
  return NextResponse.json({ success: true, updated });
}