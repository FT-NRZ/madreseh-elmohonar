import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request) {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));
    
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');
    const where = {};
    if (classId) where.class_id = parseInt(classId);

    const items = await prisma.special_classes.findMany({
      where,
      orderBy: [{ day_of_week: 'asc' }, { start_time: 'asc' }]
    });
    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('GET special-classes error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    console.log('Available Prisma models:', Object.keys(prisma));
    
    const body = await request.json();
    console.log('POST body:', body);

    const { title, description, class_id, day_of_week, start_time, end_time } = body;
    if (!title || !day_of_week || !start_time || !end_time) {
      return NextResponse.json({ success: false, message: 'اطلاعات ناقص است' }, { status: 400 });
    }
    
    const created = await prisma.special_classes.create({
      data: {
        title,
        description: description || null,
        class_id: class_id ? parseInt(class_id) : null,
        day_of_week,
        start_time,
        end_time
      }
    });
    return NextResponse.json({ success: true, created });
  } catch (error) {
    console.error('POST special-classes error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'شناسه مورد نیاز است' }, { status: 400 });
    }
    
    await prisma.special_classes.delete({
      where: { id: parseInt(id) }
    });
    
    return NextResponse.json({ success: true, message: 'کلاس فوق‌العاده حذف شد' });
  } catch (error) {
    console.error('DELETE special-classes error:', error);
    return NextResponse.json({ success: false, message: 'خطا در حذف کلاس فوق‌العاده' }, { status: 500 });
  }
}
