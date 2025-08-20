import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database'; 


export async function GET(request) {
  try {
    // دریافت تمام برنامه‌های هفتگی
    const schedules = await prisma.weekly_schedule.findMany({
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

    console.log('Found schedules:', schedules.length);
    return NextResponse.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('GET /api/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در دریافت برنامه‌های هفتگی', error: error.message },
      { status: 500 }
    );
  }
}

function timeStringToDate(timeStr) {
  if (!timeStr) return null;
  // اگر رشته ISO است، مستقیم تبدیل کن
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(timeStr)) {
    const d = new Date(timeStr);
    return isNaN(d.getTime()) ? null : d;
  }
  // اگر رشته ساعت است، تبدیل کن
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return new Date(`1970-01-01T${timeStr}:00.000Z`);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('POST body received:', body);
    
    const { class_id, day, subject, start_time, end_time } = body;
    
    if (!class_id || !day || !subject || !start_time || !end_time) {
      console.error('Missing required fields:', { class_id, day, subject, start_time, end_time });
      return NextResponse.json(
        { success: false, message: 'فیلدهای اجباری کامل نیست' },
        { status: 400 }
      );
    }

    const scheduleData = {
      class_id: parseInt(class_id),
      day_of_week: day,
      subject: subject,
      start_time: timeStringToDate(start_time),
      end_time: timeStringToDate(end_time),
      teacher_id: null 
    };

    console.log('Schedule data to be created:', scheduleData);

    const newSchedule = await prisma.weekly_schedule.create({
      data: scheduleData,
      include: {
        classes: {
          include: {
            grades: true
          }
        }
      }
    });
    
    console.log('Schedule created successfully:', newSchedule);
    return NextResponse.json({ 
      success: true, 
      message: 'برنامه هفتگی با موفقیت ایجاد شد',
      schedule: newSchedule 
    });
  } catch (error) {
    console.error('POST /api/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ثبت برنامه هفتگی', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه جلسه مشخص نیست' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('PUT - ID:', id, 'Body:', body);
    
    const { class_id, day_of_week, subject, start_time, end_time } = body;
    
    if (!subject || !start_time || !end_time) {
      return NextResponse.json(
        { success: false, message: 'فیلدهای اجباری کامل نیست' },
        { status: 400 }
      );
    }

    const updateData = {
      subject: subject,
      start_time: timeStringToDate(start_time),
      end_time: timeStringToDate(end_time)
    };

    if (!updateData.start_time || !updateData.end_time) {
      return NextResponse.json(
        { success: false, message: 'زمان شروع یا پایان نامعتبر است' },
        { status: 400 }
      );
    }

    if (class_id) updateData.class_id = parseInt(class_id);
    if (day_of_week) updateData.day_of_week = day_of_week;

    const updated = await prisma.weekly_schedule.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        classes: {
          include: {
            grades: true
          }
        }
      }
    });
    
    console.log('Schedule updated successfully:', updated);
    return NextResponse.json({ 
      success: true, 
      message: 'برنامه با موفقیت ویرایش شد',
      schedule: updated 
    });
  } catch (error) {
    console.error('PUT /api/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در ویرایش برنامه هفتگی', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'شناسه جلسه مشخص نیست' },
        { status: 400 }
      );
    }

    await prisma.weekly_schedule.delete({ 
      where: { id: parseInt(id) } 
    });
    
    console.log('Schedule deleted successfully - ID:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'جلسه با موفقیت حذف شد' 
    });
  } catch (error) {
    console.error('DELETE /api/schedule error:', error);
    return NextResponse.json(
      { success: false, message: 'خطا در حذف جلسه', error: error.message },
      { status: 500 }
    );
  }
}