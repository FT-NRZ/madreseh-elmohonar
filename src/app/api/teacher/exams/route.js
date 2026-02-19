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
function extractHeaderUserId(request) {
  const raw = request.headers.get('x-user-id') || request.headers.get('x-userid') || request.headers.get('x-uid');
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}
function safeVerify(token) {
  try { return verifyJWT(token); } catch { return null; }
}
function resolveUserId(payload) {
  return Number(payload?.user_id ?? payload?.userId ?? payload?.id ?? payload?.sub);
}
async function getTeacherByUser(userIdOrTeacherId) {
  const idNum = Number(userIdOrTeacherId);
  if (!idNum || Number.isNaN(idNum)) return null;
  return prisma.teachers.findFirst({
    where: {
      OR: [
        { user_id: idNum }, // token carries user_id
        { id: idNum }       // or direct teacher id
      ]
    },
    select: { id: true }
  });
}

// GET
export async function GET(request) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    let userId = resolveUserId(payload);
    if (!userId || Number.isNaN(userId)) {
      userId = extractHeaderUserId(request); // ← fallback از هدر
    }
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const teacher = await getTeacherByUser(userId);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });
    }

    const exams = await prisma.exams.findMany({
      where: { teacher_id: teacher.id },
      include: {
        classes: {
          include: {
            grades: { select: { id: true, grade_name: true, grade_level: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    const mapped = exams.map(exam => ({
      id: exam.id,
      title: exam.title,
      type: exam.type,
      description: exam.description,
      pdf_url: exam.pdf_url,
      image_url: exam.image_url,
      questions: exam.questions,
      is_active: exam.is_active,
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks,
      created_at: exam.created_at,
      class_id: exam.class_id,
      grade_id: exam.classes?.grade_id ?? null,
      grade_name: exam.classes?.grades?.grade_name ?? null,
      grade_level: exam.classes?.grades?.grade_level ?? null
    }));

    return NextResponse.json({ success: true, exams: mapped });
  } catch (error) {
    console.error('❌ GET /teacher/exams error:', error);
    return NextResponse.json({ success: false, error: 'خطا در دریافت لیست آزمون‌ها' }, { status: 500 });
  }
}

// POST
export async function POST(request) {
  try {
    const token = getToken(request);
    const payload = safeVerify(token);
    if (!payload || payload.role !== 'teacher') {
      return NextResponse.json({ success: false, error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    let userId = resolveUserId(payload);
    if (!userId || Number.isNaN(userId)) {
      userId = extractHeaderUserId(request); // ← fallback از هدر
    }
    if (!userId || Number.isNaN(userId)) {
      return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const teacher = await getTeacherByUser(userId);
    if (!teacher) {
      return NextResponse.json({ success: false, error: 'اطلاعات معلم یافت نشد' }, { status: 404 });
    }

    const body = await request.json();
    const { title, type, grade_id, pdf_url, image_url, questions, duration_minutes, total_marks, description, subject } = body || {};

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ success: false, error: 'عنوان آزمون الزامی است' }, { status: 400 });
    }
    const allowedTypes = ['pdf', 'image', 'quiz'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json({ success: false, error: 'نوع آزمون نامعتبر است' }, { status: 400 });
    }

    const gradeIdNum = Number(grade_id);
    if (!gradeIdNum || Number.isNaN(gradeIdNum)) {
      return NextResponse.json({ success: false, error: 'انتخاب پایه الزامی است' }, { status: 400 });
    }

    // find or create class for grade
    let targetClass = await prisma.classes.findFirst({
      where: { grade_id: gradeIdNum },
      include: { grades: { select: { id: true, grade_name: true } } }
    });

    if (!targetClass) {
      const grade = await prisma.grades.findUnique({
        where: { id: gradeIdNum },
        select: { id: true, grade_name: true }
      });
      if (!grade) {
        return NextResponse.json({ success: false, error: 'پایه انتخابی موجود نیست' }, { status: 400 });
      }
      targetClass = await prisma.classes.create({
        data: {
          grade_id: gradeIdNum,
          class_name: grade.grade_name,
          class_number: '1',
          academic_year: '1403-1404',
          capacity: 30,
          teacher_id: teacher.id,
          created_at: new Date(),
          updated_at: new Date()
        },
        include: { grades: { select: { id: true, grade_name: true } } }
      });
    } else if (!targetClass.teacher_id) {
      await prisma.classes.update({
        where: { id: targetClass.id },
        data: { teacher_id: teacher.id }
      });
    }

    const pdfUrl = pdf_url ? String(pdf_url).trim() : null;
    const imageUrl = image_url ? String(image_url).trim() : null;

    if (type === 'pdf' && !pdfUrl) {
      return NextResponse.json({ success: false, error: 'فایل PDF الزامی است' }, { status: 400 });
    }
    if (type === 'image' && !imageUrl) {
      return NextResponse.json({ success: false, error: 'تصویر آزمون الزامی است' }, { status: 400 });
    }

    let questionsStr = null;
    let computedTotal = 20;
    if (type === 'quiz') {
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ success: false, error: 'برای آزمون تستی، سوالات الزامی است' }, { status: 400 });
      }
      questionsStr = JSON.stringify(questions);
      computedTotal = questions.length;
    }

    const duration = duration_minutes != null ? Number(duration_minutes) : 60;
    const totalMarks = total_marks != null ? String(total_marks) : String(computedTotal);

    const created = await prisma.exams.create({
      data: {
        title: title.trim(),
        type,
        class_id: targetClass.id,
        teacher_id: teacher.id,
        pdf_url: pdfUrl,
        image_url: imageUrl,
        questions: questionsStr,
        description: description ?? null,
        subject: subject ?? null,
        is_active: true,
        duration_minutes: duration,
        total_marks: totalMarks,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        classes: { include: { grades: { select: { id: true, grade_name: true, grade_level: true } } } }
      }
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: created.id,
        title: created.title,
        type: created.type,
        description: created.description,
        pdf_url: created.pdf_url,
        image_url: created.image_url,
        is_active: created.is_active,
        duration_minutes: created.duration_minutes,
        total_marks: created.total_marks,
        created_at: created.created_at,
        class_id: created.class_id,
        grade_id: created.classes?.grade_id ?? null,
        grade_name: created.classes?.grades?.grade_name ?? null,
        grade_level: created.classes?.grades?.grade_level ?? null
      },
      message: `آزمون "${created.title}" ثبت شد`
    }, { status: 201 });
  } catch (error) {
    console.error('❌ POST /teacher/exams error:', error);
    return NextResponse.json({ success: false, error: error.message || 'ثبت آزمون با خطا مواجه شد' }, { status: 500 });
  }
}