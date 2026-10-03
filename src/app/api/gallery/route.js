import { PrismaClient } from '@prisma/client';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyJWT } from '../../../lib/jwt';
import { s3 } from '../../../lib/s3';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

function storageKey(imagePath) {
  const value = String(imagePath || '');
  try {
    const parsed = new URL(value);
    const bucket = process.env.LIARA_BUCKET_NAME || '';
    const path = parsed.pathname.replace(/^\/+/, '');
    return path.startsWith(`${bucket}/`) ? path.slice(bucket.length + 1) : path;
  } catch {
    return value.replace(/^\/+/, '');
  }
}

async function withDisplayUrl(image) {
  if (!image?.image_path) return image;

  try {
    const url = await getSignedUrl(
      s3,
      new GetObjectCommand({
        Bucket: process.env.LIARA_BUCKET_NAME,
        Key: storageKey(image.image_path)
      }),
      { expiresIn: 3600 }
    );
    return { ...image, image_path: url };
  } catch (error) {
    console.error('Gallery image URL signing failed:', error.message);
    return image;
  }
}

// تابع دریافت توکن احراز هویت
function getAuthToken(request) {
  const bearer = request.headers.get('authorization');
  const cookieToken = request.cookies.get('access_token')?.value ||
    request.cookies.get('token')?.value;
  if (bearer && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return (cookieToken || '').trim();
}

// بررسی احراز هویت
async function authenticate(request) {
  const token = getAuthToken(request);
  if (!token) {
    return { authenticated: false, status: 401, message: 'توکن ارسال نشده' };
  }
  
  const user = verifyJWT(token);
  if (!user) {
    return { authenticated: false, status: 401, message: 'توکن نامعتبر است' };
  }
  return { authenticated: true, user };
}

// GET: دریافت تصاویر گالری
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({
        success: false,
        requiresLogin: true,
        message: 'برای مشاهده عکس‌ها وارد حساب کاربری خود شوید'
      }, { status: auth.status });
    }

    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const classId = url.searchParams.get('classId');
    const gradeId = url.searchParams.get('gradeId');
    const featured = url.searchParams.get('featured');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    const where = {};
    if (categoryId) where.category_id = parseInt(categoryId);
    if (classId) where.class_id = parseInt(classId);
    if (gradeId) where.grade_id = parseInt(gradeId);
    if (featured === 'true') where.is_featured = true;
    
    const [images, totalCount] = await Promise.all([
      prisma.gallery_images.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
        include: {
          gallery_categories: {
            select: { name: true }
          },
          classes: {
            select: { class_name: true }
          }
        }
      }),
      prisma.gallery_images.count({ where })
    ]);
    
    const displayImages = await Promise.all(images.map(withDisplayUrl));

    return NextResponse.json({ 
      success: true, 
      images: displayImages,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('💥 Gallery GET error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: آپلود تصویر جدید
export async function POST(request) {
  try {
    console.log('🔄 Gallery POST started');
    
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    if (!imageFile) {
      return NextResponse.json({ 
        success: false, 
        message: 'فایل تصویر الزامی است' 
      }, { status: 400 });
    }
    
    if (!imageFile.type.startsWith('image/')) {
      return NextResponse.json({ 
        success: false, 
        message: 'فقط فایل‌های تصویری مجاز هستند' 
      }, { status: 400 });
    }
    
    if (imageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        success: false, 
        message: 'حداکثر اندازه فایل 5 مگابایت است' 
      }, { status: 400 });
    }
    
    const categoryId = formData.get('category_id');
    if (!categoryId) {
      return NextResponse.json({ 
        success: false, 
        message: 'انتخاب دسته‌بندی الزامی است' 
      }, { status: 400 });
    }
    
    // بررسی وجود دسته‌بندی
    const category = await prisma.gallery_categories.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسته‌بندی مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // 🔥 آپلود به فضای ابری
    const uploadFormData = new FormData();
    uploadFormData.append('file', imageFile);
    uploadFormData.append('folder', 'gallery');

    console.log('📤 Uploading to cloud storage...');

    const baseUrl = process.env.NEXTAUTH_URL || 
                   `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
    
    const uploadResponse = await fetch(`${baseUrl}/api/storage/upload`, {
      method: 'POST',
      body: uploadFormData
    });

    const uploadData = await uploadResponse.json();
    console.log('📊 Upload response:', uploadData);

    if (!uploadData.success || !uploadData.url) {
      console.error('❌ Upload failed:', uploadData);
      return NextResponse.json({ 
        success: false, 
        message: 'خطا در آپلود فایل: ' + (uploadData.error || 'نامشخص') 
      }, { status: 500 });
    }

    console.log('✅ Image uploaded to cloud:', uploadData.url);
    
    // دریافت سایر فیلدها
    const title = formData.get('title') || '';
    const description = formData.get('description') || null;
    const classId = formData.get('class_id') || null;
    const altText = formData.get('alt_text') || null;
    const isFeatured = formData.get('is_featured') === 'true';
    const gradeId = formData.get('grade_id') || null;
    
    // ذخیره اطلاعات در دیتابیس با URL فضای ابری
    const newImage = await prisma.gallery_images.create({
      data: {
        category_id: parseInt(categoryId),
        class_id: classId ? parseInt(classId) : null,
        grade_id: gradeId ? parseInt(gradeId) : null,
        title,
        description,
        image_path: uploadData.url, // 🔥 URL فضای ابری
        alt_text: altText,
        is_featured: isFeatured
      }
    });
    
    console.log('✅ Gallery image saved to database:', newImage.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تصویر با موفقیت آپلود شد', 
      image: newImage 
    });
    
  } catch (error) {
    console.error('💥 Gallery POST error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در سرور: ' + error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: بروزرسانی تصویر
export async function PUT(request) {
  try {
    console.log('🔄 Gallery PUT started');
    
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه تصویر معتبر نیست' 
      }, { status: 400 });
    }
    
    const imageId = parseInt(id);
    
    // بررسی وجود تصویر
    const existingImage = await prisma.gallery_images.findUnique({
      where: { id: imageId }
    });
    
    if (!existingImage) {
      return NextResponse.json({ 
        success: false, 
        message: 'تصویر مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    const contentType = request.headers.get('content-type');
    let updateData = {};
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      
      // بررسی دسته‌بندی
      const categoryId = formData.get('category_id');
      if (categoryId) {
        const category = await prisma.gallery_categories.findUnique({
          where: { id: parseInt(categoryId) }
        });
        
        if (!category) {
          return NextResponse.json({ 
            success: false, 
            message: 'دسته‌بندی مورد نظر یافت نشد' 
          }, { status: 404 });
        }
        updateData.category_id = parseInt(categoryId);
      }
      
      // اگر فایل جدید آپلود شده
      if (imageFile && imageFile.size > 0) {
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json({ 
            success: false, 
            message: 'فقط فایل‌های تصویری مجاز هستند' 
          }, { status: 400 });
        }
        
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            success: false, 
            message: 'حداکثر اندازه فایل 5 مگابایت است' 
          }, { status: 400 });
        }
        
        // 🔥 آپلود فایل جدید به فضای ابری
        const uploadFormData = new FormData();
        uploadFormData.append('file', imageFile);
        uploadFormData.append('folder', 'gallery');

        console.log('📤 Uploading new image to cloud...');

        const baseUrl = process.env.NEXTAUTH_URL || 
                       `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`;
        
        const uploadResponse = await fetch(`${baseUrl}/api/storage/upload`, {
          method: 'POST',
          body: uploadFormData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success || !uploadData.url) {
          return NextResponse.json({ 
            success: false, 
            message: 'خطا در آپلود فایل جدید: ' + (uploadData.error || 'نامشخص') 
          }, { status: 500 });
        }

        console.log('✅ New image uploaded:', uploadData.url);
        updateData.image_path = uploadData.url; // 🔥 URL جدید فضای ابری
      }
      
      // بروزرسانی سایر فیلدها
      updateData = {
        ...updateData,
        title: formData.get('title') !== undefined ? formData.get('title') : existingImage.title,
        description: formData.get('description') !== undefined ? formData.get('description') : existingImage.description,
        class_id: formData.get('class_id') !== undefined ? 
          (formData.get('class_id') ? parseInt(formData.get('class_id')) : null) : 
          existingImage.class_id,
        alt_text: formData.get('alt_text') !== undefined ? formData.get('alt_text') : existingImage.alt_text,
        is_featured: formData.has('is_featured') ? formData.get('is_featured') === 'true' : existingImage.is_featured,
        grade_id: formData.get('grade_id') !== undefined ? 
          (formData.get('grade_id') ? parseInt(formData.get('grade_id')) : null) : 
          existingImage.grade_id
      };
    } else {
      // درخواست JSON (فقط بروزرسانی فیلدهای متنی)
      const body = await request.json();
      
      if (body.category_id) {
        const category = await prisma.gallery_categories.findUnique({
          where: { id: parseInt(body.category_id) }
        });
        
        if (!category) {
          return NextResponse.json({ 
            success: false, 
            message: 'دسته‌بندی مورد نظر یافت نشد' 
          }, { status: 404 });
        }
      }
      
      updateData = {
        title: body.title !== undefined ? body.title : existingImage.title,
        description: body.description !== undefined ? body.description : existingImage.description,
        category_id: body.category_id !== undefined ? parseInt(body.category_id) : existingImage.category_id,
        class_id: body.class_id !== undefined ? 
          (body.class_id ? parseInt(body.class_id) : null) : 
          existingImage.class_id,
        alt_text: body.alt_text !== undefined ? body.alt_text : existingImage.alt_text,
        is_featured: body.is_featured !== undefined ? body.is_featured === true : existingImage.is_featured,
        grade_id: body.grade_id !== undefined ? 
          (body.grade_id ? parseInt(body.grade_id) : null) : 
          existingImage.grade_id
      };
    }
    
    // بروزرسانی در دیتابیس
    const updatedImage = await prisma.gallery_images.update({
      where: { id: imageId },
      data: updateData
    });
    
    console.log('✅ Gallery image updated:', updatedImage.id);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تصویر با موفقیت بروزرسانی شد', 
      image: updatedImage 
    });
    
  } catch (error) {
    console.error('💥 Gallery PUT error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در سرور: ' + error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: حذف تصویر
export async function DELETE(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return NextResponse.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه تصویر معتبر نیست' 
      }, { status: 400 });
    }
    
    const imageId = parseInt(id);
    
    // بررسی وجود تصویر
    const existingImage = await prisma.gallery_images.findUnique({
      where: { id: imageId }
    });
    
    if (!existingImage) {
      return NextResponse.json({ 
        success: false, 
        message: 'تصویر مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // حذف تصویر از دیتابیس
    await prisma.gallery_images.delete({
      where: { id: imageId }
    });
    
    console.log('✅ Gallery image deleted:', imageId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'تصویر با موفقیت حذف شد' 
    });
    
  } catch (error) {
    console.error('💥 Gallery DELETE error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطا در سرور: ' + error.message
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}