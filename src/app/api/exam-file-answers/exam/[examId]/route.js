import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    console.log('📚 Fetching classes/grades...');
    
    // دریافت کلاس‌ها از دیتابیس
    const classes = await prisma.classes.findMany({
      orderBy: { id: 'asc' },
      select: {
        id: true,
        class_name: true,
        grade_id: true,
        grades: {
          select: {
            grade_name: true
          }
        }
      }
    });

    console.log('✅ Found classes:', classes.length);

    // اگر کلاس‌ها وجود نداشتند، کلاس‌های پیش‌فرض ایجاد کن
    if (classes.length === 0) {
      console.log('🔧 Creating default classes...');
      
      // ابتدا grades پیش‌فرض ایجاد کن
      const defaultGrades = [
        { id: 1, grade_name: 'اول' },
        { id: 2, grade_name: 'دوم' },
        { id: 3, grade_name: 'سوم' },
        { id: 4, grade_name: 'چهارم' }
      ];

      for (const grade of defaultGrades) {
        await prisma.grades.upsert({
          where: { id: grade.id },
          update: {},
          create: grade
        });
      }

      // سپس کلاس‌ها ایجاد کن
      const defaultClasses = [
        { id: 1, class_name: 'کلاس اول الف', grade_id: 1 },
        { id: 2, class_name: 'کلاس دوم الف', grade_id: 2 },
        { id: 3, class_name: 'کلاس سوم الف', grade_id: 3 },
        { id: 4, class_name: 'کلاس چهارم الف', grade_id: 4 }
      ];

      for (const cls of defaultClasses) {
        await prisma.classes.create({
          data: cls
        });
      }

      // دوباره کلاس‌ها را دریافت کن
      const newClasses = await prisma.classes.findMany({
        orderBy: { id: 'asc' },
        select: {
          id: true,
          class_name: true,
          grade_id: true,
          grades: {
            select: {
              grade_name: true
            }
          }
        }
      });

      return NextResponse.json(newClasses);
    }

    return NextResponse.json(classes);

  } catch (error) {
    console.error('💥 Error fetching classes:', error);
    return NextResponse.json({
      error: error.message || 'خطا در دریافت کلاس‌ها'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}