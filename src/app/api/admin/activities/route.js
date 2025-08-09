import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(request) {
  try {
    // بررسی احراز هویت
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({
        success: false,
        message: 'احراز هویت مورد نیاز است'
      }, { status: 401 });
    }

    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({
        success: false,
        message: 'دسترسی مجاز نیست'
      }, { status: 403 });
    }

    // دریافت آخرین کاربران ایجاد شده
    const recentUsers = await prisma.entrances.findMany({
      include: {
        users: true
      },
      where: {
        is_active: true
      },
      orderBy: {
        created_at: 'desc'
      },
      take: 5
    });

    // تبدیل به فرمت فعالیت
    const activities = recentUsers.map(entrance => ({
      action: `ثبت ${getRoleText(entrance.role)} جدید`,
      user: `${entrance.users.first_name} ${entrance.users.last_name}`,
      time: getRelativeTime(entrance.created_at),
      type: entrance.role
    }));

    // اگر فعالیتی نبود، یک پیام سیستمی اضافه کن
    if (activities.length === 0) {
      activities.push({
        action: 'سیستم راه‌اندازی شد',
        user: 'سیستم',
        time: 'امروز',
        type: 'system'
      });
    }

    return NextResponse.json({
      success: true,
      activities
    });

  } catch (error) {
    console.error('Activities API error:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور: ' + error.message,
      activities: [
        {
          action: 'سیستم راه‌اندازی شد',
          user: 'سیستم',
          time: 'امروز',
          type: 'system'
        }
      ]
    }, { status: 500 });
  }
}

// تابع تبدیل نقش به متن فارسی
function getRoleText(role) {
  switch(role) {
    case 'student': return 'دانش‌آموز';
    case 'teacher': return 'معلم';
    case 'admin': return 'مدیر';
    default: return 'کاربر';
  }
}

// تابع محاسبه زمان نسبی
function getRelativeTime(date) {
  if (!date) return 'نامشخص';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffInMinutes = Math.floor((now - targetDate) / (1000 * 60));

  if (diffInMinutes < 1) return 'هم‌اکنون';
  if (diffInMinutes < 60) return `${diffInMinutes} دقیقه پیش`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ساعت پیش`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} روز پیش`;
  
  return targetDate.toLocaleDateString('fa-IR');
}