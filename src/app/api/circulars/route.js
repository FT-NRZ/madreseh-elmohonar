import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// محاسبه تاریخ انقضا
function calculateExpiryDate(issueDate, duration) {
  const date = new Date(issueDate);
  switch (duration) {
    case '10_days':
      date.setDate(date.getDate() + 10);
      break;
    case '1_month':
      date.setMonth(date.getMonth() + 1);
      break;
    case '3_months':
      date.setMonth(date.getMonth() + 3);
      break;
    case '6_months':
      date.setMonth(date.getMonth() + 6);
      break;
    default:
      date.setMonth(date.getMonth() + 1);
  }
  return date;
}

// دریافت بخشنامه‌ها
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const teacherId = searchParams.get('teacherId');
    const showExpired = searchParams.get('showExpired') === 'true';

    if (role === 'teacher' && teacherId) {
      // بخشنامه‌های مربوط به معلم
      const currentDate = new Date();
      
      const circulars = await prisma.circulars.findMany({
        where: {
          AND: [
            {
              OR: [
                { target_type: 'all_teachers' },
                { target_teacher_id: parseInt(teacherId) }
              ]
            },
            showExpired ? {} : {
              expiry_date: {
                gte: currentDate
              }
            }
          ]
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          target_teacher: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          circular_reads: {
            where: {
              teacher_id: parseInt(teacherId)
            }
          },
          _count: {
            select: {
              circular_reads: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ]
      });

      // اضافه کردن فلگ خوانده شدن و انقضا
      const circularsWithStatus = circulars.map(circular => ({
        ...circular,
        is_read: circular.circular_reads.length > 0,
        is_expired: circular.expiry_date < currentDate
      }));

      return NextResponse.json({
        success: true,
        circulars: circularsWithStatus
      });
    } else if (role === 'admin') {
      // بخشنامه‌های برای مدیر - همه بخشنامه‌ها
      const currentDate = new Date();
      
      const whereClause = showExpired ? {} : {
        expiry_date: {
          gte: currentDate
        }
      };

      const circulars = await prisma.circulars.findMany({
        where: whereClause,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          target_teacher: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          _count: {
            select: {
              circular_reads: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ]
      });

      // اضافه کردن فلگ انقضا
      const circularsWithStatus = circulars.map(circular => ({
        ...circular,
        is_expired: circular.expiry_date < currentDate
      }));

      return NextResponse.json({
        success: true,
        circulars: circularsWithStatus
      });
    } else {
      // حالت عمومی - فقط بخشنامه‌های فعال و عمومی
      const currentDate = new Date();
      
      const circulars = await prisma.circulars.findMany({
        where: {
          target_type: 'all_teachers',
          expiry_date: {
            gte: currentDate
          }
        },
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true
            }
          },
          _count: {
            select: {
              circular_reads: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { created_at: 'desc' }
        ]
      });

      const circularsWithStatus = circulars.map(circular => ({
        ...circular,
        is_expired: false
      }));

      return NextResponse.json({
        success: true,
        circulars: circularsWithStatus
      });
    }
  } catch (error) {
    console.error('Error fetching circulars:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در دریافت بخشنامه‌ها',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ایجاد بخشنامه جدید
export async function POST(request) {
  try {
    const body = await request.json();
    console.log('POST /api/circulars body:', body);
    
    // بررسی فیلدهای مورد نیاز
    if (!body.title || !body.content) {
      return NextResponse.json({ 
        success: false, 
        error: 'عنوان و محتوای بخشنامه الزامی است' 
      }, { status: 400 });
    }

    // بررسی معلم خاص اگر انتخاب شده
    let targetTeacherId = null;
    if (body.target_type === 'specific_teacher' && body.target_teacher_id) {
      // بررسی وجود معلم در جدول teachers
      const teacherExists = await prisma.teachers.findFirst({
        where: {
          user_id: parseInt(body.target_teacher_id)
        }
      });
      
      if (!teacherExists) {
        return NextResponse.json({ 
          success: false, 
          error: 'معلم انتخاب شده معتبر نیست' 
        }, { status: 400 });
      }
      
      targetTeacherId = parseInt(body.target_teacher_id);
    }

    // بررسی و تنظیم تاریخ صدور
    let issueDate;
    try {
      issueDate = body.issue_date ? new Date(body.issue_date) : new Date();
      if (isNaN(issueDate.getTime())) {
        issueDate = new Date();
      }
    } catch (error) {
      issueDate = new Date();
    }
    
    const expiryDate = calculateExpiryDate(issueDate, body.expiry_duration || '1_month');
    
    const circular = await prisma.circulars.create({
      data: {
        title: body.title,
        content: body.content,
        image_url: body.image_url || null,
        priority: body.priority || 'normal',
        target_type: body.target_type || 'all_teachers',
        target_teacher_id: targetTeacherId,
        issue_date: issueDate,
        expiry_duration: body.expiry_duration || '1_month',
        expiry_date: expiryDate,
        is_read_required: Boolean(body.is_read_required),
        author_id: body.author_id ? parseInt(body.author_id) : null,
        circular_number: body.circular_number || null,
        department: body.department || null,
      },
    });
    
    return NextResponse.json({ success: true, circular }, { status: 201 });
  } catch (error) {
    console.error('Error creating circular:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ثبت بخشنامه',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ویرایش بخشنامه
export async function PUT(request) {
  try {
    const body = await request.json();
    
    const expiryDate = calculateExpiryDate(body.issue_date, body.expiry_duration);
    
    const circular = await prisma.circulars.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
        image_url: body.image_url || null,
        priority: body.priority,
        target_type: body.target_type,
        target_teacher_id: body.target_teacher_id || null,
        issue_date: new Date(body.issue_date),
        expiry_duration: body.expiry_duration,
        expiry_date: expiryDate,
        is_read_required: body.is_read_required,
        circular_number: body.circular_number,
        department: body.department,
        is_active: body.is_active !== undefined ? body.is_active : true,
        updated_at: new Date(),
      },
    });
    
    return NextResponse.json({ success: true, circular });
  } catch (error) {
    console.error('Error updating circular:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ویرایش بخشنامه',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// حذف بخشنامه
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    
    await prisma.circulars.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting circular:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در حذف بخشنامه',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}