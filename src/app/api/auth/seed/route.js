export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// مقدار پیش‌فرض امن عوضش کن در production
const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET || 'change-this-secret-key-in-production';

// درخواست باید شامل secret باشه
const bodySchema = z.object({
  secret: z.string().min(8),
  phone: z.string().optional(),
  nationalCode: z.string().optional()
});

export async function POST(request) {
  try {
    const raw = await request.text();
    const parsed = raw ? JSON.parse(raw) : {};
    const result = bodySchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json({ success: false, message: 'Bad request' }, { status: 400 });
    }
    const { secret, phone = '09123456789', nationalCode = '0123456789' } = result.data;
    if (secret !== ADMIN_SEED_SECRET) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🌱 Seed admin started...');

    // بررسی اینکه آیا قبلاً ساخته شده
    const existingEntrance = await prisma.entrances.findFirst({
      where: { national_code: nationalCode }
    });
    if (existingEntrance) {
      console.log('ℹ️ Admin already exists');
      return NextResponse.json({ success: true, message: 'Admin already exists', created: false });
    }

    // ایجاد user و entrance به صورت ایمن
    const user = await prisma.users.create({
      data: {
        first_name: 'مدیر',
        last_name: 'سیستم',
        phone,
        email: 'admin@elmohonar.ir',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ User created with ID:', user.id);

    // از hash ثابت bcrypt استفاده شده (رمز: admin123456)
    const passwordHash = '$2b$12$cNgoIbJZv4taghcHCRme8OABirNq.8ue6tcf8L8kVfj291IvaBkkG';

    await prisma.entrances.create({
      data: {
        user_id: user.id,
        national_code: nationalCode,
        password_hash: passwordHash,
        role: 'admin',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    console.log('✅ Admin entrance created for national_code:', nationalCode);

    return NextResponse.json({ 
      success: true, 
      message: 'Admin created successfully', 
      created: true,
      credentials: {
        nationalCode: nationalCode,
        password: 'admin123456',
        userType: 'admin'
      }
    });
  } catch (err) {
    console.error('❌ Seed error:', err?.message || err);
    return NextResponse.json({ success: false, message: 'Server error: ' + err.message }, { status: 500 });
  }
}