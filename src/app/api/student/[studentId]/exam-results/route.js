import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, context) {
  try {
    const params = await context.params;
    const inputId = Number(params.studentId);

    console.log('🔍 Input ID received:', inputId);

    // یافتن دانش‌آموز (هم با user_id هم با student.id)
    let student = await prisma.students.findFirst({
      where: {
        OR: [
          { id: inputId },
          { user_id: inputId }
        ]
      },
      include: { 
        users: true 
      }
    });

    if (!student) {
      console.log('❌ Student not found with ID:', inputId);
      return NextResponse.json({ 
        success: false, 
        error: `دانش‌آموز با شناسه ${inputId} یافت نشد`,
        results: []
      });
    }

    console.log('✅ Student found:', student.users.first_name, student.users.last_name, 'student.id:', student.id, 'user_id:', student.user_id);

    // 🔥 جستجو هم با student.id هم با user_id برای اطمینان
    const quizResults = await prisma.exam_results.findMany({
      where: {
        OR: [
          { student_id: student.id },
          { student_id: student.user_id },
          // اگر معلم user_id رو به‌جای student_id ثبت کرده
          { student_id: inputId }
        ]
      },
      include: {
        exams: true,
        students: {
          include: {
            users: true
          }
        }
      },
      orderBy: { completed_at: 'desc' }
    });

    console.log('📊 Quiz results found:', quizResults.length);
    if (quizResults.length > 0) {
      console.log('📋 Quiz results details:', quizResults.map(r => ({
        id: r.id,
        exam_id: r.exam_id,
        student_id: r.student_id,
        marks: r.marks_obtained,
        grade: r.grade_desc
      })));
    }

    // 🔥 جستجو فایل‌ها هم با همه ID ها
    const fileResults = await prisma.exam_file_answers.findMany({
      where: {
        OR: [
          { student_id: student.id },
          { student_id: student.user_id },
          { student_id: inputId }
        ]
      },
      include: {
        exams: true,
        students: {
          include: {
            users: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    console.log('📊 File results found:', fileResults.length);
    if (fileResults.length > 0) {
      console.log('📋 File results details:', fileResults.map(r => ({
        id: r.id,
        exam_id: r.exam_id,
        student_id: r.student_id,
        grade: r.grade_desc,
        feedback: r.teacher_feedback
      })));
    }

    // ترکیب نتایج
    const allResults = [
      ...quizResults.map(result => ({
        id: `quiz_${result.id}`,
        type: 'quiz',
        exam_id: result.exam_id,
        exam: {
          id: result.exams.id,
          title: result.exams.title,
          type: result.exams.type,
          total_marks: Number(result.exams.total_marks || 0)
        },
        marks_obtained: result.marks_obtained ? Number(result.marks_obtained) : null,
        grade_desc: result.grade_desc,
        teacher_feedback: null,
        status: result.status,
        completed_at: result.completed_at,
        created_at: result.created_at
      })),
      ...fileResults.map(result => ({
        id: `file_${result.id}`,
        type: 'file',
        exam_id: result.exam_id,
        exam: {
          id: result.exams.id,
          title: result.exams.title,
          type: result.exams.type,
          total_marks: Number(result.exams.total_marks || 0)
        },
        marks_obtained: null,
        grade_desc: result.grade_desc,
        teacher_feedback: result.teacher_feedback,
        file_url: result.file_url,
        status: result.grade_desc ? 'completed' : 'pending',
        completed_at: result.grade_desc ? result.created_at : null,
        created_at: result.created_at
      }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    console.log('✅ Total results combined:', allResults.length);

    return NextResponse.json({
      success: true,
      results: allResults,
      student: {
        id: student.id,
        user_id: student.user_id,
        name: `${student.users.first_name} ${student.users.last_name}`
      },
      debug: {
        inputId: inputId,
        studentTableId: student.id,
        userTableId: student.user_id,
        quizResults: quizResults.length,
        fileResults: fileResults.length,
        totalResults: allResults.length
      }
    });

  } catch (error) {
    console.error('💥 API ERROR:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message,
      results: []
    });
  }
}