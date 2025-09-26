import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const exams = await prisma.exams.findMany({ orderBy: { created_at: 'desc' } });
    return NextResponse.json(exams);
  } catch (error) {
    console.error('GET /teacher/exams error:', error);
    return NextResponse.json({ error: 'خطا در دریافت لیست آزمون‌ها' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, type, class_id, pdf_url, image_url, questions, duration_minutes, total_marks } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'عنوان آزمون الزامی است' }, { status: 400 });
    }
    const allowedTypes = ['pdf', 'image', 'quiz'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 });
    }

    // کلاس (اختیاری، اما اگر آمد باید وجود داشته باشد)
    let classIdToSave = null;
    if (class_id !== undefined && class_id !== null && String(class_id).trim() !== '') {
      const classIdNum = Number(class_id);
      if (Number.isNaN(classIdNum) || classIdNum <= 0) {
        return NextResponse.json({ error: 'شناسه کلاس نامعتبر است' }, { status: 400 });
      }
      const cls = await prisma.classes.findUnique({ where: { id: classIdNum } });
      if (!cls) {
        return NextResponse.json({ error: 'کلاس انتخابی در پایگاه‌داده موجود نیست. ابتدا جدول کلاس‌ها را مقداردهی کنید.' }, { status: 400 });
      }
      classIdToSave = classIdNum;
    }

    const pdfUrl = pdf_url ? String(pdf_url).trim() : null;
    const imageUrl = image_url ? String(image_url).trim() : null;
    if (type === 'pdf' && !pdfUrl) return NextResponse.json({ error: 'لطفاً فایل PDF را آپلود کنید' }, { status: 400 });
    if (type === 'image' && !imageUrl) return NextResponse.json({ error: 'لطفاً تصویر آزمون را آپلود کنید' }, { status: 400 });

    let questionsStr = null;
    let computedTotal = 20;
    if (type === 'quiz') {
      if (!Array.isArray(questions) || questions.length === 0) {
        return NextResponse.json({ error: 'برای آزمون تستی، سوالات الزامی است' }, { status: 400 });
      }
      const bad = questions.find(
        q => !q ||
          typeof q.question !== 'string' ||
          !Array.isArray(q.options) || q.options.length < 4 ||
          q.options.some(o => typeof o !== 'string' || !o.trim()) ||
          typeof q.answer !== 'number' || q.answer < 0 || q.answer >= q.options.length
      );
      if (bad) return NextResponse.json({ error: 'ساختار سوالات تستی نامعتبر است' }, { status: 400 });
      questionsStr = JSON.stringify(questions);
      computedTotal = questions.length;
    }

    const duration = duration_minutes != null ? Number(duration_minutes) : 60;
    if (Number.isNaN(duration) || duration <= 0) {
      return NextResponse.json({ error: 'مدت آزمون نامعتبر است' }, { status: 400 });
    }
    const totalMarks = total_marks != null ? String(total_marks) : String(computedTotal);

    const created = await prisma.exams.create({
      data: {
        title: title.trim(),
        type,
        class_id: classIdToSave,
        pdf_url: type === 'pdf' ? pdfUrl : null,
        image_url: type === 'image' ? imageUrl : null,
        questions: type === 'quiz' ? questionsStr : null,
        is_active: true,
        duration_minutes: duration,
        total_marks: totalMarks
      }
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /teacher/exams error:', error);
    return NextResponse.json({ error: 'ثبت آزمون با خطا مواجه شد' }, { status: 500 });
  }
}
