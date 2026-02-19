import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

function parseIntSafe(v) {
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentIdRaw = searchParams.get('studentId');
    const gradeIdRaw = searchParams.get('gradeId');
    const type = searchParams.get('type');

    const studentId = parseIntSafe(studentIdRaw);
    let gradeId = parseIntSafe(gradeIdRaw);

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'شناسه دانش‌آموز مورد نیاز است' }, { status: 400 });
    }

    // اگر gradeId نیامده، به صورت خودکار از جدول دانش‌آموز استخراج کن
    if (!gradeId) {
      const studentRecord = await prisma.students.findUnique({
        where: { id: studentId },
        select: {
          class_id: true,
          classes: {
            select: {
              grade_id: true
            }
          }
        }
      });
      gradeId = studentRecord?.classes?.grade_id || null;
    }

    const orConditions = [
      { target_type: 'all_students' },
      { target_type: 'specific_student', target_student_id: studentId }
    ];

    if (gradeId) {
      orConditions.push({ target_type: 'grade', target_grade_id: gradeId });
    }

    const reminders = await prisma.teacher_news.findMany({
      where: { OR: orConditions },
      include: {
        users: { select: { first_name: true, last_name: true } },
        target_grade: { select: { id: true, grade_name: true } },
        target_student: {
          include: { users: { select: { first_name: true, last_name: true } } }
        }
      },
      orderBy: [
        { is_important: 'desc' },
        { reminder_date: 'asc' },
        { created_at: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, reminders });

  } catch (error) {
    console.error('Error fetching student reminders:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت یادآوری‌ها' }, { status: 500 });
  }
}