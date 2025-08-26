import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  try {
    console.log('📋 Fetching grades from database...');
    
    // دریافت تمام پایه‌ها از جدول grades
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' } // مرتب‌سازی بر اساس grade_level
    });

    console.log('📋 Found grades:', grades.length, grades);

    return NextResponse.json({ 
      success: true, 
      grades: grades 
    });
  } catch (error) {
    console.error('💥 Error fetching grades:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در دریافت پایه‌ها',
      error: error.message 
    }, { status: 500 });
  }
}