import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// Logger ایمن که فقط در محیط توسعه لاگ می‌کند و اطلاعات حساس را پنهان می‌کند
const secureLogger = (message, data) => {
  if (process.env.NODE_ENV !== 'production') {
    // در محیط توسعه، داده‌های حساس را مخفی می‌کنیم
    const sanitizedData = data ? JSON.parse(JSON.stringify(data)) : {};
    
    if (sanitizedData.student_id) sanitizedData.student_id = '[HIDDEN]';
    if (sanitizedData.studentId) sanitizedData.studentId = '[HIDDEN]';
    if (sanitizedData.reportCards) {
      sanitizedData.reportCards = `[Array(${sanitizedData.reportCards.length})]`;
    }
    
    console.log(`[DEV-ONLY] ${message}`, sanitizedData);
  }
};

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
        return NextResponse.json({ 
          success: false, 
          message: 'شما فقط می‌توانید کارنامه خود را مشاهده کنید' 
        }, { status: 403 });
      }
    }

    const { studentId } = params;
    secureLogger('Fetching report card for student', { studentId });

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

    secureLogger('Found report cards', { count: reportCards.length });
    
    return NextResponse.json({ success: true, reportCards });

  } catch (error) {
    const errorId = `err_${Date.now().toString(36)}`;
    secureLogger(`Error fetching student report cards [${errorId}]`, { message: error.message });
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در دریافت کارنامه',
      error_id: errorId
    }, { status: 500 });
  }
}