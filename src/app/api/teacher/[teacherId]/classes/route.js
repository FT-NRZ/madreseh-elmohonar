import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request, { params }) {
  try {
    const { teacherId } = params;
    
    if (!teacherId || isNaN(parseInt(teacherId))) {
      return NextResponse.json({
        success: false,
        message: 'شناسه معلم معتبر نیست',
        classes: [],
        grades: [],
        workshop: null
      }, { status: 400 });
    }

    console.log('دریافت کلاس‌های معلم:', teacherId);

    // پیدا کردن معلم و نوع تدریس
    const teacher = await prisma.teachers.findUnique({
      where: { user_id: parseInt(teacherId) },
      select: { 
        id: true, 
        teaching_type: true, 
        workshop_id: true 
      }
    });

    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: 'معلم یافت نشد',
        classes: [],
        grades: [],
        workshop: null
      }, { status: 404 });
    }

    // 🔥 اگر معلم کارگاه است
    if (teacher.teaching_type === 'workshop') {
      console.log('✅ معلم کارگاه شناسایی شد');
      
      // دریافت همه پایه‌ها
      const grades = await prisma.grades.findMany({
        orderBy: { grade_level: 'asc' }
      });

      // 🔥 دریافت همه کلاس‌های همه پایه‌ها
      const allClasses = await prisma.classes.findMany({
        include: {
          grades: {
            select: {
              id: true,
              grade_name: true,
              grade_level: true
            }
          }
        },
        orderBy: {
          grades: {
            grade_level: 'asc'
          }
        }
      });

      const formattedClasses = allClasses.map(cls => ({
        id: cls.id,
        class_name: cls.class_name,
        grade_id: cls.grade_id,
        grade_name: cls.grades?.grade_name || 'نامشخص',
        grade_level: cls.grades?.grade_level || 0,
        teacher_id: cls.teacher_id,
        capacity: cls.capacity,
        description: cls.description,
        created_at: cls.created_at
      }));

      // دریافت اطلاعات کارگاه
      let workshop = null;
      if (teacher.workshop_id) {
        workshop = await prisma.workshops.findUnique({
          where: { id: teacher.workshop_id }
        });
      }

      console.log(`✅ پایه‌ها: ${grades.length}, کلاس‌ها: ${formattedClasses.length}, کارگاه: ${workshop ? workshop.title : 'ندارد'}`);

      return NextResponse.json({
        success: true,
        classes: formattedClasses, // 🔥 حالا همه کلاس‌ها رو برمی‌گردونه
        grades: grades.map(g => ({
          id: g.id,
          grade_name: g.grade_name,
          grade_level: g.grade_level
        })),
        workshop
      });
    }

    // 🔥 اگر معلم عادی است، فقط کلاس‌های خودش
    const classes = await prisma.classes.findMany({
      where: { teacher_id: teacher.id },
      include: {
        grades: {
          select: {
            id: true,
            grade_name: true,
            grade_level: true
          }
        }
      },
      orderBy: {
        grades: {
          grade_level: 'asc'
        }
      }
    });

    console.log(`✅ کلاس‌های عادی: ${classes.length}`);

    const formattedClasses = classes.map(cls => ({
      id: cls.id,
      class_name: cls.class_name,
      grade_id: cls.grade_id,
      grade_name: cls.grades?.grade_name || 'نامشخص',
      grade_level: cls.grades?.grade_level || 0,
      teacher_id: cls.teacher_id,
      capacity: cls.capacity,
      description: cls.description,
      created_at: cls.created_at
    }));

    return NextResponse.json({
      success: true,
      classes: formattedClasses,
      grades: [],
      workshop: null
    });

  } catch (error) {
    console.error('خطا در دریافت کلاس‌های معلم:', error);
    return NextResponse.json({
      success: false,
      message: `خطا در دریافت کلاس‌ها: ${error.message}`,
      classes: [],
      grades: [],
      workshop: null
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}