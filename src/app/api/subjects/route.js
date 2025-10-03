import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    // اگر جدول subjects نداری، این بخش را با داده ثابت جایگزین کن
    const subjects = [
      { id: 1, subject_name: 'ریاضی' },
      { id: 2, subject_name: 'علوم' },
      { id: 3, subject_name: 'فارسی' },
      { id: 4, subject_name: 'قرآن' },
      { id: 5, subject_name: 'مطالعات اجتماعی' }
    ];
    // اگر جدول داری، این خط را جایگزین کن:
    // const subjects = await prisma.subjects.findMany({ orderBy: { subject_name: 'asc' } });

    return NextResponse.json({
      success: true,
      subjects
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت لیست دروس'
    }, { status: 500 });
  }
}