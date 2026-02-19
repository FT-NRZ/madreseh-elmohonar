export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)access_token=([^;]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

// دریافت لیست کلاس‌ها
export async function GET(request) {
  try {
    console.log('🔍 دریافت لیست کلاس‌ها از elmohonar...');

    const dbInfo = await prisma.$queryRaw`SELECT current_database() AS db`;
    console.log('🗄️ کلاس‌ها از دیتابیس:', dbInfo[0]?.db);

    // ابتدا شمارش ساده
    const countResult = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM classes`;
    console.log('📊 تعداد کل کلاس‌ها:', countResult[0]?.total);

    if (countResult[0]?.total === 0) {
      return NextResponse.json({
        success: true,
        classes: [],
        message: 'هیچ کلاسی ثبت نشده است',
        total: 0,
        database: dbInfo[0]?.db
      });
    }

    // سپس join با grades
    const classesWithGrades = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.class_name,
        c.class_number,
        c.grade_id,
        c.teacher_id,
        c.capacity,
        c.description,
        c.academic_year,
        c.created_at,
        c.updated_at,
        g.grade_name,
        g.grade_level
      FROM classes c
      LEFT JOIN grades g ON c.grade_id = g.id
      ORDER BY g.grade_level ASC, c.class_number ASC
    `;

    console.log('✅ کلاس‌ها با Join:', classesWithGrades.length);
    if (classesWithGrades.length > 0) {
      console.log('📄 نمونه کلاس:', classesWithGrades[0]);
    }

    return NextResponse.json({
      success: true,
      classes: classesWithGrades.map(c => ({
        id: c.id,
        class_name: c.class_name || `کلاس ${c.class_number}`,
        class_number: c.class_number,
        grade_id: c.grade_id,
        grade_name: c.grade_name || 'نامشخص',
        grade_level: c.grade_level || 0,
        teacher_id: c.teacher_id,
        teacher_name: null, // فعلاً خالی
        capacity: c.capacity || 30,
        description: c.description,
        academic_year: c.academic_year || '1403-1404',
        created_at: c.created_at,
        updated_at: c.updated_at
      })),
      database: dbInfo[0]?.db,
      total: classesWithGrades.length
    });

  } catch (err) {
    console.error('❌ خطا در دریافت کلاس‌ها:', err);
    return NextResponse.json({ 
      success: false, 
      classes: [], 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}

// افزودن کلاس جدید
export async function POST(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body = await request.json();
    console.log('📝 ایجاد کلاس جدید:', body);

    const { class_name, class_number, grade_id, teacher_id, capacity, description, academic_year } = body;

    // اعتبارسنجی
    if (!class_name || !class_number || !grade_id || !capacity || !academic_year) {
      return NextResponse.json({ 
        success: false, 
        message: 'فیلدهای اجباری را پر کنید' 
      }, { status: 400 });
    }

    // بررسی تکراری نبودن
    const existingClass = await prisma.classes.findFirst({
      where: {
        grade_id: parseInt(grade_id),
        class_number: class_number,
        academic_year: academic_year
      }
    });

    if (existingClass) {
      return NextResponse.json({ 
        success: false, 
        message: 'کلاس با این مشخصات قبلاً ثبت شده است' 
      }, { status: 400 });
    }

    const newClass = await prisma.classes.create({
      data: {
        class_name,
        class_number,
        grade_id: parseInt(grade_id),
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
        capacity: parseInt(capacity),
        description: description || null,
        academic_year,
        created_at: new Date(),
        updated_at: new Date()
      },
      include: {
        grades: { select: { grade_name: true } }
      }
    });

    console.log('✅ کلاس جدید ایجاد شد:', newClass.class_name);

    return NextResponse.json({
      success: true,
      message: 'کلاس با موفقیت ایجاد شد',
      class: newClass
    });

  } catch (err) {
    console.error('❌ خطا در ایجاد کلاس:', err);
    return NextResponse.json({ 
      success: false, 
      message: err.message 
    }, { status: 500 });
  }
}

// ویرایش کلاس
export async function PUT(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body = await request.json();
    console.log('📝 ویرایش کلاس:', body);

    const { id, class_name, class_number, grade_id, teacher_id, capacity, description, academic_year } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه کلاس الزامی است' 
      }, { status: 400 });
    }

    const updatedClass = await prisma.classes.update({
      where: { id: parseInt(id) },
      data: {
        class_name,
        class_number,
        grade_id: parseInt(grade_id),
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
        capacity: parseInt(capacity),
        description: description || null,
        academic_year,
        updated_at: new Date()
      },
      include: {
        grades: { select: { grade_name: true } }
      }
    });

    console.log('✅ کلاس ویرایش شد:', updatedClass.class_name);

    return NextResponse.json({
      success: true,
      message: 'کلاس با موفقیت ویرایش شد',
      class: updatedClass
    });

  } catch (err) {
    console.error('❌ خطا در ویرایش کلاس:', err);
    return NextResponse.json({ 
      success: false, 
      message: err.message 
    }, { status: 500 });
  }
}

// حذف کلاس
export async function DELETE(request) {
  try {
    const token = getToken(request);
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه کلاس الزامی است' 
      }, { status: 400 });
    }

    // بررسی وجود دانش‌آموز در کلاس
    const studentsCount = await prisma.students.count({
      where: { class_id: parseInt(id) }
    });

    if (studentsCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `نمی‌توان کلاس را حذف کرد. ${studentsCount} دانش‌آموز در این کلاس ثبت شده است` 
      }, { status: 400 });
    }

    await prisma.classes.delete({
      where: { id: parseInt(id) }
    });

    console.log('🗑️ کلاس حذف شد:', id);

    return NextResponse.json({
      success: true,
      message: 'کلاس با موفقیت حذف شد'
    });

  } catch (err) {
    console.error('❌ خطا در حذف کلاس:', err);
    return NextResponse.json({ 
      success: false, 
      message: err.message 
    }, { status: 500 });
  }
}