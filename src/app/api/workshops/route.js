export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 دریافت کارگاه‌ها از elmohonar...');

    const dbInfo = await prisma.$queryRaw`SELECT current_database() AS db`;
    console.log('🗄️ کارگاه‌ها از دیتابیس:', dbInfo[0]?.db);

    const workshops = await prisma.workshops.findMany({
      select: { 
        id: true, 
        workshop_name: true, 
        description: true, 
        icon: true,
        is_active: true
      },
      where: { is_active: true },
      orderBy: { workshop_name: 'asc' }
    });

    console.log('✅ تعداد کارگاه‌ها:', workshops.length);

    return NextResponse.json({
      success: true,
      workshops: workshops.map(w => ({
        id: w.id,
        workshop_name: w.workshop_name,
        description: w.description,
        icon: w.icon,
        is_active: w.is_active
      }))
    });

  } catch (err) {
    console.error('❌ خطا در دریافت کارگاه‌ها:', err);
    return NextResponse.json({ 
      success: false, 
      workshops: [], 
      error: err.message 
    }, { status: 500 });
  }
}