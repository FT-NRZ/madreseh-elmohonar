import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const gradeId = searchParams.get('gradeId');
    const type = searchParams.get('type');
    
    console.log('Fetching reminders for student:', { studentId, gradeId, type });
    
    if (!studentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه دانش‌آموز مورد نیاز است' 
      }, { status: 400 });
    }
    
    // شرایط برای دریافت یادآوری‌ها بر اساس schema واقعی
    const whereConditions = {
      OR: [
        // یادآوری‌های عمومی برای همه دانش‌آموزان
        { target_type: 'all_students' },
        
        // یادآوری‌های مخصوص دانش‌آموز خاص (استفاده از target_student_id که در schema موجود است)
        { 
          target_type: 'specific_student', 
          target_student_id: parseInt(studentId)
        }
      ]
    };
    
    // اگر gradeId موجود باشد، یادآوری‌های مخصوص پایه را نیز اضافه کن
    if (gradeId && gradeId !== 'null' && gradeId !== 'undefined' && gradeId !== '') {
      whereConditions.OR.push({
        target_type: 'grade',  // استفاده از grade که در schema موجود است
        target_grade_id: parseInt(gradeId)
      });
    }
    
    console.log('Where conditions:', JSON.stringify(whereConditions, null, 2));
    
    const reminders = await prisma.teacher_news.findMany({
      where: whereConditions,
      include: {
        users: {
          select: { 
            first_name: true, 
            last_name: true 
          }
        },
        target_grade: {
          select: { 
            id: true,
            grade_name: true 
          }
        },
        target_student: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: [
        { is_important: 'desc' },
        { reminder_date: 'asc' },
        { created_at: 'desc' }
      ]
    });
    
    console.log(`Found ${reminders.length} reminders from teacher_news table`);
    
    return NextResponse.json({ 
      success: true, 
      reminders 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching student reminders:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در دریافت یادآوری‌ها',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}