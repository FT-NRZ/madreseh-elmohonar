import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const gradeId = searchParams.get('gradeId');
    const classId = searchParams.get('classId');

    // ساختن شرایط فیلتر
    let where = {};
    if (classId && classId !== 'all') {
      where.class_id = parseInt(classId);
    } else if (gradeId && gradeId !== 'all') {
      // دریافت همه کلاس‌های این پایه
      const classIds = (
        await prisma.classes.findMany({
          where: { grade_id: parseInt(gradeId) },
          select: { id: true }
        })
      ).map(c => c.id);

      where.class_id = { in: classIds };
    }

    // دریافت تمام برنامه‌های هفتگی معمولی
    const schedules = await prisma.weekly_schedule.findMany({
      where,
      include: {
        classes: {
          include: {
            grades: true
          }
        },
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

    // دریافت کلاس‌های فوق‌العاده مرتبط با همین کلاس‌ها
    let specialWhere = {};
    if (where.class_id) {
      specialWhere.class_id = where.class_id;
    }
    const specialClasses = await prisma.special_classes.findMany({
      where: specialWhere,
      include: {
        classes: {
          include: {
            grades: true
          }
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });

    // دریافت لیست پایه‌ها برای فیلتر
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' }
    });

    // فرمت کردن داده‌های معمولی
    const formattedSchedules = schedules.map(item => ({
      id: item.id,
      day: getDayName(item.day_of_week),
      dayKey: item.day_of_week,
      subject: item.subject,
      time: `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`,
      teacher: item.teachers?.users ?
        `${item.teachers.users.first_name} ${item.teachers.users.last_name}` :
        'نامشخص',
      className: item.classes?.class_name || 'نامشخص',
      gradeName: item.classes?.grades?.grade_name || 'نامشخص',
      gradeLevel: item.classes?.grades?.grade_level || 0,
      classId: item.class_id,
      gradeId: item.classes?.grade_id,
      roomNumber: item.room_number || 'نامشخص',
      type: 'normal'
    }));

    // فرمت کردن داده‌های فوق‌العاده
    const formattedSpecial = specialClasses.map(item => ({
      id: item.id,
      day: getDayName(item.day_of_week),
      dayKey: item.day_of_week,
      subject: item.title,
      time: `${formatTime(item.start_time)} - ${formatTime(item.end_time)}`,
      teacher: 'فوق‌العاده',
      className: item.classes?.class_name || 'نامشخص',
      gradeName: item.classes?.grades?.grade_name || 'نامشخص',
      gradeLevel: item.classes?.grades?.grade_level || 0,
      classId: item.class_id,
      gradeId: item.classes?.grade_id,
      roomNumber: item.room_number || 'نامشخص',
      type: 'special'
    }));

    // ادغام برنامه معمولی و فوق‌العاده
    const allSchedules = [...formattedSchedules, ...formattedSpecial];

    return NextResponse.json({
      success: true,
      schedules: allSchedules,
      grades: grades,
      totalCount: allSchedules.length
    });

  } catch (error) {
    console.error('GET /api/schedules/all error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت برنامه‌های هفتگی', error: error.message },
      { status: 500 }
    );
  }
}

// تابع کمکی برای تبدیل کلید روز به نام فارسی
function getDayName(dayKey) {
  const days = {
    'saturday': 'شنبه',
    'sunday': 'یکشنبه', 
    'monday': 'دوشنبه',
    'tuesday': 'سه‌شنبه',
    'wednesday': 'چهارشنبه',
    'thursday': 'پنج‌شنبه',
    'friday': 'جمعه'
  };
  return days[dayKey] || dayKey;
}

// تابع کمکی برای فرمت کردن زمان
function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}