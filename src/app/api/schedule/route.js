import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

function convertTimeToTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const now = new Date();
  now.setHours(hours);
  now.setMinutes(minutes);
  now.setSeconds(0);
  now.setMilliseconds(0);
  return now;
}

// POST: ایجاد برنامه هفتگی
export async function POST(request) {
  try {
    const { class_id, day, subject, start_time, end_time, teacher_id } = await request.json();

    console.log('Received Data:', { class_id, day, subject, start_time, end_time, teacher_id });

    // اعتبارسنجی داده‌ها
    if (!class_id || !day || !subject || !start_time || !end_time) {
      return Response.json({ success: false, message: 'لطفاً تمام فیلدهای اجباری را پر کنید' }, { status: 400 });
    }

    // ایجاد برنامه هفتگی
    const newSchedule = await prisma.weekly_schedule.create({
      data: {
        class_id: parseInt(class_id),
        day_of_week: day,
        subject,
        start_time: convertTimeToTime(start_time),
        end_time: convertTimeToTime(end_time),
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
      },
    });

    console.log('New Schedule Created:', newSchedule);

    return Response.json({ success: true, schedule: newSchedule, message: 'برنامه هفتگی با موفقیت ایجاد شد' }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return Response.json({ 
      success: false, 
      message: 'خطا در ایجاد برنامه هفتگی',
      error: error.message 
    }, { status: 500 });
  }
}

// GET: دریافت برنامه هفتگی
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const class_id = searchParams.get('class_id');

    // دریافت برنامه هفتگی برای یک کلاس خاص
    const schedules = await prisma.weekly_schedule.findMany({
      where: class_id ? { class_id: parseInt(class_id) } : undefined,
      include: {
        classes: true,
        teachers: {
          select: {
            id: true,
            users: {
              select: {
                first_name: true,
                last_name: true,
              },
            },
          },
        },
      },
      orderBy: { start_time: 'asc' },
    });

    return Response.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return Response.json({ success: false, message: 'خطا در دریافت برنامه هفتگی' }, { status: 500 });
  }
}

// PUT: ویرایش برنامه هفتگی
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const { subject, start_time, end_time } = await request.json();

    if (!id) {
      return Response.json({ success: false, message: 'شناسه جلسه ارسال نشده' }, { status: 400 });
    }

    const updated = await prisma.weekly_schedule.update({
      where: { id: parseInt(id) },
      data: {
        subject,
        start_time: convertTimeToTime(start_time),
        end_time: convertTimeToTime(end_time),
      },
    });

    return Response.json({ success: true, schedule: updated, message: 'ویرایش با موفقیت انجام شد' });
  } catch (error) {
    return Response.json({ success: false, message: 'خطا در ویرایش', error: error.message }, { status: 500 });
  }
}

// DELETE: حذف برنامه هفتگی
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ success: false, message: 'شناسه جلسه ارسال نشده' }, { status: 400 });
    }
    await prisma.weekly_schedule.delete({ where: { id: parseInt(id) } });
    return Response.json({ success: true, message: 'جلسه با موفقیت حذف شد' });
  } catch (error) {
    return Response.json({ success: false, message: 'خطا در حذف', error: error.message }, { status: 500 });
  }
}