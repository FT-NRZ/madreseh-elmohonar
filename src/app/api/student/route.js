import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request) {
  try {
    // احراز هویت - اما اگر توکن نباشد، خطا نده
    const authHeader = request.headers.get('authorization');
    let isAuthorized = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const payload = verifyJWT(token);
      if (payload && (payload.role === 'admin' || payload.role === 'teacher')) {
        isAuthorized = true;
      }
    }
    
    // اگر احراز هویت نشده، دسترسی ندارد
    if (!isAuthorized) {
      return NextResponse.json({ 
        success: false, 
        message: 'دسترسی غیرمجاز',
        students: [] 
      }, { status: 401 });
    }

    // فقط اطلاعات غیرحساس دانش‌آموزان را برگردان
    const students = await prisma.students.findMany({
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            profile_image: true,
            phone: true
          }
        },
        classes: {
          select: {
            id: true,
            class_name: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // حذف اطلاعات حساس و ساختاردهی خروجی
    const safeStudents = students.map(stu => ({
      id: stu.id,
      user_id: stu.user_id, // برای compatibility
      studentNumber: stu.student_number,
      class_id: stu.class_id, // برای compatibility
      users: {
        id: stu.users.id,
        first_name: stu.users.first_name,
        last_name: stu.users.last_name,
        firstName: stu.users.first_name, // برای compatibility
        lastName: stu.users.last_name,   // برای compatibility
        profileImage: stu.users.profile_image,
        phone: stu.users.phone
      },
      class: stu.classes
        ? { id: stu.classes.id, name: stu.classes.class_name }
        : null
    }));

    return NextResponse.json({ success: true, students: safeStudents });
  } catch (error) {
    // خطا در لاگ فقط در development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error in /api/student:', error);
    }
    return NextResponse.json({ 
      success: false, 
      students: [], 
      message: 'خطای سرور' 
    }, { status: 500 });
  }
}