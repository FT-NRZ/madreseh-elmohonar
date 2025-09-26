import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دریافت تمام اخبار
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = searchParams.get('role');
    const userId = searchParams.get('userId');
    
    let whereClause = {};
    
    if (!userRole || userRole === 'admin') {
      whereClause = {};
    } else if (userRole === 'teacher') {
      whereClause = {
        OR: [
          { target_type: 'public' },
          { target_type: 'teachers' },
          { target_type: 'specific_teacher', target_user_id: parseInt(userId) }
        ]
      };
    } else if (userRole === 'student') {
      whereClause = {
        OR: [
          { target_type: 'public' },
          { target_type: 'students' },
          { target_type: 'specific_student', target_user_id: parseInt(userId) }
        ]
      };
    } else {
      whereClause = { target_type: 'public' };
    }
    
    const news = await prisma.news_announcements.findMany({
      where: {
        ...(userRole && userRole !== 'admin' ? { is_published: true } : {}),
        ...whereClause
      },
      include: {
        // users relation حذف شد
        target_user: {
          select: { first_name: true, last_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return Response.json({ success: true, news }, { status: 200 });
  } catch (error) {
    console.error('Error fetching news:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در دریافت اخبار' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ایجاد خبر جدید
export async function POST(request) {
  try {
    const body = await request.json();
    
    const news = await prisma.news_announcements.create({
      data: {
        title: body.title,
        content: body.content,
        is_published: body.is_published || false,
        publish_date: body.publish_date ? new Date(body.publish_date) : null,
        //author_id: body.author_id || null,
        image_url: body.image_url || null,
        target_type: body.target_type || 'public',
        target_user_id: body.target_user_id ? Number(body.target_user_id) : null,
      },
    });
    
    return Response.json({ success: true, news }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در ثبت خبر' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


// ویرایش خبر
export async function PUT(request) {
  try {
    const body = await request.json();
    
    const news = await prisma.news_announcements.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
        is_published: body.is_published,
        publish_date: body.publish_date ? new Date(body.publish_date) : null,
        updated_at: new Date(),
        image_url: body.image_url || null,
        target_type: body.target_type || 'public',
        target_user_id: body.target_user_id || null,
      },
    });
    
    return Response.json({ success: true, news }, { status: 200 });
  } catch (error) {
    console.error('Error updating news:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در ویرایش خبر' 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// حذف خبر
export async function DELETE(request) {
  try {
    console.log('Deleting news...');
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'), 10);
    
    console.log('News ID to delete:', id);
    
    if (!id) {
      return Response.json({ success: false, error: 'شناسه خبر ارسال نشده است' }, { status: 400 });
    }

    await prisma.news_announcements.delete({
      where: { id },
    });
    
    console.log('News deleted successfully');
    return Response.json({ success: true, message: 'خبر با موفقیت حذف شد' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting news:', error);
    console.error('Error details:', error.message);
    return Response.json({ 
      success: false, 
      error: 'خطا در حذف خبر',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}