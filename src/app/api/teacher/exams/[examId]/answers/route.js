import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, context) {
  try {
    const { examId } = await context.params;
    const id = Number(examId);
    if (!id || Number.isNaN(id)) {
      return NextResponse.json({ error: 'شناسه آزمون نامعتبر است' }, { status: 400 });
    }

    // احراز هویت معلم
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'احراز هویت لازم است' }, { status: 401 });
    }

    const decoded = verifyJWT(token);
    if (!decoded || decoded.role !== 'teacher') {
      return NextResponse.json({ error: 'دسترسی معلم لازم است' }, { status: 403 });
    }

    // بررسی وجود آزمون
    const exam = await prisma.exams.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        class_id: true,
        teacher_id: true
      }
    });

    if (!exam) {
      return NextResponse.json({ error: 'آزمون پیدا نشد' }, { status: 404 });
    }

    const teacherUserId = Number(decoded.user_id ?? decoded.uid ?? decoded.userId ?? decoded.id ?? decoded.sub);
    const teacher = await prisma.teachers.findUnique({
      where: { user_id: teacherUserId },
      select: { id: true }
    });
    if (!teacher || exam.teacher_id !== teacher.id) {
      return NextResponse.json({ error: 'دسترسی به پاسخ‌های این آزمون مجاز نیست' }, { status: 403 });
    }

    // ✅ دریافت همه پاسخ‌های تستی برای این آزمون
    const quizAnswers = await prisma.exam_results.findMany({
      where: { 
        exam_id: id
      },
      include: {
        students: {
          include: { 
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    // ✅ دریافت همه پاسخ‌های فایلی برای این آزمون  
    const fileAnswers = await prisma.exam_file_answers.findMany({
      where: { 
        exam_id: id
      },
      include: {
        students: {
          include: { 
            users: {
              select: {
                id: true,
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: { id: 'desc' }
    });

    console.log(`📊 Found ${quizAnswers.length} quiz answers and ${fileAnswers.length} file answers for exam ${id}`);

    return NextResponse.json({ 
      success: true,
      quizAnswers, 
      fileAnswers,
      exam: {
        id: exam.id,
        title: exam.title,
        class_id: exam.class_id
      }
    });

  } catch (error) {
    console.error('GET /teacher/exams/[id]/answers error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'خطا در دریافت پاسخ‌ها' 
    }, { status: 500 });
  }
}
