export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

function getAuthToken(request) {
  const bearer = request.headers.get('authorization');
  const cookieToken = request.cookies.get('token')?.value;
  if (bearer && bearer.startsWith('Bearer ')) return bearer.slice(7).trim();
  return (cookieToken || '').trim();
}

function checkAdminAccess(payload) {
  return payload && ['admin', 'teacher'].includes(payload.role);
}

export async function PUT(request, { params }) {
  try {
    // احراز هویت
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!checkAdminAccess(payload)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست' 
      }, { status: 403 });
    }

    const id = Number(params.attendanceId);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه نامعتبر' 
      }, { status: 400 });
    }

    const data = await request.json();
    
    // اعتبارسنجی داده‌ها
    const allowedFields = ['status', 'delay_minutes', 'delay_reason', 'notes', 'is_justified'];
    const updateData = {};
    
    Object.keys(data).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = data[key];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'داده‌های نامعتبر' 
      }, { status: 400 });
    }

    const attendance = await prisma.attendances.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        date: true,
        status: true,
        delay_minutes: true,
        delay_reason: true,
        notes: true,
        is_justified: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      attendance 
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔒 Update Attendance Error:', error.message);
    }

    return NextResponse.json({ 
      success: false, 
      message: 'خطای داخلی سیستم' 
    }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    // احراز هویت
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز' 
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!checkAdminAccess(payload)) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی مجاز نیست' 
      }, { status: 403 });
    }

    const id = Number(params.attendanceId);
    if (isNaN(id)) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه نامعتبر' 
      }, { status: 400 });
    }

    await prisma.attendances.delete({ 
      where: { id } 
    });

    return NextResponse.json({ 
      success: true,
      message: 'حذف شد'
    });

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('🔒 Delete Attendance Error:', error.message);
    }

    return NextResponse.json({ 
      success: false, 
      message: 'خطای داخلی سیستم' 
    }, { status: 500 });
  }
}

// محدود کردن متدهای HTTP
export async function GET() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}
export async function POST() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}
export async function PATCH() {
  return NextResponse.json({ success: false, message: 'متد مجاز نیست' }, { status: 405 });
}