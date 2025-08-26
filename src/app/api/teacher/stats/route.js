import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const nationalCode = searchParams.get('nationalCode');

    console.log('🔍 Looking for teacher with national code:', nationalCode);

    if (!nationalCode) {
      console.error('❌ No nationalCode provided');
      return NextResponse.json({ 
        success: false, 
        error: 'کد ملی ارسال نشده است' 
      }, { status: 400 });
    }

    // پیدا کردن معلم با کوئری ساده مرحله به مرحله
    console.log('🔍 Step 1: Finding entrance...');
    const entrance = await prisma.entrances.findFirst({
      where: {
        national_code: nationalCode,
        role: 'teacher'
      }
    });

    console.log('🔍 Entrance found:', entrance);

    if (!entrance) {
      return NextResponse.json({ 
        success: false, 
        error: 'ورودی معلم یافت نشد',
        teacherId: null 
      }, { status: 404 });
    }

    console.log('🔍 Step 2: Finding user with user_id:', entrance.user_id);
    const user = await prisma.users.findFirst({
      where: {
        id: entrance.user_id
      }
    });

    console.log('🔍 User found:', user);

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'کاربر یافت نشد',
        teacherId: null 
      }, { status: 404 });
    }

    console.log('🔍 Step 3: Finding teacher with user_id:', user.id);
    const teacher = await prisma.teachers.findFirst({
      where: {
        user_id: user.id
      }
    });

    console.log('🔍 Teacher found:', teacher);

    if (!teacher) {
      return NextResponse.json({ 
        success: false, 
        error: 'رکورد معلم یافت نشد',
        teacherId: null 
      }, { status: 404 });
    }

    const teacherId = teacher.id;
    console.log('✅ SUCCESS! Teacher ID:', teacherId);

    // واکشی آمار معلم
    try {
      const classesCount = await prisma.classes.count({
        where: { teacher_id: teacherId }
      });

      const studentCount = await prisma.students.count({
        where: {
          class: {
            teacher_id: teacherId
          }
        }
      });

      const examsCount = await prisma.exams.count({
        where: { teacher_id: teacherId }
      });

      console.log('📊 Stats calculated:', { classes: classesCount, students: studentCount, exams: examsCount });

      return NextResponse.json({
        success: true,
        teacherId: teacherId,
        stats: {
          classes: classesCount,
          students: studentCount,
          exams: examsCount
        }
      });

    } catch (statsError) {
      console.error('⚠️ Error calculating stats:', statsError);
      // حتی اگر آمار نگیریم، teacherId را برگردان
      return NextResponse.json({
        success: true,
        teacherId: teacherId,
        stats: {
          classes: 0,
          students: 0,
          exams: 0
        }
      });
    }

  } catch (error) {
    console.error('💥 Critical error in /api/teacher/stats:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور: ' + error.message,
      teacherId: null
    }, { status: 500 });
  }
}