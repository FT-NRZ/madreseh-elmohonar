import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request) {
  try {
    // دریافت تمام پایه‌ها از جدول grades
    const grades = await prisma.grades.findMany({
      orderBy: { id: 'asc' } // مرتب‌سازی بر اساس id
    });

    return Response.json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return Response.json({ success: false, message: 'خطا در دریافت پایه‌ها' }, { status: 500 });
  }
}