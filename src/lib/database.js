import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const databaseUrl = process.env.DATABASE_URL;

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['warn', 'error'],
  ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {})
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