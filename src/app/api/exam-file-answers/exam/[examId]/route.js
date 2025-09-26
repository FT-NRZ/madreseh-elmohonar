import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const examId = Number(params.examId);

  const answers = await prisma.exam_file_answers.findMany({
    where: { exam_id: examId },
    include: {
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          grade: {
            select: { grade_name: true }
          }
        }
      }
    },
    orderBy: { id: 'desc' }
  });

  return NextResponse.json({
    success: true,
    answers: answers.map(a => ({
      id: a.id,
      student_id: a.student_id,
      student_name: a.student ? `${a.student.first_name} ${a.student.last_name}` : 'نام ثبت نشده',
      grade: a.student?.grade?.grade_name || 'پایه ثبت نشده',
      file_url: a.file_url,
      grade_desc: a.grade_desc,
      teacher_feedback: a.teacher_feedback
    }))
  });
}