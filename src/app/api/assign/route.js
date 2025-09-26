import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function POST(request) {
  try {
    const { teacherId, studentId } = await request.json();

    if (!teacherId || !studentId) {
      return NextResponse.json(
        { success: false, message: 'teacherId و studentId لازم است' }, 
        { status: 400 }
      );
    }

    // تخصیص دانش‌آموز به معلم
    const assignment = await prisma.student_teacher.create({
      data: {
        teacher_id: Number(teacherId),
        student_id: Number(studentId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'دانش‌آموز با موفقیت به معلم تخصیص داده شد',
      data: {
        id: assignment.id,
        teacherId: assignment.teacher_id,
        studentId: assignment.student_id,
        assignedAt: assignment.assigned_at
      }
    });

  } catch (error) {
    // اگر قبلاً تخصیص داده شده (خطای unique constraint)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'این دانش‌آموز قبلاً به این معلم تخصیص داده شده' },
        { status: 409 }
      );
    }

    console.error('Assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { teacherId, studentId } = await request.json();

    await prisma.student_teacher.deleteMany({
      where: {
        teacher_id: Number(teacherId),
        student_id: Number(studentId)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'تخصیص حذف شد'
    });

  } catch (error) {
    console.error('Remove assignment error:', error);
    return NextResponse.json(
      { success: false, message: 'خطای سرور' },
      { status: 500 }
    );
  }
}
