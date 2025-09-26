import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دریافت لیست توبیخی/تشویقی ها
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const type = searchParams.get('type');
    
    let whereClause = {};
    
    if (teacherId) {
      // برای دریافت توبیخی/تشویقی معلم خاص
      const teacher = await prisma.teachers.findFirst({
        where: {
          users: {
            id: parseInt(teacherId)
          }
        }
      });
      
      if (teacher) {
        whereClause.teacher_id = teacher.id;
      } else {
        return NextResponse.json({ 
          success: true, 
          actions: [] 
        });
      }
    }
    
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    const actions = await prisma.disciplinary_actions.findMany({
      where: whereClause,
      include: {
        teachers: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        },
        users: {
          select: {
            first_name: true,
            last_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    
    return NextResponse.json({ success: true, actions });
  } catch (error) {
    console.error('Error fetching disciplinary actions:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در دریافت اطلاعات'
    }, { status: 500 });
  }
}

// ثبت توبیخی/تشویقی جدید
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received data:', body); // برای debug
    
    const {
      teacher_id,
      type,
      severity,
      level,
      title,
      description,
      date,
      author_id
    } = body;
    
    if (!teacher_id || !type || !title || !date) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات ناقص است'
      }, { status: 400 });
    }
    
    // بررسی وجود teacher
    const teacherExists = await prisma.teachers.findUnique({
      where: { id: parseInt(teacher_id) }
    });
    
    if (!teacherExists) {
      return NextResponse.json({
        success: false,
        error: 'معلم یافت نشد'
      }, { status: 404 });
    }
    
    const action = await prisma.disciplinary_actions.create({
      data: {
        teacher_id: parseInt(teacher_id),
        type,
        severity: type === 'warning' ? (severity || 'normal') : 'normal',
        level: type === 'reward' ? (level || 'normal') : 'normal',
        title,
        description: description || null,
        date: new Date(date),
        author_id: author_id ? parseInt(author_id) : null
      },
      include: {
        teachers: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                username: true
              }
            }
          }
        }
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      action,
      message: type === 'reward' ? 'تشویقی ثبت شد' : 'توبیخی ثبت شد'
    });
  } catch (error) {
    console.error('Error creating disciplinary action:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ثبت اطلاعات',
      details: error.message 
    }, { status: 500 });
  }
}

// ویرایش توبیخی/تشویقی
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, title, description, date, severity, level } = body;
    
    if (!id || !title || !date) {
      return NextResponse.json({
        success: false,
        error: 'اطلاعات ناقص است'
      }, { status: 400 });
    }
    
    const action = await prisma.disciplinary_actions.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description: description || null,
        date: new Date(date),
        severity: severity || 'normal',
        level: level || 'normal',
        updated_at: new Date()
      }
    });
    
    return NextResponse.json({ 
      success: true, 
      action,
      message: 'اطلاعات به‌روزرسانی شد'
    });
  } catch (error) {
    console.error('Error updating disciplinary action:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در به‌روزرسانی',
      details: error.message 
    }, { status: 500 });
  }
}

// حذف توبیخی/تشویقی
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'شناسه ارسال نشده'
      }, { status: 400 });
    }
    
    await prisma.disciplinary_actions.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ 
      success: true,
      message: 'با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error deleting disciplinary action:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در حذف',
      details: error.message 
    }, { status: 500 });
  }
}