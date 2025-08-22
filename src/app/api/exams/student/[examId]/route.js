import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

// GET: جزئیات آزمون برای دانش‌آموز
export async function GET(request, { params }) {
  try {
    const examId = Number(params.examId);
    if (!examId || isNaN(examId)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }
    const exam = await prisma.exams.findUnique({ 
      where: { id: examId }
    });
    if (!exam) {
      return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });
    }
    let parsedQuestions = null;
    if (exam.questions) {
      try {
        parsedQuestions = JSON.parse(exam.questions);
      } catch (error) {
        console.error('Error parsing questions:', error);
      }
    }
    const examData = {
      ...exam,
      questions: parsedQuestions
    };
    return NextResponse.json({ exam: examData });
  } catch (error) {
    console.error('خطا در دریافت جزئیات آزمون:', error);
    return NextResponse.json({ error: 'خطا در دریافت جزئیات آزمون' }, { status: 500 });
  }
}

// POST: ثبت پاسخ دانش‌آموز
export async function POST(request, { params }) {
  try {
    const examId = Number(params.examId);
    const data = await request.json();
    const { student_id, answers, file_url } = data;

    if (!student_id) {
      return NextResponse.json({ error: 'شناسه دانش‌آموز الزامی است' }, { status: 400 });
    }
    if (!examId || isNaN(examId)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });
    }
    const student = await prisma.students.findUnique({
      where: { id: Number(student_id) }
    });
    if (!student) {
      return NextResponse.json({ error: 'دانش‌آموز پیدا نشد' }, { status: 404 });
    }

    // اگر فایل ارسال شده (PDF یا عکس)
    if (file_url) {
      const existingFileAnswer = await prisma.exam_file_answers.findFirst({
        where: {
          exam_id: examId,
          student_id: Number(student_id)
        }
      });
      if (existingFileAnswer) {
        return NextResponse.json({ 
          success: false, 
          error: 'شما قبلاً پاسخ این آزمون را ارسال کرده‌اید.' 
        }, { status: 400 });
      }
      const answer = await prisma.exam_file_answers.create({
        data: {
          exam_id: examId,
          student_id: Number(student_id),
          file_url: file_url
        }
      });
      return NextResponse.json({ 
        success: true, 
        answer,
        message: 'پاسخ شما با موفقیت ارسال شد'
      });
    }

    // اگر آزمون تستی است (answers)
    if (answers && typeof answers === 'object') {
      const existing = await prisma.exam_results.findFirst({
        where: {
          exam_id: examId,
          student_id: Number(student_id)
        }
      });
      if (existing) {
        return NextResponse.json({ 
          success: false, 
          error: 'شما قبلاً پاسخ این آزمون را ثبت کرده‌اید.' 
        }, { status: 400 });
      }

      // ثبت رکورد در exam_results
      const examResult = await prisma.exam_results.create({
        data: {
          exam_id: examId,
          student_id: Number(student_id),
          marks_obtained: 0,
          status: 'pending',
          attempt_number: 1,
          completed_at: new Date()
        }
      });

      // دریافت سوالات و گزینه‌های واقعی از جداول استاندارد
      const examQuestions = await prisma.exam_questions.findMany({
        where: { exam_id: examId },
        orderBy: { sort_order: 'asc' },
        include: { question_options: { orderBy: { sort_order: 'asc' } } }
      });

      // ثبت پاسخ هر سوال با id واقعی
      const studentAnswersData = Object.entries(answers).map(([qIdx, optIdx]) => {
        const question = examQuestions[Number(qIdx)];
        const option = question?.question_options[Number(optIdx)];
        return {
          result_id: examResult.id,
          question_id: question?.id,
          selected_option_id: option?.id,
          answer_text: null,
          is_correct: option?.is_correct || false,
          marks_awarded: option?.is_correct ? (question?.marks || 1) : 0
        };
      });

      if (studentAnswersData.length > 0) {
        await prisma.student_answers.createMany({
          data: studentAnswersData
        });
        // محاسبه نمره کل
        const totalMarks = studentAnswersData.reduce((sum, answer) => {
          return sum + (answer.marks_awarded || 0);
        }, 0);
        // به‌روزرسانی نمره در exam_results
        await prisma.exam_results.update({
          where: { id: examResult.id },
          data: { 
            marks_obtained: totalMarks,
            status: 'completed'
          }
        });
      }

      return NextResponse.json({ 
        success: true, 
        examResult: {
          ...examResult,
          marks_obtained: studentAnswersData.reduce((sum, answer) => sum + (answer.marks_awarded || 0), 0)
        },
        answersCount: studentAnswersData.length,
        message: 'پاسخ‌های شما با موفقیت ثبت شد'
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'پاسخ معتبری ارسال نشده است. لطفاً answers یا file_url ارسال کنید.' 
    }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ثبت پاسخ آزمون',
      detail: error.message 
    }, { status: 500 });
  }
}