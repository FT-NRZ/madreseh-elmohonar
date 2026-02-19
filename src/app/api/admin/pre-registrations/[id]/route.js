export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';  // استفاده از Prisma
import { verifyJWT } from '@/lib/jwt';    // استفاده از تابع مرکزی JWT

function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

// تابع بررسی توکن و نقش ادمین
function verifyAdmin(request) {
  console.log('🔍 [Admin ID Route] Checking admin access...');
  try {
    const token = getToken(request);
    if (!token) return null;
    
    const payload = verifyJWT(token);
    console.log('✅ [Admin ID Route] Token decoded, role:', payload?.role);
    return payload && payload.role === 'admin' ? payload : null;
  } catch (error) {
    console.log('❌ [Admin ID Route] JWT verification failed:', error.message);
    return null;
  }
}

// به‌روزرسانی وضعیت (PATCH method)
export async function PATCH(request, { params }) {
  console.log('🚀 PATCH /api/admin/pre-registrations/[id] called');
  
  const admin = verifyAdmin(request);
  if (!admin) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  try {
    const { id } = params;
    console.log('🔄 Updating status for ID:', id);
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه نامعتبر است' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    const { status } = body;
    console.log('📝 New status:', status);

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'وضعیت نامعتبر است' 
      }, { status: 400 });
    }

    // بررسی وجود درخواست
    const existingRecord = await prisma.pre_registrations.findUnique({
      where: { id: parseInt(id) },
      include: {
        grades: {
          select: {
            grade_name: true
          }
        }
      }
    });

    if (!existingRecord) {
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    // به‌روزرسانی وضعیت
    const updatedRecord = await prisma.pre_registrations.update({
      where: { id: parseInt(id) },
      data: { 
        status,
        updated_at: new Date()
      },
      include: {
        grades: {
          select: {
            grade_name: true
          }
        }
      }
    });

    console.log('✅ Status updated successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'وضعیت به‌روزرسانی شد',
      registration: {
        id: updatedRecord.id,
        first_name: updatedRecord.first_name,
        last_name: updatedRecord.last_name,
        phone: updatedRecord.phone,
        status: updatedRecord.status,
        created_at: updatedRecord.created_at,
        updated_at: updatedRecord.updated_at,
        grade: updatedRecord.grades?.grade_name || 'نامشخص',
        grade_interest: updatedRecord.grade_interest
      }
    });

  } catch (error) {
    console.error('💥 Update status error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور' 
    }, { status: 500 });
  }
}

// حذف درخواست
export async function DELETE(request, { params }) {
  console.log('🚀 DELETE /api/admin/pre-registrations/[id] called');
  
  const admin = verifyAdmin(request);
  if (!admin) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  try {
    const { id } = params;
    console.log('🗑️ Deleting registration with ID:', id);

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه نامعتبر است' 
      }, { status: 400 });
    }

    // بررسی وجود درخواست
    const existingRecord = await prisma.pre_registrations.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingRecord) {
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    // حذف درخواست
    await prisma.pre_registrations.delete({
      where: { id: parseInt(id) }
    });

    console.log('✅ Registration deleted successfully');

    return NextResponse.json({ 
      success: true, 
      message: 'درخواست حذف شد' 
    });

  } catch (error) {
    console.error('💥 Delete registration error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور' 
    }, { status: 500 });
  }
}