export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) return auth.slice(7).trim();
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}
function safeVerify(token) { try { return verifyJWT(token); } catch { return null; } }
function resolveUserId(payload) { return Number(payload?.user_id ?? payload?.userId ?? payload?.id ?? payload?.sub); }
function extractHeaderUserId(request) {
  const raw = request.headers.get('x-user-id') || request.headers.get('x-userid') || request.headers.get('x-uid');
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}
async function getTeacherByUser(userIdOrTeacherId) {
  const idNum = Number(userIdOrTeacherId);
  if (!idNum || Number.isNaN(idNum)) return null;
  return prisma.teachers.findFirst({
    where: { OR: [{ user_id: idNum }, { id: idNum }] },
    select: { id: true }
  });
}

export async function GET(request, { params }) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    let userId = resolveUserId(payload) || extractHeaderUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });

    const teacher = await getTeacherByUser(userId);
    if (!teacher) return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });

    const id = Number(params.examId);
    if (!id) return NextResponse.json({ success: false, error: 'شناسه نامعتبر' }, { status: 400 });

    const exam = await prisma.exams.findFirst({
      where: { id, teacher_id: teacher.id },
      include: { classes: { include: { grades: { select: { id: true, grade_name: true, grade_level: true } } } } }
    });
    if (!exam) return NextResponse.json({ success: false, error: 'آزمون یافت نشد' }, { status: 404 });

    return NextResponse.json({ success: true, exam });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'خطا در دریافت آزمون' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    let userId = resolveUserId(payload) || extractHeaderUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });

    const teacher = await getTeacherByUser(userId);
    if (!teacher) return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });

    const id = Number(params.examId);
    if (!id) return NextResponse.json({ success: false, error: 'شناسه نامعتبر' }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const { is_active } = body;

    const updated = await prisma.exams.updateMany({
      where: { id, teacher_id: teacher.id },
      data: { is_active: Boolean(is_active), updated_at: new Date() }
    });
    if (updated.count === 0) return NextResponse.json({ success: false, error: 'آزمون یافت نشد' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'خطا در بروزرسانی آزمون' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }
    let userId = resolveUserId(payload) || extractHeaderUserId(request);
    if (!userId) return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });

    const teacher = await getTeacherByUser(userId);
    if (!teacher) return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });

    const id = Number(params.examId);
    if (!id) return NextResponse.json({ success: false, error: 'شناسه نامعتبر' }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      // سوالات آزمون
      const qIds = (await tx.exam_questions.findMany({
        where: { exam_id: id },
        select: { id: true }
      })).map(q => q.id);

      // نتایج آزمون
      const rIds = (await tx.exam_results.findMany({
        where: { exam_id: id },
        select: { id: true }
      })).map(r => r.id);

      // حذف پاسخ‌های دانش‌آموز (وابسته به سوال و نتیجه)
      if (qIds.length) {
        await tx.student_answers.deleteMany({ where: { question_id: { in: qIds } } });
      }
      if (rIds.length) {
        await tx.student_answers.deleteMany({ where: { result_id: { in: rIds } } });
      }

      // حذف نتایج و فایل‌های آپلودی
      if (rIds.length) await tx.exam_results.deleteMany({ where: { exam_id: id } });
      await tx.exam_file_answers.deleteMany({ where: { exam_id: id } });

      // حذف سوالات (question_options با onDelete: Cascade حذف می‌شوند)
      if (qIds.length) await tx.exam_questions.deleteMany({ where: { exam_id: id } });

      // حذف خود آزمون (با مالکیت معلم)
      const del = await tx.exams.deleteMany({ where: { id, teacher_id: teacher.id } });
      return del.count;
    });

    if (result === 0) {
      return NextResponse.json({ success: false, error: 'آزمون یافت نشد' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'خطا در حذف آزمون' }, { status: 500 });
  }
}