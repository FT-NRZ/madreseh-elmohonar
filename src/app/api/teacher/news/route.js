import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

const buildImageUrl = (url) => {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.NEXT_PUBLIC_BASE_URL || '';
  return `${base}${url}`;
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const gradeId = searchParams.get('gradeId');
    const type = searchParams.get('type');
    
    console.log('Teacher news API called with params:', { teacherId, studentId, gradeId, type });
    
    // اگر برای دانش‌آموز است (student view)
    if (type === 'student_view' && studentId) {
      const studentRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/teacher/news/student?studentId=${studentId}${gradeId ? `&gradeId=${gradeId}` : ''}`);
      const json = await studentRes.json();
      if (json.success) {
        return NextResponse.json({
          success: true,
          reminders: json.reminders.map(r => ({ ...r, image_url: buildImageUrl(r.image_url) }))
        });
      }
      return NextResponse.json({ success: false, error: json.error || 'خطا' }, { status: 400 });
    }
    
    // اگر برای معلم است (teacher dashboard)
    if (teacherId) {
      const news = await prisma.teacher_news.findMany({
        where: { author_id: Number(teacherId) },
        include: {
          users: { select: { first_name: true, last_name: true } },
          target_grade: { select: { id: true, grade_name: true } },
          target_student: {
            select: {
              id: true,
              student_number: true,
              users: { select: { first_name: true, last_name: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      });

      return NextResponse.json({
        success: true,
        news: news.map(n => ({ ...n, image_url: buildImageUrl(n.image_url) }))
      });
    }
    
    return NextResponse.json({ success: false, error: 'پارامتر نامعتبر' }, { status: 400 });
  } catch (e) {
    console.error('Error news GET:', e);
    return NextResponse.json({ success: false, error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  }
}

// POST - ایجاد خبر جدید
export async function POST(request) {
  try {
    const data = await request.json();
    const { 
      title, 
      content, 
      image_url, 
      target_type, 
      target_grade_id, 
      target_student_id, 
      is_important, 
      reminder_date, 
      author_id 
    } = data;

    console.log('Creating news with data:', data);

    // اعتبارسنجی
    if (!title || !content || !author_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'عنوان، محتوا و نویسنده الزامی است' 
      }, { status: 400 });
    }

    if (!['grade', 'specific_student', 'all_students'].includes(target_type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع مخاطب نامعتبر است' 
      }, { status: 400 });
    }

    // اگر مخاطب پایه است، باید پایه انتخاب شده باشد
    if (target_type === 'grade' && !target_grade_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'انتخاب پایه الزامی است' 
      }, { status: 400 });
    }

    // اگر مخاطب دانش‌آموز خاص است، باید دانش‌آموز انتخاب شده باشد
    if (target_type === 'specific_student' && !target_student_id) {
      return NextResponse.json({ 
        success: false, 
        error: 'انتخاب دانش‌آموز الزامی است' 
      }, { status: 400 });
    }

    const newsData = {
      title,
      content,
      image_url: image_url || null,
      target_type,
      target_grade_id: target_grade_id ? parseInt(target_grade_id) : null,
      target_student_id: target_student_id ? parseInt(target_student_id) : null,
      is_important: is_important || false,
      reminder_date: reminder_date ? new Date(reminder_date) : null,
      author_id: parseInt(author_id)
    };

    const news = await prisma.teacher_news.create({
      data: newsData,
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
      }
    });

    return NextResponse.json({ 
      success: true, 
      news,
      message: 'خبر با موفقیت ایجاد شد' 
    });

  } catch (error) {
    console.error('Error creating teacher news:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ایجاد خبر' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - ویرایش خبر
export async function PUT(request) {
  try {
    const data = await request.json();
    const { 
      id,
      title, 
      content, 
      image_url, 
      target_type, 
      target_grade_id, 
      target_student_id, 
      is_important, 
      reminder_date 
    } = data;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه خبر مورد نیاز است' 
      }, { status: 400 });
    }

    // بررسی وجود خبر
    const existingNews = await prisma.teacher_news.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingNews) {
      return NextResponse.json({ 
        success: false, 
        error: 'خبر یافت نشد' 
      }, { status: 404 });
    }

    const updateData = {
      title,
      content,
      image_url: image_url || null,
      target_type,
      target_grade_id: target_grade_id ? parseInt(target_grade_id) : null,
      target_student_id: target_student_id ? parseInt(target_student_id) : null,
      is_important: is_important || false,
      reminder_date: reminder_date ? new Date(reminder_date) : null,
      updated_at: new Date()
    };

    const updatedNews = await prisma.teacher_news.update({
      where: { id: parseInt(id) },
      data: updateData,
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
      }
    });

    return NextResponse.json({ 
      success: true, 
      news: updatedNews,
      message: 'خبر با موفقیت ویرایش شد' 
    });

  } catch (error) {
    console.error('Error updating teacher news:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ویرایش خبر' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - حذف خبر
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه خبر مورد نیاز است' 
      }, { status: 400 });
    }

    // بررسی وجود خبر
    const existingNews = await prisma.teacher_news.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingNews) {
      return NextResponse.json({ 
        success: false, 
        error: 'خبر یافت نشد' 
      }, { status: 404 });
    }

    await prisma.teacher_news.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'خبر با موفقیت حذف شد' 
    });

  } catch (error) {
    console.error('Error deleting teacher news:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در حذف خبر' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}