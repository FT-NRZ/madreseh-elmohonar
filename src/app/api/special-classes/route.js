import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request) {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');
    const teacherId = searchParams.get('teacher_id');
    const gradeId = searchParams.get('grade_id');
    let where = {};

    if (gradeId) {
      // دریافت کلاس‌های این پایه
      const gradeClasses = await prisma.classes.findMany({
        where: { grade_id: parseInt(gradeId) },
        select: { id: true }
      });
      const classIds = gradeClasses.map(c => c.id);
      where.class_id = { in: classIds };
    } else if (teacherId) {
      // واکشی کلاس‌های معلم
      const teacherClasses = await prisma.classes.findMany({
        where: { teacher_id: parseInt(teacherId) },
        select: { id: true }
      });
      const classIds = teacherClasses.map(c => c.id);
      where.class_id = { in: classIds };
    } else if (classId) {
      where.class_id = parseInt(classId);
    }

    const items = await prisma.special_classes.findMany({
      where,
      include: {
        classes: {
          include: {
            grades: {
              select: {
                id: true,
                grade_name: true
              }
            }
          }
        }
      },
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
    });

    // فرمت کردن داده‌ها برای خروجی
    const formattedItems = items.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      class_id: item.class_id,
      class_name: item.classes?.class_name || 'نامشخص',
      grade_id: item.classes?.grades?.id || null,
      grade_name: item.classes?.grades?.grade_name || 'نامشخص',
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      room_number: item.room_number || null
    }));

    return NextResponse.json({ 
      success: true, 
      items: formattedItems,
      total: formattedItems.length
    });

  } catch (error) {
    console.error('GET special-classes error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'خطا در دریافت کلاس‌های فوق‌العاده',
      items: []
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));
    
    const body = await request.json();
    console.log('POST body:', body);

    const { title, description, class_id, day_of_week, start_time, end_time, room_number } = body;
    
    // اعتبارسنجی ورودی‌ها
    if (!title || !day_of_week || !start_time || !end_time) {
      return NextResponse.json({ 
        success: false, 
        message: 'فیلدهای عنوان، روز هفته، ساعت شروع و پایان الزامی هستند' 
      }, { status: 400 });
    }

    // بررسی وجود کلاس در صورت ارسال class_id
    if (class_id) {
      const classExists = await prisma.classes.findUnique({
        where: { id: parseInt(class_id) }
      });
      if (!classExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'کلاس مورد نظر یافت نشد' 
        }, { status: 404 });
      }
    }

    const created = await prisma.special_classes.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        class_id: class_id ? parseInt(class_id) : null,
        day_of_week: day_of_week.toLowerCase(),
        start_time: start_time,
        end_time: end_time,
        room_number: room_number?.trim() || null
      },
      include: {
        classes: {
          include: {
            grades: {
              select: {
                id: true,
                grade_name: true
              }
            }
          }
        }
      }
    });

    // فرمت کردن داده خروجی
    const formattedCreated = {
      id: created.id,
      title: created.title,
      description: created.description,
      class_id: created.class_id,
      class_name: created.classes?.class_name || null,
      grade_id: created.classes?.grades?.id || null,
      grade_name: created.classes?.grades?.grade_name || null,
      day_of_week: created.day_of_week,
      start_time: created.start_time,
      end_time: created.end_time,
      room_number: created.room_number
    };

    return NextResponse.json({ 
      success: true, 
      created: formattedCreated,
      message: 'کلاس فوق‌العاده با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('POST special-classes error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'خطا در ایجاد کلاس فوق‌العاده'
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه معتبر مورد نیاز است' 
      }, { status: 400 });
    }

    // بررسی وجود کلاس فوق‌العاده
    const existingClass = await prisma.special_classes.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingClass) {
      return NextResponse.json({ 
        success: false, 
        message: 'کلاس فوق‌العاده یافت نشد' 
      }, { status: 404 });
    }
    
    await prisma.special_classes.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'کلاس فوق‌العاده با موفقیت حذف شد',
      deleted_id: parseInt(id)
    });

  } catch (error) {
    console.error('DELETE special-classes error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'خطا در حذف کلاس فوق‌العاده'
    }, { status: 500 });
  }
}