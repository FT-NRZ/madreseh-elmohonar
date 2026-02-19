import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({
        success: false,
        error: 'شناسه آزمون نامعتبر است'
      }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        questions: true,
        duration_minutes: true,
        total_marks: true,
        created_at: true,
        is_active: true,
        pdf_url: true,
        image_url: true,
        subject: true,
        grade_id: true // تغییر از class_id به grade_id
      }
    });

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: 'آزمون پیدا نشد'
      }, { status: 404 });
    }

    if (!exam.is_active) {
      return NextResponse.json({
        success: false,
        error: 'آزمون غیرفعال است'
      }, { status: 403 });
    }

    let parsedQuestions = null;
    if (exam.questions) {
      try {
        parsedQuestions = JSON.parse(exam.questions);
        if (Array.isArray(parsedQuestions)) {
          parsedQuestions = parsedQuestions.map(q => {
            const { answer, ...questionWithoutAnswer } = q;
            return questionWithoutAnswer;
          });
        }
      } catch {
        parsedQuestions = null;
      }
    }

    return NextResponse.json({
      success: true,
      exam: {
        ...exam,
        questions: parsedQuestions,
        max_marks: exam.total_marks
      }
    });

  } catch (error) {
    console.error('GET /api/exams/student/[examId] error:', error);
    return NextResponse.json({
      success: false,
      error: 'خطا در دریافت جزئیات آزمون'
    }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);

    console.log('🚀 API POST called with examId:', id);

    if (!id || Number.isNaN(id) || id <= 0) {
      return NextResponse.json({
        success: false,
        error: 'شناسه آزمون نامعتبر است'
      }, { status: 400 });
    }

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'توکن احراز هویت الزامی است'
      }, { status: 401 });
    }

    let payload;
    try {
      payload = verifyJWT(token);
      if (!payload) throw new Error('Invalid token');
    } catch {
      return NextResponse.json({
        success: false,
        error: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    const requestBody = await request.json().catch(() => null);
    console.log('📥 Request body received:', requestBody);

    if (!requestBody) {
      return NextResponse.json({
        success: false,
        error: 'داده‌های ارسالی نامعتبر است'
      }, { status: 400 });
    }

    const { student_id, answers, file_url } = requestBody;

    if (!student_id || Number.isNaN(Number(student_id))) {
      return NextResponse.json({
        success: false,
        error: 'شناسه دانش‌آموز الزامی و معتبر است'
      }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        type: true,
        questions: true,
        total_marks: true,
        is_active: true
      }
    });

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: 'آزمون پیدا نشد'
      }, { status: 404 });
    }

    if (!exam.is_active) {
      return NextResponse.json({
        success: false,
        error: 'آزمون غیرفعال است'
      }, { status: 403 });
    }

    // پیدا کردن دانش‌آموز
    let student = await prisma.students.findUnique({
      where: { user_id: Number(student_id) },
      select: { id: true, user_id: true }
    });

    console.log('👤 Student lookup by user_id:', student);

    if (!student) {
      student = await prisma.students.findUnique({
        where: { id: Number(student_id) },
        select: { id: true, user_id: true }
      });
      console.log('👤 Student lookup by id:', student);
    }

    if (!student) {
      console.log('❌ Student not found with either user_id or id:', student_id);
      return NextResponse.json({
        success: false,
        error: 'دانش‌آموز پیدا نشد'
      }, { status: 404 });
    }

    console.log('✅ Student found:', student);

    console.log('🔍 Processing exam submission:', {
      examId: id,
      studentId: student.id,
      examType: exam.type,
      hasAnswers: !!answers,
      hasFileUrl: !!file_url
    });

    const result = await prisma.$transaction(async (tx) => {
      // پردازش فایل
      if (file_url && typeof file_url === 'string' && file_url.trim()) {
        const existingFileAnswer = await tx.exam_file_answers.findFirst({
          where: {
            exam_id: id,
            student_id: student.id
          }
        });

        if (existingFileAnswer) {
          throw new Error('قبلاً پاسخ فایلی برای این آزمون ارسال شده است');
        }

        const fileUrl = String(file_url).trim();
        if (fileUrl.length < 10) {
          throw new Error('آدرس فایل نامعتبر است');
        }

        const fileAnswer = await tx.exam_file_answers.create({
          data: {
            exam_id: id,
            student_id: student.id,
            file_url: fileUrl
          },
          select: {
            id: true,
            exam_id: true,
            student_id: true,
            file_url: true,
            created_at: true
          }
        });

        return {
          success: true,
          type: 'file',
          answer: fileAnswer,
          message: 'پاسخ فایلی با موفقیت ثبت شد'
        };
      }

      // پردازش آزمون تستی
      if (exam.type === 'quiz' && answers && typeof answers === 'object') {
        console.log('🧪 Processing quiz answers:', answers);

        const existingResult = await tx.exam_results.findFirst({
          where: {
            exam_id: id,
            student_id: student.id
          }
        });

        if (existingResult) {
          throw new Error('قبلاً پاسخ این آزمون ثبت شده است');
        }

        let examQuestions = [];
        try {
          examQuestions = exam.questions ? JSON.parse(exam.questions) : [];
        } catch (e) {
          console.error('🚨 Error parsing questions:', e);
          throw new Error('ساختار سوالات آزمون نامعتبر است');
        }

        if (!Array.isArray(examQuestions) || examQuestions.length === 0) {
          throw new Error('آزمون فاقد سوال است');
        }

        if (!answers || Object.keys(answers).length === 0) {
          throw new Error('هیچ پاسخی ارسال نشده است');
        }

        let correctAnswers = 0;
        let totalQuestions = examQuestions.length;

        console.log('📝 Evaluating answers:', {
          totalQuestions,
          submittedAnswers: Object.keys(answers).length,
          examQuestions: examQuestions.map(q => ({ question: q.question?.substring(0, 30), correctAnswer: q.answer }))
        });

        Object.entries(answers).forEach(([questionIndex, selectedOption]) => {
          const qIdx = Number(questionIndex);
          const optIdx = Number(selectedOption);

          if (qIdx >= 0 && qIdx < examQuestions.length && !Number.isNaN(optIdx)) {
            const question = examQuestions[qIdx];
            const correctAnswer = Number(question.answer);
            const isCorrect = correctAnswer === optIdx;

            console.log(`📊 Question ${qIdx}: selected=${optIdx}, correct=${correctAnswer}, isCorrect=${isCorrect}`);

            if (isCorrect) {
              correctAnswers++;
            }
          }
        });

        const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const maxMarks = Number(exam.total_marks) || 100;
        const obtainedMarks = Math.round((scorePercentage / 100) * maxMarks);

        console.log('🎯 Final score calculation:', {
          correctAnswers,
          totalQuestions,
          scorePercentage,
          maxMarks,
          obtainedMarks
        });

        const examResult = await tx.exam_results.create({
          data: {
            exam_id: id,
            student_id: student.id,
            marks_obtained: obtainedMarks,
            // حذف فیلد status اگر مشکل دارد
            // status: 'completed', 
            completed_at: new Date()
          },
          select: {
            id: true,
            exam_id: true,
            student_id: true,
            marks_obtained: true,
            status: true,
            completed_at: true
          }
        });

        console.log('✅ Exam result created:', examResult);

        return {
          success: true,
          type: 'quiz',
          examResult: examResult,
          summary: {
            score: obtainedMarks,
            maxScore: maxMarks,
            percentage: scorePercentage,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions
          },
          message: 'نتیجه آزمون با موفقیت ثبت شد'
        };
      }

      throw new Error('نوع پاسخ یا داده‌های ارسالی معتبر نیست');
    });

    return NextResponse.json(result);

  } catch (error) {
    console.error('🚨 POST /api/exams/student/[examId] error:', error);
    console.error('🚨 Error stack:', error.stack);
   
    if (error.message.includes('شناسه') || error.message.includes('نامعتبر')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    if (error.message.includes('پیدا نشد')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 404 });
    }

    if (error.message.includes('دسترسی') || error.message.includes('توکن') || error.message.includes('غیرفعال')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 403 });
    }

    if (error.message.includes('قبلاً') || error.message.includes('تکراری')) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 409 });
    }

    return NextResponse.json({
      success: false,
      error: 'خطا در پردازش درخواست: ' + error.message
    }, { status: 500 });
  }
}