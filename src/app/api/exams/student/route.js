import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ success: false, error: 'توکن احراز هویت الزامی است' }, { status: 401 });
    }
    const payload = verifyJWT(token);
    if (!payload || !['student','teacher','admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const gradeId = Number(searchParams.get('grade_id'));
    const activeOnly = (searchParams.get('active_only') ?? 'true').toLowerCase() === 'true';

    if (!gradeId || Number.isNaN(gradeId)) {
      return NextResponse.json({ success: false, error: 'grade_id نامعتبر است' }, { status: 400 });
    }

    const exams = await prisma.exams.findMany({
      where: {
        ...(activeOnly ? { is_active: true } : {}),
        classes: { grade_id: gradeId } // ✅ فیلتر بر اساس کلاس/پایه
      },
      include: {
        classes: { include: { grades: { select: { id: true, grade_name: true, grade_level: true } } } } // ✅ join درست
      },
      orderBy: { created_at: 'desc' }
    });

    const formattedExams = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      type: exam.type,
      description: exam.description,
      subject: exam.subject,
      duration_minutes: exam.duration_minutes,
      total_marks: Number(exam.total_marks || 0),
      max_marks: Number(exam.total_marks || 0),
      is_active: exam.is_active,
      class_id: exam.class_id,
      grade_id: exam.classes?.grade_id ?? null,
      grade_name: exam.classes?.grades?.grade_name ?? null,
      grade_level: exam.classes?.grades?.grade_level ?? null,
      pdf_url: exam.pdf_url,
      image_url: exam.image_url,
      created_at: exam.created_at
    }));

    return NextResponse.json({ success: true, exams: formattedExams });
  } catch (error) {
    console.error('Error fetching student exams:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت آزمون‌ها' }, { status: 500 });
  }
}