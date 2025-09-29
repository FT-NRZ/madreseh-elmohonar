import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { teacherId } = params;
    
    if (!teacherId) {
      return NextResponse.json({ 
        success: false, 
        error: 'teacherId الزامی است',
        classes: [] 
      }, { status: 400 });
    }

    const classes = await prisma.classes.findMany({
      where: { teacher_id: Number(teacherId) },
      include: {
        grades: {
          select: {
            grade_name: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true,
      classes: classes.map(cls => ({
        id: cls.id,
        class_name: cls.class_name,
        grade_name: cls.grades?.grade_name || 'نامشخص',
        teacher_id: cls.teacher_id
      }))
    });

  } catch (error) {
    console.error('GET /api/teacher/[teacherId]/classes error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'خطا در دریافت کلاس‌ها',
      classes: []
    }, { status: 500 });
  }
}