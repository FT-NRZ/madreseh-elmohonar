import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

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

    console.log('Received data:', { student_id, subjects, semester, academic_year });

    if (!student_id || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'اطلاعات ناقص یا نامعتبر است' 
      }, { status: 400 });
    }

    // پیدا کردن student_id از جدول students
    const student = await prisma.students.findFirst({
      where: { user_id: parseInt(student_id) }
    });

    if (!student) {
      return NextResponse.json({ 
        success: false, 
        message: 'دانش‌آموز یافت نشد' 
      }, { status: 404 });
    }

    console.log('Found student:', student);

    // ثبت کارنامه‌ها یکی یکی
    const reportCards = [];
    for (const subject of subjects) {
      const reportCard = await prisma.report_cards.create({
        data: {
          student_id: student.id,
          subject: subject.name,
          grade: subject.grade,
          semester: semester || 'first',
          academic_year: academic_year || new Date().getFullYear().toString(),
          teacher_id: null
        }
      });
      reportCards.push(reportCard);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'کارنامه با موفقیت ثبت شد',
      data: reportCards
    });

  } catch (error) {
    console.error('Error creating report card:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ثبت کارنامه: ' + error.message
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
    console.error('Error deleting report card entry:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف درس' }, { status: 500 });
  }
}

// ویرایش یک درس از کارنامه
export async function PUT(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);

    if (!payload || !['admin', 'teacher'].includes(payload.role)) {
      return Response.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const body = await request.json();
    const { id, subject, grade } = body;

    console.log('PUT data received:', { id, subject, grade, subjectLength: subject?.length, gradeLength: grade?.length });

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
    console.error('Error updating report card entry:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در ویرایش درس: ' + error.message 
    }, { status: 500 });
  }
}