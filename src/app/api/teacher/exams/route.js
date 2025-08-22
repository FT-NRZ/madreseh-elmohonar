import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// متد GET برای دریافت لیست آزمون‌ها
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const classId = searchParams.get('class_id');
    let where = {};
    if (classId) where.class_id = Number(classId);

    const exams = await prisma.exams.findMany({
      where,
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error('دریافت آزمون‌ها error:', error);
    return NextResponse.json({ error: 'خطا در دریافت آزمون‌ها', detail: error.message }, { status: 500 });
  }
}

// متد POST برای ثبت آزمون جدید
export async function POST(req) {
  try {
    const data = await req.json()
    const { type, title, pdf_url, image_url, questions, class_id } = data

    if (!title || !type) {
      return NextResponse.json({ error: 'عنوان و نوع آزمون الزامی است' }, { status: 400 })
    }
    if (!class_id || isNaN(Number(class_id))) {
      return NextResponse.json({ error: 'کلاس آزمون الزامی است' }, { status: 400 })
    }

    let exam
    if (type === 'pdf') {
      if (!pdf_url) return NextResponse.json({ error: 'فایل PDF الزامی است' }, { status: 400 })
      exam = await prisma.exams.create({
        data: { 
          title, 
          type, 
          pdf_url,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      })
    } else if (type === 'image') {
      if (!image_url) return NextResponse.json({ error: 'تصویر آزمون الزامی است' }, { status: 400 })
      exam = await prisma.exams.create({
        data: { 
          title, 
          type, 
          image_url,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      })
    } else if (type === 'quiz') {
      exam = await prisma.exams.create({
        data: { 
          title, 
          type,
          questions: questions ? JSON.stringify(questions) : undefined,
          class_id: Number(class_id),
          duration_minutes: 60,
          total_marks: 100
        }
      })

      // ثبت سوالات و گزینه‌ها در جداول استاندارد
      if (questions && Array.isArray(questions)) {
        for (let qIdx = 0; qIdx < questions.length; qIdx++) {
          const q = questions[qIdx];
          // ثبت سوال در exam_questions
          const examQuestion = await prisma.exam_questions.create({
            data: {
              exam_id: exam.id,
              question_text: q.question,
              question_type: "multiple_choice",
              marks: 1,
              sort_order: qIdx
            }
          });
          // ثبت گزینه‌ها در question_options
          for (let oIdx = 0; oIdx < q.options.length; oIdx++) {
            await prisma.question_options.create({
              data: {
                question_id: examQuestion.id,
                option_text: q.options[oIdx],
                is_correct: oIdx === q.answer,
                sort_order: oIdx
              }
            });
          }
        }
      }
    } else {
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 })
    }

    return NextResponse.json(exam)
  } catch (error) {
    console.error('ثبت آزمون error:', error?.message, error?.stack)
    return NextResponse.json({ 
      error: 'خطا در ثبت آزمون', 
      detail: error.message 
    }, { status: 500 })
  }
}

// متد DELETE برای حذف آزمون (حذف امن همراه با حذف رکوردهای وابسته)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }
    const examId = Number(id);

    // حذف همه فایل‌های مرتبط
    await prisma.exam_file_answers.deleteMany({ where: { exam_id: examId } });
    // حذف همه نتایج دانش‌آموزان و پاسخ‌های تستی مرتبط
    const results = await prisma.exam_results.findMany({ where: { exam_id: examId } });
    for (const result of results) {
      await prisma.student_answers.deleteMany({ where: { result_id: result.id } });
    }
    await prisma.exam_results.deleteMany({ where: { exam_id: examId } });

    // حذف همه سوالات و گزینه‌های تستی مرتبط
    const questions = await prisma.exam_questions.findMany({ where: { exam_id: examId } });
    for (const q of questions) {
      await prisma.question_options.deleteMany({ where: { question_id: q.id } });
    }
    await prisma.exam_questions.deleteMany({ where: { exam_id: examId } });

    // حذف خود آزمون
    await prisma.exams.delete({ where: { id: examId } });

    return NextResponse.json({ success: true, message: 'آزمون با موفقیت حذف شد' });
  } catch (error) {
    console.error('حذف آزمون error:', error);
    return NextResponse.json({ error: 'خطا در حذف آزمون', detail: error.message }, { status: 500 });
  }
}