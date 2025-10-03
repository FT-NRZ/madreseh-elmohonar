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
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }

    const gradeId = parseInt(params.gradeId);
    
    // دریافت برنامه هفتگی پایه از دیتابیس
    const schedules = await prisma.weekly_schedule.findMany({
      where: {
        classes: {
          grade_id: gradeId
        }
      },
      include: {
        classes: true,
        teachers: {
          include: {
            users: true
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
      dayKey: schedule.day_of_week.toLowerCase(),
      subject: schedule.subject,
      time: `${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`,
      teacher: schedule.teachers?.users 
        ? `${schedule.teachers.users.first_name} ${schedule.teachers.users.last_name}`
        : 'نامشخص',
      className: schedule.classes?.class_name || 'نامشخص',
      room: schedule.room_number || ''
    }));

    return NextResponse.json({
      success: true,
      schedules: formattedSchedules
    });

  } catch (error) {
    console.error('Schedule API Error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'خطای سرور' 
    }, { status: 500 });
  }
}

function formatTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}