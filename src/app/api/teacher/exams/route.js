import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    console.log('📋 GET /api/teacher/exams called');
    
    const exams = await prisma.exams.findMany({
      include: {
        classes: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('📋 Found exams:', exams.length);
    return NextResponse.json(exams);
  } catch (error) {
    console.error('💥 GET /api/teacher/exams error:', error);
    return NextResponse.json({ error: 'خطا در دریافت لیست آزمون‌ها', detail: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('📥 POST /api/teacher/exams called');
    
    const data = await request.json();
    console.log('📥 Received data:', JSON.stringify(data, null, 2));

    const { title, type, class_id, pdf_url, image_url, questions } = data;

    // بررسی فیلدهای اجباری
    if (!title) {
      console.error('❌ Missing title');
      return NextResponse.json({ error: 'عنوان آزمون الزامی است' }, { status: 400 });
    }
    
    if (!type) {
      console.error('❌ Missing type');
      return NextResponse.json({ error: 'نوع آزمون الزامی است' }, { status: 400 });
    }
    
    if (!class_id) {
      console.error('❌ Missing class_id');
      return NextResponse.json({ error: 'کلاس آزمون الزامی است' }, { status: 400 });
    }

    // تبدیل class_id به عدد
    const classIdNumber = parseInt(class_id);
    if (isNaN(classIdNumber)) {
      console.error('❌ Invalid class_id:', class_id);
      return NextResponse.json({ error: 'شناسه کلاس نامعتبر است' }, { status: 400 });
    }

    console.log('✅ Validation passed, creating exam...');

    let examData = {
      title,
      type,
      class_id: classIdNumber,
      duration_minutes: 60,
      total_marks: 100       
    };

    // اضافه کردن فیلدهای اختیاری بر اساس نوع
    if (type === 'pdf') {
      if (!pdf_url) {
        console.error('❌ Missing pdf_url for PDF exam');
        return NextResponse.json({ error: 'لینک فایل PDF الزامی است' }, { status: 400 });
      }
      examData.pdf_url = pdf_url;
    } else if (type === 'image') {
      if (!image_url) {
        console.error('❌ Missing image_url for image exam');
        return NextResponse.json({ error: 'لینک تصویر آزمون الزامی است' }, { status: 400 });
      }
      examData.image_url = image_url;
    } else if (type === 'quiz') {
      if (!questions || !Array.isArray(questions)) {
        console.error('❌ Missing or invalid questions for quiz exam');
        return NextResponse.json({ error: 'سوالات آزمون الزامی است' }, { status: 400 });
      }
      examData.questions = JSON.stringify(questions);
    } else {
      console.error('❌ Invalid exam type:', type);
      return NextResponse.json({ error: 'نوع آزمون نامعتبر است' }, { status: 400 });
    }

    console.log('📝 Creating exam with data:', JSON.stringify(examData, null, 2));

    const exam = await prisma.exams.create({
      data: examData
    });

    console.log('✅ Exam created successfully:', exam.id);
    return NextResponse.json(exam);

  } catch (error) {
    console.error('💥 POST /api/teacher/exams error:');
    console.error('💥 Error message:', error.message);
    console.error('💥 Error code:', error.code);
    console.error('💥 Error stack:', error.stack);
    
    // بررسی نوع خطا
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'آزمون با این مشخصات قبلاً ثبت شده است' }, { status: 400 });
    } else if (error.code === 'P2003') {
      return NextResponse.json({ error: 'کلاس انتخاب شده موجود نیست' }, { status: 400 });
    } else if (error.code?.startsWith('P')) {
      return NextResponse.json({ error: 'خطای دیتابیس: ' + error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'خطا در ثبت آزمون', 
      detail: error.message 
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'شناسه آزمون الزامی است' }, { status: 400 });
    }

    await prisma.exams.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('خطا در حذف آزمون:', error);
    return NextResponse.json({ error: 'خطا در حذف آزمون' }, { status: 500 });
  }
}