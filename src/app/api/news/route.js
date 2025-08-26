import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// دریافت تمام اخبار
export async function GET(request) {
  try {
    console.log('Fetching news...');
    
    // ابتدا بدون include امتحان کنیم
    const news = await prisma.news_announcements.findMany({
      orderBy: { created_at: 'desc' }
    });
    
    console.log('News fetched successfully:', news.length);
    return Response.json({ success: true, news }, { status: 200 });
  } catch (error) {
    console.error('Error fetching news:', error);
    console.error('Error details:', error.message);
    return Response.json({ 
      success: false, 
      error: 'خطا در دریافت اخبار',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ایجاد خبر جدید
export async function POST(request) {
  try {
    console.log('Creating news...');
    const body = await request.json();
    console.log('Request body:', body);
    
    const news = await prisma.news_announcements.create({
      data: {
        title: body.title,
        content: body.content,
        is_published: body.is_published || false,
        publish_date: body.publish_date ? new Date(body.publish_date) : null,
        author_id: body.author_id || null,
      },
    });
    
    console.log('News created successfully:', news);
    return Response.json({ success: true, news }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    console.error('Error details:', error.message);
    return Response.json({ 
      success: false, 
      error: 'خطا در ثبت خبر',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ویرایش خبر
export async function PUT(request) {
  try {
    console.log('Updating news...');
    const body = await request.json();
    console.log('Request body:', body);
    
    const news = await prisma.news_announcements.update({
      where: { id: body.id },
      data: {
        title: body.title,
        content: body.content,
        is_published: body.is_published,
        publish_date: body.publish_date ? new Date(body.publish_date) : null,
        updated_at: new Date(),
      },
    });
    
    console.log('News updated successfully:', news);
    return Response.json({ success: true, news }, { status: 200 });
  } catch (error) {
    console.error('Error updating news:', error);
    console.error('Error details:', error.message);
    return Response.json({ 
      success: false, 
      error: 'خطا در ویرایش خبر',
      details: error.message 
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