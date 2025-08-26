import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');

    if (!classId) {
      return NextResponse.json({ success: false, message: 'شناسه کلاس ارسال نشده است' }, { status: 400 });
    }

    const exams = await prisma.exams.findMany({
      where: { class_id: parseInt(classId) },
      orderBy: { created_at: 'desc' }
    });

    return NextResponse.json({ success: true, exams });
  } catch (error) {
    console.error('💥 Error fetching exams:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}