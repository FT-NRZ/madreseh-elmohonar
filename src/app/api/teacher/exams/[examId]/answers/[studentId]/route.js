import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request, context) {
  try {
    const params = await context.params;
    const examId = Number(params.examId);
    const studentId = Number(params.studentId);

    if (!examId || !studentId || isNaN(examId) || isNaN(studentId)) {
      return NextResponse.json({ error: 'شناسه آزمون یا دانش‌آموز نامعتبر است' }, { status: 400 });
    }

    const quizResult = await prisma.exam_results.findFirst({
      where: { exam_id: examId, student_id: studentId }
    });

    const fileAnswers = await prisma.exam_file_answers.findMany({
      where: { exam_id: examId, student_id: studentId }
    });

    return NextResponse.json({
      quizResult,
      fileAnswers
    });
  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: error.message || 'خطای ناشناخته' }, { status: 500 });
  }
}

export async function POST(request, context) {
  try {
    const params = await context.params;
    const examId = Number(params.examId);
    const studentId = Number(params.studentId);

    console.log('POST Request - examId:', examId, 'studentId:', studentId);

    if (!examId || !studentId || isNaN(examId) || isNaN(studentId)) {
      return NextResponse.json({ error: 'شناسه آزمون یا دانش‌آموز نامعتبر است' }, { status: 400 });
    }

    const exam = await prisma.exams.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json({ error: 'آزمون وجود ندارد' }, { status: 400 });
    }

    console.log('Exam found:', exam.title, 'Type:', exam.type);

    // بررسی وجود دانش‌آموز
    let student = await prisma.students.findUnique({ where: { id: studentId } });
    if (!student) {
      console.log('Creating test student and user...');
      
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.users.create({
          data: {
            first_name: 'دانش‌آموز',
            last_name: 'تست',
            phone: `0912345${studentId}`,
            birth_date: new Date('2010-01-01'),
            address: 'آدرس تست',
            is_active: true
          }
        });

        const student = await tx.students.create({
          data: {
            id: studentId,
            user_id: user.id,
            student_number: `student-${studentId}`,
            class_id: exam.class_id || 1,
            father_name: 'پدر تست',
            mother_name: 'مادر تست',
            parent_phone: `0912345${studentId}`,
            enrollment_date: new Date(),
            status: 'active'
          }
        });

        return { user, student };
      });

      student = result.student;
      console.log('Test student created:', student.id);
    }

    const body = await request.json();
    console.log('Request body:', body);

    // بررسی وجود پاسخ قبلی
    const existingResult = await prisma.exam_results.findFirst({
      where: { exam_id: examId, student_id: studentId }
    });

    if (existingResult) {
      console.log('Student already answered this exam');
      return NextResponse.json({ error: 'شما قبلاً به این آزمون پاسخ داده‌اید' }, { status: 400 });
    }

    // پردازش پاسخ‌های تستی
    if (body.answers) {
      console.log('Processing quiz answers...');
      
      // دریافت سوالات از فیلد questions در جدول exams
      let quizQuestions = [];
      if (exam.questions) {
        try {
          quizQuestions = JSON.parse(exam.questions);
          console.log('Quiz questions parsed:', quizQuestions.length);
        } catch (error) {
          console.error('Error parsing questions JSON:', error);
          return NextResponse.json({ error: 'خطا در پردازش سوالات آزمون' }, { status: 400 });
        }
      }

      if (quizQuestions.length === 0) {
        console.log('No questions found');
        return NextResponse.json({ error: 'سوالات آزمون یافت نشد' }, { status: 400 });
      }

      let answersArray = [];
      if (Array.isArray(body.answers)) {
        answersArray = body.answers;
      } else if (typeof body.answers === 'object') {
        answersArray = Object.entries(body.answers).map(([questionIndex, selectedOptionIndex]) => ({
          questionIndex: parseInt(questionIndex),
          selectedOptionIndex: parseInt(selectedOptionIndex)
        }));
      }

      console.log('Processed answers array:', answersArray);

      let correctCount = 0;
      const processedAnswers = [];

      // پردازش پاسخ‌ها بر اساس داده‌های JSON
      answersArray.forEach((answer) => {
        if (answer.questionIndex >= 0 && answer.questionIndex < quizQuestions.length) {
          const question = quizQuestions[answer.questionIndex];
          const correctAnswerIndex = question.answer; // index پاسخ صحیح
          const isCorrect = answer.selectedOptionIndex === correctAnswerIndex;
          
          if (isCorrect) correctCount++;

          processedAnswers.push({
            questionIndex: answer.questionIndex,
            selectedOptionIndex: answer.selectedOptionIndex,
            correctAnswerIndex: correctAnswerIndex,
            isCorrect: isCorrect,
            questionText: question.question,
            selectedOptionText: question.options[answer.selectedOptionIndex] || 'نامشخص'
          });
        }
      });

      console.log('Final processed answers:', processedAnswers.length, 'Correct:', correctCount);

      if (processedAnswers.length === 0) {
        return NextResponse.json({ error: 'هیچ پاسخ معتبری یافت نشد' }, { status: 400 });
      }

      // ثبت نتیجه آزمون - فقط exam_results
      const examResult = await prisma.exam_results.create({
        data: {
          exam_id: examId,
          student_id: studentId,
          marks_obtained: correctCount,
          status: 'completed',
          completed_at: new Date()
        }
      });

      console.log('Exam result created successfully:', examResult.id);
      
      return NextResponse.json({ 
        success: true, 
        examResult: examResult, 
        totalScore: correctCount,
        totalQuestions: processedAnswers.length,
        details: processedAnswers
      });
    }

    // پردازش پاسخ‌های فایلی
    if (body.file_url) {
      console.log('Processing file answer...');

      const fileAnswer = await prisma.exam_file_answers.create({
        data: {
          exam_id: examId,
          student_id: studentId,
          file_url: body.file_url
        }
      });
      return NextResponse.json({ success: true, fileAnswer, message: 'فایل با موفقیت ارسال شد' });
    }

    console.log('No answers or file_url provided');
    return NextResponse.json({ error: 'داده‌ای برای ثبت ارسال نشده است' }, { status: 400 });

  } catch (error) {
    console.error('API ERROR:', error);
    return NextResponse.json({ error: error.message || 'خطای ناشناخته' }, { status: 500 });
  }
}
