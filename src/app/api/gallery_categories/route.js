import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '../../../lib/jwt';
const prisma = new PrismaClient();

// بررسی احراز هویت
async function authenticate(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { authenticated: false, status: 401, message: 'توکن ارسال نشده است' };
  const token = authHeader.replace('Bearer ', '');
  const user = verifyJWT(token);
  if (!user) return { authenticated: false, status: 401, message: 'توکن نامعتبر است' };
  if (!['admin', 'student', 'teacher'].includes(user.role))
    return { authenticated: false, status: 403, message: 'دسترسی مجاز نیست' };
  return { authenticated: true, user };
}

// GET: دریافت همه دسته‌بندی‌ها
export async function GET(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated) {
      return Response.json({ success: false, message: auth.message }, { status: auth.status });
    }
    
    // بررسی پارامترهای URL
    const url = new URL(request.url);
    const parentId = url.searchParams.get('parentId');
    
    let where = {};
    if (parentId === 'null' || parentId === '0') {
      // دریافت فقط دسته‌بندی‌های اصلی (بدون والد)
      where = { parent_id: null };
    } else if (parentId) {
      // دریافت زیردسته‌های یک دسته‌بندی خاص
      where = { parent_id: parseInt(parentId) };
    }
    
    const categories = await prisma.gallery_categories.findMany({
      where,
      orderBy: [
        { sort_order: 'asc' },
        { name: 'asc' }
      ]
    });
    
    return Response.json({ 
    success: true, 
    categories
    });
    
  } catch (error) {
    console.error('Gallery categories API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST: ایجاد دسته‌بندی جدید
export async function POST(request) {
  try {
    const auth = await authenticate(request);
    if (!auth.authenticated)
      return Response.json({ success: false, message: auth.message }, { status: auth.status });

    const body = await request.json();
    if (!body.name || body.name.trim() === '')
      return Response.json({ success: false, message: 'نام دسته‌بندی الزامی است' }, { status: 400 });

    const exists = await prisma.gallery_categories.findFirst({
      where: {
        name: body.name.trim(),
        parent_id: body.parent_id ? parseInt(body.parent_id) : null
      }
    });
    if (exists)
      return Response.json({ success: false, message: 'این نام در همین سطح قبلاً استفاده شده' }, { status: 400 });

    const newCategory = await prisma.gallery_categories.create({
      data: {
        name: body.name.trim(),
        description: body.description?.trim() || null,
        parent_id: body.parent_id ? parseInt(body.parent_id) : null,
        is_active: body.is_active !== undefined ? !!body.is_active : true,
        sort_order: body.sort_order ? parseInt(body.sort_order) : 0
      }
    });

    return Response.json({
      success: true,
      message: 'دسته‌بندی ایجاد شد',
      category: newCategory
    });
  } catch (e) {
    if (e.code === 'P2002')
      return Response.json({ success: false, message: 'نام دسته‌بندی تکراری است' }, { status: 400 });

    console.error('Gallery categories POST error:', e);
    return Response.json({ success: false, message: 'خطای سرور', error: e.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// PUT: بروزرسانی دسته‌بندی
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
        message: 'شناسه دسته‌بندی معتبر نیست' 
      }, { status: 400 });
    }
    
    const categoryId = parseInt(id);
    const body = await request.json();
    
    // بررسی وجود دسته‌بندی
    const existingCategory = await prisma.gallery_categories.findUnique({
      where: { id: categoryId }
    });
    
    if (!existingCategory) {
      return Response.json({ 
        success: false, 
        message: 'دسته‌بندی مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // بررسی تکراری نبودن نام در صورت تغییر
    if (body.name && body.name !== existingCategory.name) {
      const duplicateName = await prisma.gallery_categories.findFirst({
        where: {
          name: body.name,
          parent_id: body.parent_id !== undefined ? 
            (body.parent_id ? parseInt(body.parent_id) : null) : 
            existingCategory.parent_id,
          id: { not: categoryId } // به جز خود دسته‌بندی
        }
      });
      
      if (duplicateName) {
        return Response.json({ 
          success: false, 
          message: 'دسته‌بندی با این نام در این سطح قبلاً ایجاد شده است' 
        }, { status: 400 });
      }
    }
    
    // جلوگیری از حلقه در ساختار درختی
    if (body.parent_id && parseInt(body.parent_id) === categoryId) {
      return Response.json({ 
        success: false, 
        message: 'یک دسته‌بندی نمی‌تواند والد خودش باشد' 
      }, { status: 400 });
    }
    
    // بروزرسانی دسته‌بندی
    const updatedCategory = await prisma.gallery_categories.update({
      where: { id: categoryId },
      data: {
        name: body.name !== undefined ? body.name : existingCategory.name,
        description: body.description !== undefined ? body.description : existingCategory.description,
        parent_id: body.parent_id !== undefined ? 
          (body.parent_id ? parseInt(body.parent_id) : null) : 
          existingCategory.parent_id,
        is_active: body.is_active !== undefined ? body.is_active : existingCategory.is_active,
        sort_order: body.sort_order !== undefined ? parseInt(body.sort_order) : existingCategory.sort_order
      }
    });
    
    return Response.json({ 
      success: true, 
      message: 'دسته‌بندی با موفقیت بروزرسانی شد', 
      category: updatedCategory 
    });
    
  } catch (error) {
    console.error('Gallery categories API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE: حذف دسته‌بندی
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
        message: 'شناسه دسته‌بندی معتبر نیست' 
      }, { status: 400 });
    }
    
    const categoryId = parseInt(id);
    
    // بررسی وجود دسته‌بندی
    const existingCategory = await prisma.gallery_categories.findUnique({
      where: { id: categoryId }
    });
    
    if (!existingCategory) {
      return Response.json({ 
        success: false, 
        message: 'دسته‌بندی مورد نظر یافت نشد' 
      }, { status: 404 });
    }
    
    // بررسی وجود زیردسته‌ها
    const hasSubcategories = await prisma.gallery_categories.findFirst({
      where: { parent_id: categoryId }
    });
    
    if (hasSubcategories) {
      return Response.json({ 
        success: false, 
        message: 'ابتدا باید زیردسته‌های این دسته‌بندی را حذف کنید' 
      }, { status: 400 });
    }
    
    // بررسی وجود تصاویر در این دسته‌بندی
    const hasImages = await prisma.gallery_images.findFirst({
      where: { category_id: categoryId }
    });
    
    if (hasImages) {
      return Response.json({ 
        success: false, 
        message: 'ابتدا باید تصاویر این دسته‌بندی را حذف کنید یا به دسته‌بندی دیگری منتقل کنید' 
      }, { status: 400 });
    }
    
    // حذف دسته‌بندی
    await prisma.gallery_categories.delete({
      where: { id: categoryId }
    });
    
    return Response.json({ 
      success: true, 
      message: 'دسته‌بندی با موفقیت حذف شد' 
    });
    
  } catch (error) {
    console.error('Gallery categories API error:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در سرور', 
      error: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}