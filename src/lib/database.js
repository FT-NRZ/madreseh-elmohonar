import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

console.log('🔗 DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@'));

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL تعریف نشده است');
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 🔥 اضافه کن
export async function testDatabaseConnection() {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;
    return { 
      ok: true, 
      timestamp: result[0]?.now || new Date(),
      message: 'اتصال به دیتابیس موفق'
    };
  } catch (error) {
    console.error('❌ خطا در تست اتصال:', error.message);
    return { 
      ok: false, 
      error: error.message,
      message: 'اتصال به دیتابیس ناموفق'
    };
  }
}