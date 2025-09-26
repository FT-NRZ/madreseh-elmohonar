import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({ where: { id } });
    if (!exam) return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('GET /teacher/exams/[id] error:', error);
    return NextResponse.json({ error: 'خطا در دریافت آزمون' }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const payload = await request.json().catch(() => ({}));
    const safe = {};
    if (typeof payload.title === 'string') safe.title = payload.title.trim();
    if (['pdf', 'image', 'quiz'].includes(payload.type)) safe.type = payload.type;
    if (payload.class_id != null && !Number.isNaN(Number(payload.class_id))) safe.class_id = Number(payload.class_id);
    if (payload.pdf_url != null) safe.pdf_url = payload.pdf_url ? String(payload.pdf_url).trim() : null;
    if (payload.image_url != null) safe.image_url = payload.image_url ? String(payload.image_url).trim() : null;
    if (Array.isArray(payload.questions)) safe.questions = JSON.stringify(payload.questions);
    if (typeof payload.is_active === 'boolean') safe.is_active = payload.is_active;
    if (payload.duration_minutes != null && !Number.isNaN(Number(payload.duration_minutes))) safe.duration_minutes = Number(payload.duration_minutes);
    if (payload.total_marks != null) safe.total_marks = String(payload.total_marks);

    const exam = await prisma.exams.update({ where: { id }, data: safe });
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    console.error('PUT /teacher/exams/[id] error:', error);
    return NextResponse.json({ error: 'خطا در ویرایش آزمون' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const exists = await prisma.exams.findUnique({ where: { id } });
    if (!exists) return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });

    // پاک‌سازی وابستگی‌ها برای جلوگیری از خطای FK
    await prisma.exam_results.deleteMany({ where: { exam_id: id } });
    await prisma.exam_file_answers.deleteMany({ where: { exam_id: id } });

    await prisma.exams.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /teacher/exams/[id] error:', error);
    return NextResponse.json({ error: 'خطا در حذف آزمون' }, { status: 500 });
  }
}
