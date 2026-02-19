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
    const body = await req.json();
    const { title, type, grade_id, pdf_url, image_url, questions, duration_minutes, total_marks } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'عنوان آزمون الزامی است' }, { status: 400 });
    }
    const allowedTypes = ['pdf', 'image', 'quiz'];
    if (!type || !allowedTypes.includes(type)) {
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 });
    }

    // اعتبارسنجی پایه
    const gradeIdNum = Number(grade_id);
    if (Number.isNaN(gradeIdNum) || gradeIdNum <= 0) {
      return NextResponse.json({ error: 'انتخاب پایه الزامی است' }, { status: 400 });
    }
    const gradeObj = await prisma.grades.findUnique({ where: { id: gradeIdNum } });
    if (!gradeObj) {
      return NextResponse.json({ error: 'پایه انتخابی در پایگاه‌داده موجود نیست.' }, { status: 400 });
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
      questionsStr = JSON.stringify(questions);
      computedTotal = questions.length;
    }

    const duration = duration_minutes != null ? Number(duration_minutes) : 60;
    const totalMarks = total_marks != null ? String(total_marks) : String(computedTotal);

    const examData = {
      title: title?.trim(),
      type,
      grade_id: gradeIdNum, // فقط پایه ذخیره شود
      pdf_url: pdfUrl,
      image_url: imageUrl,
      questions: questionsStr,
      is_active: true,
      duration_minutes: duration,
      total_marks: totalMarks
    };

    const created = await prisma.exams.create({ data: examData });

    return NextResponse.json({ success: true, exam: created }, { status: 201 });
  } catch (error) {
    console.error('POST /teacher/exams error:', error);
    return NextResponse.json({ error: error.message || 'ثبت آزمون با خطا مواجه شد' }, { status: 500 });
  }
}