import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '../../../lib/jwt';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const prisma = new PrismaClient();
// تابع پردازش فایل آپلود شده
async function saveFile(file, directory) {
  try {
    // اطمینان از وجود دایرکتوری
    const uploadDir = path.join(process.cwd(), 'public', directory);
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
    
    // خواندن فایل و ذخیره آن
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // ایجاد نام فایل منحصر به فرد
    const timestamp = Date.now();
    const originalName = file.name.replace(/\s+/g, '-').toLowerCase();
    const extension = path.extname(originalName);
    const fileName = `${timestamp}${extension}`;
    const filePath = path.join(uploadDir, fileName);
    
    // ذخیره فایل
    await writeFile(filePath, buffer);
    
    // برگرداندن مسیر نسبی فایل برای ذخیره در دیتابیس
    return `/${directory}/${fileName}`;
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('خطا در ذخیره‌سازی فایل');
  }
}

// بررسی احراز هویت
async function authenticate(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authenticated: false, status: 401, message: 'توکن ارسال نشده یا نامعتبر است' };
  }
  const token = authHeader.replace('Bearer ', '');
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
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }

    // بررسی پارامترهای URL
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('categoryId');
    const classId = url.searchParams.get('classId');
    const gradeId = url.searchParams.get('gradeId'); // اینجا منتقل شود
    const featured = url.searchParams.get('featured');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // ساخت شرط جستجو
    const where = {};
    if (categoryId) {
      where.category_id = parseInt(categoryId);
    }
    if (classId) {
      where.class_id = parseInt(classId);
    }
    if (gradeId) { // اینجا منتقل شود
      where.grade_id = parseInt(gradeId);
    }
    if (featured === 'true') {
      where.is_featured = true;
    }
    
    // دریافت تصاویر با اطلاعات دسته‌بندی و کلاس
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
    
    return Response.json({ 
      success: true, 
      images,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });
    
  } catch (error) {
    console.error('Gallery images API error:', error);
    return Response.json({ 
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
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    // دریافت فرم داده
    const formData = await request.formData();
    const imageFile = formData.get('image');
    
    // اعتبارسنجی فایل تصویر
    if (!imageFile) {
      return Response.json({ 
        success: false, 
        message: 'فایل تصویر الزامی است' 
      }, { status: 400 });
    }
    
    if (!imageFile.type.startsWith('image/')) {
      return Response.json({ 
        success: false, 
        message: 'فقط فایل‌های تصویری مجاز هستند' 
      }, { status: 400 });
    }
    
    if (imageFile.size > 5 * 1024 * 1024) {
      return Response.json({ 
        success: false, 
        message: 'حداکثر اندازه فایل 5 مگابایت است' 
      }, { status: 400 });
    }
    
    // اعتبارسنجی دسته‌بندی
    const categoryId = formData.get('category_id');
    if (!categoryId) {
      return Response.json({ 
        success: false, 
        message: 'انتخاب دسته‌بندی الزامی است' 
      }, { status: 400 });
    }
    
    // بررسی وجود دسته‌بندی
    const category = await prisma.gallery_categories.findUnique({
      where: { id: parseInt(categoryId) }
    });
    
    if (!category) {
      return Response.json({ 
        success: false, 
        message: 'دسته‌بندی مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // دریافت سایر فیلدها
    const title = formData.get('title') || '';
    const description = formData.get('description') || null;
    const classId = formData.get('class_id') || null;
    const altText = formData.get('alt_text') || null;
    const isFeatured = formData.get('is_featured') === 'true';
    const gradeId = formData.get('grade_id') || null;
    
    // ذخیره فایل تصویر
    const imagePath = await saveFile(imageFile, 'uploads/gallery');
    
    // ذخیره اطلاعات تصویر در دیتابیس
    const newImage = await prisma.gallery_images.create({
      data: {
        category_id: parseInt(categoryId),
        class_id: classId ? parseInt(classId) : null,
        grade_id: gradeId ? parseInt(gradeId) : null, // اضافه شود
        title,
        description,
        image_path: imagePath,
        alt_text: altText,
        is_featured: isFeatured
      }
    });
    
    return Response.json({ 
      success: true, 
      message: 'تصویر با موفقیت آپلود شد', 
      image: newImage 
    });
    
  } catch (error) {
    console.error('Gallery images API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: بروزرسانی تصویر
export async function PUT(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return Response.json({ 
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
      return Response.json({ 
        success: false, 
        message: 'تصویر مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // اگر درخواست multipart/form-data است (احتمالاً فایل جدید آپلود شده)
    const contentType = request.headers.get('content-type');
    let updateData = {};
    
    if (contentType && contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const imageFile = formData.get('image');
      
      // بروزرسانی فیلدهای متنی
      const categoryId = formData.get('category_id');
      if (categoryId) {
        // بررسی وجود دسته‌بندی
        const category = await prisma.gallery_categories.findUnique({
          where: { id: parseInt(categoryId) }
        });
        
        if (!category) {
          return Response.json({ 
            success: false, 
            message: 'دسته‌بندی مورد نظر یافت نشد' 
          }, { status: 404 });
        }
        
        updateData.category_id = parseInt(categoryId);
      }
      
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
      
      // اگر فایل جدید آپلود شده
      if (imageFile && imageFile.size > 0) {
        // اعتبارسنجی نوع فایل
        if (!imageFile.type.startsWith('image/')) {
          return Response.json({ 
            success: false, 
            message: 'فقط فایل‌های تصویری مجاز هستند' 
          }, { status: 400 });
        }
        
        // اعتبارسنجی سایز فایل
        if (imageFile.size > 5 * 1024 * 1024) {
          return Response.json({ 
            success: false, 
            message: 'حداکثر اندازه فایل 5 مگابایت است' 
          }, { status: 400 });
        }
        
        // ذخیره فایل جدید
        const imagePath = await saveFile(imageFile, 'uploads/gallery');
        updateData.image_path = imagePath;
      }
    } else {
      // اگر درخواست JSON است (فقط بروزرسانی فیلدهای متنی)
      const body = await request.json();
      
      if (body.category_id) {
        // بررسی وجود دسته‌بندی
        const category = await prisma.gallery_categories.findUnique({
          where: { id: parseInt(body.category_id) }
        });
        
        if (!category) {
          return Response.json({ 
            success: false, 
            message: 'دسته‌بندی مورد نظر یافت نشد' 
          }, { status: 404 });
        }
      }
      
      updateData = {
        ...updateData,
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
    
    // بروزرسانی تصویر در دیتابیس
    const updatedImage = await prisma.gallery_images.update({
      where: { id: imageId },
      data: updateData
    });
    
    return Response.json({ 
      success: true, 
      message: 'تصویر با موفقیت بروزرسانی شد', 
      image: updatedImage 
    });
    
  } catch (error) {
    console.error('Gallery images API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
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
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return Response.json({ 
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
      return Response.json({ 
        success: false, 
        message: 'تصویر مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // حذف تصویر از دیتابیس
    await prisma.gallery_images.delete({
      where: { id: imageId }
    });
    
    return Response.json({ 
      success: true, 
      message: 'تصویر با موفقیت حذف شد' 
    });
    
  } catch (error) {
    console.error('Gallery images API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}