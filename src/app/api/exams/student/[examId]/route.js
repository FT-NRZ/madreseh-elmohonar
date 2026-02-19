import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ success: false, error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({
      where: { id },
      include: {
        classes: { include: { grades: { select: { id: true, grade_name: true, grade_level: true } } } }
      },
      select: undefined // فقط include بالا کافی است
    });

    if (!exam) return NextResponse.json({ success: false, error: 'آزمون پیدا نشد' }, { status: 404 });
    if (!exam.is_active) return NextResponse.json({ success: false, error: 'آزمون غیرفعال است' }, { status: 403 });

    let parsedQuestions = null;
    if (exam.questions) {
      try {
        parsedQuestions = JSON.parse(exam.questions);
        if (Array.isArray(parsedQuestions)) {
          parsedQuestions = parsedQuestions.map(q => {
            const { answer, ...rest } = q;
            return rest;
          });
        }
      } catch { parsedQuestions = null; }
    }

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        type: exam.type,
        questions: parsedQuestions,
        duration_minutes: exam.duration_minutes,
        total_marks: Number(exam.total_marks || 0),
        max_marks: Number(exam.total_marks || 0),
        is_active: exam.is_active,
        pdf_url: exam.pdf_url,
        image_url: exam.image_url,
        subject: exam.subject,
        class_id: exam.class_id,
        grade_id: exam.classes?.grade_id ?? null,
        grade_name: exam.classes?.grades?.grade_name ?? null,
        grade_level: exam.classes?.grades?.grade_level ?? null,
        created_at: exam.created_at
      }
    });

  } catch (error) {
    console.error('GET /api/exams/student/[examId] error:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت جزئیات آزمون' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);
    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({ success: false, error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ success: false, error: 'توکن احراز هویت الزامی است' }, { status: 401 });

    let payload;
    try { payload = verifyJWT(token); } catch { return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 }); }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: 'داده‌های ارسالی نامعتبر است' }, { status: 400 });

    const { student_id, answers, file_url } = body;

    const exam = await prisma.exams.findUnique({
      where: { id },
      select: { id: true, title: true, type: true, questions: true, total_marks: true, is_active: true }
    });
    if (!exam) return NextResponse.json({ success: false, error: 'آزمون پیدا نشد' }, { status: 404 });
    if (!exam.is_active) return NextResponse.json({ success: false, error: 'آزمون غیرفعال است' }, { status: 403 });

    // پیدا کردن دانش‌آموز با هر دو حالت user_id یا id
    let student = await prisma.students.findFirst({
      where: { OR: [{ user_id: Number(student_id) }, { id: Number(student_id) }] },
      select: { id: true, user_id: true }
    });
    if (!student) return NextResponse.json({ success: false, error: 'دانش‌آموز پیدا نشد' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      if (file_url && typeof file_url === 'string' && file_url.trim()) {
        const exists = await tx.exam_file_answers.findFirst({ where: { exam_id: id, student_id: student.id } });
        if (exists) throw new Error('قبلاً پاسخ فایلی برای این آزمون ارسال شده است');

        const fileAnswer = await tx.exam_file_answers.create({
          data: { exam_id: id, student_id: student.id, file_url: file_url.trim() },
          select: { id: true, exam_id: true, student_id: true, file_url: true, created_at: true }
        });
        return { success: true, type: 'file', answer: fileAnswer, message: 'پاسخ فایلی با موفقیت ثبت شد' };
      }

      if (exam.type === 'quiz' && answers && typeof answers === 'object') {
        const exists = await tx.exam_results.findFirst({ where: { exam_id: id, student_id: student.id } });
        if (exists) throw new Error('قبلاً پاسخ این آزمون ثبت شده است');

        let examQuestions = [];
        try { examQuestions = exam.questions ? JSON.parse(exam.questions) : []; }
        catch { throw new Error('ساختار سوالات آزمون نامعتبر است'); }
        if (!Array.isArray(examQuestions) || examQuestions.length === 0) throw new Error('آزمون فاقد سوال است');

        let correctAnswers = 0;
        Object.entries(answers).forEach(([qIdx, optIdx]) => {
          const qi = Number(qIdx), oi = Number(optIdx);
          if (qi >= 0 && qi < examQuestions.length && !Number.isNaN(oi)) {
            if (Number(examQuestions[qi].answer) === oi) correctAnswers++;
          }
        });

        const totalQuestions = examQuestions.length;
        const scorePct = totalQuestions ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const maxMarks = Number(exam.total_marks) || 100;
        const obtained = Math.round((scorePct / 100) * maxMarks);

        const examResult = await tx.exam_results.create({
          data: { exam_id: id, student_id: student.id, marks_obtained: obtained, completed_at: new Date() },
          select: { id: true, exam_id: true, student_id: true, marks_obtained: true, status: true, completed_at: true }
        });

        return {
          success: true,
          type: 'quiz',
          examResult,
          summary: { score: obtained, maxScore: maxMarks, percentage: scorePct, correctAnswers, totalQuestions },
          message: 'نتیجه آزمون با موفقیت ثبت شد'
        };
      }

      throw new Error('نوع پاسخ یا داده‌های ارسالی معتبر نیست');
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('🚨 POST /api/exams/student/[examId] error:', error);
    const msg = String(error?.message || '');
    if (/شناسه|نامعتبر/.test(msg)) return NextResponse.json({ success: false, error: msg }, { status: 400 });
    if (/پیدا نشد/.test(msg)) return NextResponse.json({ success: false, error: msg }, { status: 404 });
    if (/دسترسی|توکن|غیرفعال/.test(msg)) return NextResponse.json({ success: false, error: msg }, { status: 403 });
    if (/قبلاً|تکراری/.test(msg)) return NextResponse.json({ success: false, error: msg }, { status: 409 });
    return NextResponse.json({ success: false, error: 'خطا در پردازش درخواست' }, { status: 500 });
  }
}