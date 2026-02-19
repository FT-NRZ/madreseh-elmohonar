export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(req) {
  const h = req.headers.get('authorization') || req.headers.get('Authorization') || '';
  if (h.toLowerCase().startsWith('bearer ')) return h.slice(7).trim();
  const cookie = req.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}
function safeVerify(t) { try { return verifyJWT(t); } catch { return null; } }

export async function GET(request, { params }) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || !['student','teacher','admin'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 401 });
    }

    const inputId = Number(params.studentId);
    if (!inputId) return NextResponse.json({ success: false, message: 'شناسه نامعتبر' }, { status: 400 });

    // پذیرش هر دو حالت: students.id یا user_id
    const student = await prisma.students.findFirst({
      where: { OR: [{ id: inputId }, { user_id: inputId }] },
      select: { id: true }
    });
    if (!student) return NextResponse.json({ success: false, message: 'دانش‌آموز یافت نشد' }, { status: 404 });

    const studentId = student.id;

    const [quizCount, fileCount, recent] = await Promise.all([
      prisma.exam_results.count({ where: { student_id: studentId } }),
      prisma.exam_file_answers.count({ where: { student_id: studentId } }),
      prisma.exam_results.findMany({
        where: { student_id: studentId },
        orderBy: { completed_at: 'desc' },
        take: 5,
        include: { exams: { select: { id: true, title: true, type: true, total_marks: true } } }
      })
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        examsTaken: quizCount,
        fileAnswers: fileCount,
        recentResults: recent.map(r => ({
          id: r.id,
          exam: r.exams ? {
            id: r.exams.id,
            title: r.exams.title,
            type: r.exams.type,
            total_marks: Number(r.exams.total_marks || 0)
          } : null,
          marks_obtained: r.marks_obtained ? Number(r.marks_obtained) : null,
          status: r.status,
          completed_at: r.completed_at
        }))
      }
    });
  } catch {
    return NextResponse.json({ success: false, message: 'خطا در دریافت آمار' }, { status: 500 });
  }
}