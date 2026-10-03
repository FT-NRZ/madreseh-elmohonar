import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

// Logger ایمن که فقط در محیط توسعه لاگ می‌کند و اطلاعات حساس را پنهان می‌کند
const secureLogger = (message, data) => {
  if (process.env.NODE_ENV !== 'production') {
    // در محیط توسعه، داده‌های حساس را مخفی می‌کنیم
    const sanitizedData = data ? JSON.parse(JSON.stringify(data)) : {};
    
    if (sanitizedData.student_id) sanitizedData.student_id = '[HIDDEN]';
    if (sanitizedData.subjects) {
      sanitizedData.subjects = `[Array(${sanitizedData.subjects.length})]`;
    }
    
    console.log(`[DEV-ONLY] ${message}`, sanitizedData);
  }
};

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن یافت نشد' 
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);
    
    if (!payload || !['admin'].includes(payload.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { student_id, subjects, semester, academic_year } = body;

    // جایگزینی console.log با logger ایمن
    secureLogger('Received data', { student_id, subjects, semester, academic_year });

    const studentId = Number(student_id);
    if (!Number.isInteger(studentId) || studentId <= 0 || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'اطلاعات ناقص یا نامعتبر است' 
      }, { status: 400 });
    }

    const normalizedSubjects = subjects.map(subject => ({
      name: typeof subject?.name === 'string' ? subject.name.trim() : '',
      grade: typeof subject?.grade === 'string' ? subject.grade.trim() : ''
    }));
    if (normalizedSubjects.some(subject => !subject.name || subject.name.length > 100 || !subject.grade || subject.grade.length > 5)) {
      return NextResponse.json({
        success: false,
        message: 'نام درس یا نمره نامعتبر است'
      }, { status: 400 });
    }

    const semesterValue = String(semester || 'first');
    const academicYearValue = String(academic_year || new Date().getFullYear());
    if (!['first', 'second'].includes(semesterValue) || academicYearValue.length > 10) {
      return NextResponse.json({
        success: false,
        message: 'نیمسال یا سال تحصیلی نامعتبر است'
      }, { status: 400 });
    }

    const subjectNames = normalizedSubjects.map(subject => subject.name);
    if (new Set(subjectNames).size !== subjectNames.length) {
      return NextResponse.json({
        success: false,
        message: 'یک درس در فهرست بیش از یک بار وارد شده است'
      }, { status: 409 });
    }

    // The form normally sends users.id; accept students.id too for older client data.
    let student = await prisma.students.findUnique({
      where: { user_id: studentId },
      select: { id: true }
    });
    if (!student) {
      student = await prisma.students.findUnique({
        where: { id: studentId },
        select: { id: true }
      });
    }

    if (!student) {
      return NextResponse.json({ 
        success: false, 
        message: 'دانش‌آموز یافت نشد' 
      }, { status: 404 });
    }

    // جایگزینی console.log با logger ایمن
    secureLogger('Found student', { id: '[HIDDEN]' });

    const existingReports = await prisma.report_cards.findMany({
      where: {
        student_id: student.id,
        semester: semesterValue,
        academic_year: academicYearValue,
        subject: { in: subjectNames }
      },
      select: { subject: true }
    });

    if (existingReports.length > 0) {
      const existingSubjects = existingReports.map(report => report.subject).join('، ');
      return NextResponse.json({
        success: false,
        message: `برای این دانش‌آموز در این نیمسال و سال، قبلاً برای این درس‌ها کارنامه ثبت شده است: ${existingSubjects}`
      }, { status: 409 });
    }

    const reportCards = await prisma.$transaction(
      normalizedSubjects.map(subject => prisma.report_cards.create({
        data: {
          student_id: student.id,
          subject: subject.name,
          grade: subject.grade,
          semester: semesterValue,
          academic_year: academicYearValue,
          teacher_id: null
        }
      }))
    );

    return NextResponse.json({ 
      success: true, 
      message: 'کارنامه با موفقیت ثبت شد',
      data: reportCards
    });

  } catch (error) {
    if (error?.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'برای یکی از این درس‌ها در این نیمسال و سال، کارنامه‌ای از قبل ثبت شده است'
      }, { status: 409 });
    }

    // لاگ خطا بدون افشای جزئیات حساس
    const errorId = `err_${Date.now().toString(36)}`;
    secureLogger(`Error creating report card [${errorId}]`, { message: error.message });
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ثبت کارنامه',
      error_id: errorId
    }, { status: 500 });
  }
}

// حذف یک درس از کارنامه
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);

    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه مورد نیاز است' }, { status: 400 });
    }

    await prisma.report_cards.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true, message: 'درس با موفقیت حذف شد' });

  } catch (error) {
    const errorId = `err_${Date.now().toString(36)}`;
    secureLogger(`Error deleting report card [${errorId}]`, { message: error.message });
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در حذف درس',
      error_id: errorId
    }, { status: 500 });
  }
}

// ویرایش یک درس از کارنامه
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);

    if (!payload || !['admin', 'teacher'].includes(payload.role)) {
      return NextResponse.json({ success: false, message: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await request.json();
    const { id, subject, grade } = body;

    // جایگزینی console.log با logger ایمن
    secureLogger('PUT data received', { id, subject: subject || '[EMPTY]', grade: grade || '[EMPTY]' });

    if (!id || !subject || !grade) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است' }, { status: 400 });
    }
    
    // بررسی طول مقادیر
    if (subject.length > 100) {
      return NextResponse.json({ success: false, message: 'نام درس خیلی طولانی است (حداکثر 100 کاراکتر)' }, { status: 400 });
    }

    if (grade.length > 5) {
      return NextResponse.json({ success: false, message: 'کد نمره خیلی طولانی است (حداکثر 5 کاراکتر)' }, { status: 400 });
    }

    // گرفتن مقدار فعلی رکورد برای فیلدهای دیگر
    const existingRecord = await prisma.report_cards.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return NextResponse.json({ success: false, message: 'رکورد یافت نشد' }, { status: 404 });
    }

    // فقط subject و grade را آپدیت کن (و اگر updated_at داری، آن را هم)
    const updatedEntry = await prisma.report_cards.update({
      where: { id: parseInt(id) },
      data: {
        subject: subject.trim(),
        grade: grade,
        // اگر updated_at داری:
        ...(existingRecord.updated_at !== undefined && { updated_at: new Date() })
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'درس با موفقیت ویرایش شد', 
      data: updatedEntry 
    });

  } catch (error) {
    const errorId = `err_${Date.now().toString(36)}`;
    secureLogger(`Error updating report card [${errorId}]`, { message: error.message });
    
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ویرایش درس',
      error_id: errorId
    }, { status: 500 });
  }
}