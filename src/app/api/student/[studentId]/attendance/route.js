import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    // بررسی توکن
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
        message: 'توکن نامعتبر است' 
      }, { status: 401 });
    }

    const studentId = parseInt(params.studentId);
    if (isNaN(studentId)) {
      return NextResponse.json({
        success: false,
        message: 'شناسه دانش‌آموز نامعتبر است'
      }, { status: 400 });
    }

    // دریافت پارامتر فیلتر
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    // تعیین محدوده تاریخ بر اساس فیلتر
    let dateFilter = {};
    const now = new Date();

    switch (filter) {
      case 'week':
        dateFilter = {
          gte: new Date(now.setDate(now.getDate() - 7))
        };
        break;
      case 'month':
        dateFilter = {
          gte: new Date(now.setMonth(now.getMonth() - 1))
        };
        break;
      case 'threeMonths':
        dateFilter = {
          gte: new Date(now.setMonth(now.getMonth() - 3))
        };
        break;
      default:
        // همه زمان‌ها - نیازی به فیلتر نیست
        break;
    }

    console.log('Fetching attendances for student:', studentId); // برای دیباگ

    const student = await prisma.students.findFirst({
      where: { user_id: parseInt(studentId) }
    });

    if (!student) {
      return NextResponse.json({ 
        success: false,
        message: 'دانش‌آموز یافت نشد'
      }, { status: 404 });
    }
    
    // دریافت حضور و غیاب‌ها - اصلاح شده
    const attendances = await prisma.attendances.findMany({
      where: {
        student_id: student.id, // استفاده از student.id به جای studentId
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {})
      },
      include: {
        students: {
          include: {
            users: true,
            classes: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log('Found attendances:', attendances); // برای دیباگ

    // تبدیل داده‌ها به فرمت مناسب
    const formattedAttendances = attendances.map(att => ({
      id: att.id,
      date: att.date,
      status: att.status,
      delay_minutes: att.delay_minutes,
      delay_reason: att.delay_reason,
      notes: att.notes,
      student_name: att.students?.users ? 
        `${att.students.users.first_name} ${att.students.users.last_name}` : 
        'نامشخص',
      class_name: att.students?.classes?.class_name || 'نامشخص'
    }));

    // محاسبه آمار
    const stats = attendances.reduce((acc, curr) => {
      switch(curr.status) {
        case 'present':
          acc.present = (acc.present || 0) + 1;
          break;
        case 'absent':
          if (curr.is_justified) {
            acc.excused = (acc.excused || 0) + 1;
          } else {
            acc.absent = (acc.absent || 0) + 1;
          }
          break;
        case 'late':
          acc.late = (acc.late || 0) + 1;
          break;
      }
      return acc;
    }, {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0
    });

    return NextResponse.json({
      success: true,
      attendances: formattedAttendances,
      stats
    });

  } catch (error) {
    console.error('Error in attendance API:', error);
    return NextResponse.json({ 
      success: false,
      message: 'خطای سرور',
      error: error.message
    }, { status: 500 });
  }
}