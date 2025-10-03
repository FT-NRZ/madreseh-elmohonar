import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);
    
    if (!payload || !['admin', 'teacher', 'student'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 403 });
    }
    if (payload.role === 'student' && payload.student_id) {
      // چک کن که studentId برابر با student_id کاربر باشه
      if (parseInt(params.studentId) !== payload.student_id) {
        return Response.json({ 
          success: false, 
          error: 'شما فقط می‌توانید کارنامه خود را مشاهده کنید' 
        }, { status: 403 });
      }
    }

    const { studentId } = params;

    // پیدا کردن student_id از جدول students
    const student = await prisma.students.findFirst({
      where: { user_id: parseInt(studentId) }
    });

    if (!student) {
      return NextResponse.json({ success: true, reportCards: [] });
    }

    const reportCards = await prisma.report_cards.findMany({
      where: { student_id: student.id },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, reportCards });

  } catch (error) {
    console.error('Error fetching student report cards:', error);
    return NextResponse.json({ success: false, message: 'خطا در دریافت کارنامه' }, { status: 500 });
  }
}