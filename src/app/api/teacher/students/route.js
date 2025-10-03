import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = await verifyJWT(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({
        success: false,
        message: 'دسترسی غیرمجاز'
      }, { status: 403 });
    }

    // اگر نقش ادمین بود، همه دانش‌آموزان را بده
    if (payload.role === 'admin') {
      const students = await prisma.students.findMany({
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              national_id: true
            }
          },
          classes: true
        },
        orderBy: {
          users: {
            last_name: 'asc'
          }
        }
      });
      return NextResponse.json({ success: true, students });
    }

    // اگر معلم بود، فقط دانش‌آموزان کلاس‌های خودش را بده
    const teacher = await prisma.teachers.findFirst({
      where: { user_id: payload.userId }
    });

    if (!teacher) {
      return NextResponse.json({
        success: false,
        message: 'معلم یافت نشد'
      }, { status: 404 });
    }

    const classIds = await prisma.class_teachers.findMany({
      where: { teacher_id: teacher.id },
      select: { class_id: true }
    }).then(arr => arr.map(c => c.class_id));

    const students = await prisma.students.findMany({
      where: {
        class_id: { in: classIds }
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            national_id: true
          }
        },
        classes: true
      },
      orderBy: {
        users: {
          last_name: 'asc'
        }
      }
    });

    return NextResponse.json({ success: true, students });

  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({
      success: false,
      message: 'خطا در دریافت لیست دانش‌آموزان'
    }, { status: 500 });
  }
}