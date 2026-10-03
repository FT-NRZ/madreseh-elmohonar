import { PrismaClient } from '@prisma/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/s3';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

function storageKey(imagePath) {
  try {
    const parsed = new URL(String(imagePath || ''));
    const bucket = process.env.LIARA_BUCKET_NAME || '';
    const path = parsed.pathname.replace(/^\/+/, '');
    return path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;
  } catch {
    return String(imagePath || '').replace(/^\/+/, '');
  }
}

async function withDisplayImage(newsItem) {
  if (!newsItem?.image_url) return newsItem;
  try {
    const image_url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: storageKey(newsItem.image_url)
      }),
      { expiresIn: 3600 }
    );
    return { ...newsItem, image_url };
  } catch (error) {
    console.error('News image URL signing failed:', error.message);
    return newsItem;
  }
}

// دریافت تمام اخبار
export async function GET(request) {
  try {
    const authorization = request.headers.get('authorization') || '';
    const cookieToken = request.cookies.get('access_token')?.value || request.cookies.get('token')?.value;
    const token = authorization.toLowerCase().startsWith('bearer ')
      ? authorization.slice(7).trim()
      : cookieToken;
    let payload = null;
    try { payload = token ? verifyJWT(token) : null; } catch {}

    const userRole = payload?.role;
    const userId = Number(payload?.user_id ?? payload?.uid ?? payload?.userId ?? payload?.id ?? payload?.sub);
    let audience = [{ target_type: 'public' }, { target_type: 'students' }];

    if (userRole === 'teacher' && Number.isInteger(userId) && userId > 0) {
      audience = [
        { target_type: 'public' },
        { target_type: 'teachers' },
        { target_type: 'specific_teacher', target_user_id: userId }
      ];
    } else if (userRole === 'student' && Number.isInteger(userId) && userId > 0) {
      audience = [
        { target_type: 'public' },
        { target_type: 'students' },
        { target_type: 'specific_student', target_user_id: userId }
      ];
    }

    const where = userRole === 'admin'
      ? {}
      : {
          is_published: true,
          AND: [
            { OR: audience },
            { OR: [{ publish_date: null }, { publish_date: { lte: new Date() } }] }
          ]
        };
    
    const news = await prisma.news_announcements.findMany({
      where,
      include: {
        // users relation حذف شد
        target_user: {
          select: { first_name: true, last_name: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    
    return Response.json({ success: true, news: await Promise.all(news.map(withDisplayImage)) }, { status: 200 });
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