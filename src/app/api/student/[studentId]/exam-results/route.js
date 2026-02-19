import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, context) {
  try {
    const params = await context.params;
    const studentId = Number(params.studentId);

    console.log('🔍 Received studentId:', studentId);

    // ❌ مشکل اینجاست: studentId ممکن است user_id باشد نه students.id
    // ابتدا بررسی کن که این ID مربوط به کدام جدول است

    // بررسی اینکه آیا این user_id است یا student_id
    let student = await prisma.students.findUnique({
      where: { id: studentId },
      include: { users: true }
    });

    // اگر student پیدا نشد، احتمالاً user_id پاس شده
    if (!student) {
      console.log('❌ Not found by student.id, trying user_id...');
      student = await prisma.students.findUnique({
        where: { user_id: studentId },
        include: { users: true }
      });
    }

    if (!student) {
      console.log('❌ Student not found with ID:', studentId);
      return NextResponse.json({ 
        success: false, 
        error: `دانش‌آموز با شناسه ${studentId} یافت نشد`,
        results: []
      });
    }

    const actualStudentId = student.id; // ID واقعی از جدول students
    console.log('✅ Student found:', student.users.first_name, student.users.last_name, 'actual student_id:', actualStudentId);

    // حالا با student_id واقعی جستجو کن
    const quizResults = await prisma.exam_results.findMany({
      where: { student_id: actualStudentId },
      include: {
        exams: true
      },
      orderBy: { completed_at: 'desc' }
    });
    console.log('📊 Quiz results found:', quizResults.length);

    const fileResults = await prisma.exam_file_answers.findMany({
      where: { student_id: actualStudentId },
      include: {
        exams: true
      },
      orderBy: { created_at: 'desc' }
    });
    console.log('📊 File results found:', fileResults.length);

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
          total_marks: Number(result.exams.total_marks)
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
          total_marks: Number(result.exams.total_marks)
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

    console.log('✅ Total results found:', allResults.length);

    return NextResponse.json({
      success: true,
      results: allResults,
      student: {
        id: student.id,
        user_id: student.user_id,
        name: `${student.users.first_name} ${student.users.last_name}`
      },
      debug: {
        inputStudentId: studentId,
        actualStudentId: actualStudentId,
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