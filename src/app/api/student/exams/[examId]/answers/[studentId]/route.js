import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database'
import { verifyJWT } from '@/lib/jwt';


export async function GET(request, { params }) {
  try {
    const examId = Number(params.examId);
    const inputStudentId = Number(params.studentId);
    
    console.log('🔍 Getting exam details for examId:', examId, 'inputStudentId:', inputStudentId);

    // احراز هویت
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
    }

    // پیدا کردن student_id واقعی (چون ممکن است user_id پاس شده باشد)
    let student = await prisma.students.findUnique({
      where: { id: inputStudentId }
    });

    if (!student) {
      student = await prisma.students.findUnique({
        where: { user_id: inputStudentId }
      });
    }

    if (!student) {
      return NextResponse.json({
        success: false,
        error: 'دانش‌آموز یافت نشد'
      }, { status: 404 });
    }

    const actualStudentId = student.id;
    console.log('✅ Actual student_id:', actualStudentId);

    // بررسی وجود آزمون
    const exam = await prisma.exams.findUnique({
      where: { id: examId }
    });

    if (!exam) {
      return NextResponse.json({
        success: false,
        error: 'آزمون یافت نشد'
      }, { status: 404 });
    }

    // دریافت نتیجه تستی
    const quizResult = await prisma.exam_results.findFirst({
      where: {
        exam_id: examId,
        student_id: actualStudentId
      },
      include: {
        student_answers: {
          include: {
            exam_questions: {
              include: {
                question_options: true
              }
            },
            question_options: true
          },
          orderBy: {
            question_id: 'asc'
          }
        }
      }
    });

    // دریافت پاسخ‌های فایلی
    const fileAnswers = await prisma.exam_file_answers.findMany({
      where: {
        exam_id: examId,
        student_id: actualStudentId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // پردازش پاسخ‌های تستی
    let processedQuizResult = null;
    if (quizResult) {
      processedQuizResult = {
        id: quizResult.id,
        marks_obtained: quizResult.marks_obtained ? Number(quizResult.marks_obtained) : null,
        grade_desc: quizResult.grade_desc,
        status: quizResult.status,
        completed_at: quizResult.completed_at,
        student_answers: quizResult.student_answers.map(answer => {
          const correctOption = answer.exam_questions.question_options.find(opt => opt.is_correct);
          
          return {
            id: answer.id,
            question_id: answer.question_id,
            selected_option_id: answer.selected_option_id,
            answer_text: answer.answer_text,
            is_correct: answer.is_correct,
            marks_awarded: Number(answer.marks_awarded || 0),
            exam_questions: {
              id: answer.exam_questions.id,
              question_text: answer.exam_questions.question_text,
              question_type: answer.exam_questions.question_type,
              marks: Number(answer.exam_questions.marks)
            },
            question_options: answer.question_options ? {
              id: answer.question_options.id,
              option_text: answer.question_options.option_text,
              is_correct: answer.question_options.is_correct
            } : null,
            correct_option: correctOption ? {
              id: correctOption.id,
              option_text: correctOption.option_text,
              is_correct: correctOption.is_correct
            } : null
          };
        })
      };
    }

    console.log('✅ Found data:', {
      exam: exam.title,
      quizResult: !!quizResult,
      studentAnswers: quizResult?.student_answers?.length || 0,
      fileAnswers: fileAnswers.length
    });

    return NextResponse.json({
      success: true,
      exam: {
        id: exam.id,
        title: exam.title,
        type: exam.type,
        description: exam.description,
        total_marks: Number(exam.total_marks || 0),
        duration_minutes: exam.duration_minutes
      },
      quizResult: processedQuizResult,
      fileAnswers: fileAnswers.map(fa => ({
        id: fa.id,
        file_url: fa.file_url,
        grade_desc: fa.grade_desc,
        teacher_feedback: fa.teacher_feedback,
        created_at: fa.created_at
      }))
    });

  } catch (error) {
    console.error('💥 Error fetching exam details:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'خطا در دریافت جزئیات آزمون'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}