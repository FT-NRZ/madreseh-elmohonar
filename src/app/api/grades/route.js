export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    console.log('🔍 شروع دریافت grades از elmohonar...');
    
    // اطمینان از اتصال به دیتابیس صحیح
    const dbInfo = await prisma.$queryRaw`SELECT current_database() AS db, current_user AS usr`;
    console.log('🗄️ متصل به دیتابیس:', dbInfo[0]?.db, 'کاربر:', dbInfo[0]?.usr);
    
    if (dbInfo[0]?.db !== 'elmohonar') {
      console.error('❌ اتصال به دیتابیس اشتباه! متصل به:', dbInfo[0]?.db, 'باید elmohonar باشد');
      return NextResponse.json({ 
        success: false, 
        grades: [], 
        error: `اتصال به دیتابیس اشتباه: ${dbInfo[0]?.db}` 
      }, { status: 500 });
    }

    const cnt = await prisma.$queryRaw`SELECT COUNT(*)::int AS total FROM grades`;
    console.log('📊 تعداد پایه‌ها در elmohonar:', cnt[0]?.total);

    if (cnt[0]?.total === 0) {
      console.log('⚠️ جدول grades در elmohonar خالی است');
      return NextResponse.json({ 
        success: true, 
        grades: [], 
        message: 'جدول grades خالی است - نیاز به seed' 
      });
    }

    const rows = await prisma.grades.findMany({
      select: { id: true, grade_name: true, grade_level: true, description: true },
      orderBy: [{ grade_level: 'asc' }, { id: 'asc' }]
    });

    console.log('✅ دریافت شد:', rows.length, 'پایه');

    return NextResponse.json({
      success: true,
      grades: rows.map(g => ({
        id: g.id,
        name: g.grade_name,
        level: g.grade_level,
        description: g.description,
        grade_name: g.grade_name,
        grade_level: g.grade_level
      })),
      database: dbInfo[0]?.db,
      total: rows.length
    });

  } catch (err) {
    console.error('❌ /api/grades خطا:', err?.message);
    return NextResponse.json({ 
      success: false, 
      grades: [], 
      error: err?.message 
    }, { status: 500 });
  }
}