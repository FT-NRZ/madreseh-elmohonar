import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است' 
      }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyJWT(token);
    
    if (!payload) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است' 
      }, { status: 401 });
    }

    const { studentId } = params;
    if (!studentId || isNaN(parseInt(studentId))) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه دانش‌آموز نامعتبر است' 
      }, { status: 400 });
    }

    // دریافت اطلاعات دانش‌آموز
    const student = await prisma.students.findFirst({
      where: { user_id: parseInt(studentId) },
      include: { classes: true }
    });

    if (!student || !student.class_id) {
      return NextResponse.json({ 
        success: false, 
        message: 'دانش‌آموز یا کلاس یافت نشد' 
      }, { status: 404 });
    }

    // تغییر مدل Prisma به weekly_schedule
    const schedules = await prisma.weekly_schedule.findMany({
      where: { class_id: student.class_id },
      include: {
        classes: {
          select: {
            class_name: true
          }
        },
        subject: {
          select: {
            subject_name: true
          }
        },
        teacher: {
          select: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });

    const formattedSchedules = schedules.map(schedule => ({
      id: schedule.id,
      dayKey: getDayKey(schedule.day_of_week),
      subject: schedule.subject?.subject_name || 'نامشخص',
      time: `${schedule.start_time?.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })} - ${schedule.end_time?.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}`,
      teacher: schedule.teacher?.users 
        ? `${schedule.teacher.users.first_name} ${schedule.teacher.users.last_name}`
        : 'نامشخص',
      className: schedule.classes?.class_name || 'نامشخص'
    }));

    return NextResponse.json({ 
      success: true, 
      schedule: formattedSchedules,
      studentInfo: {
        className: student.classes?.class_name || 'نامشخص'
      }
    });

  } catch (error) {
    console.error('Error in /api/student/[studentId]/schedule:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطای سرور' 
    }, { status: 500 });
  }
}

function getDayKey(dayNumber) {
  const days = {
    1: 'saturday',
    2: 'sunday',
    3: 'monday',
    4: 'tuesday',
    5: 'wednesday',
    6: 'thursday',
    7: 'friday'
  };
  return days[dayNumber] || 'unknown';
}