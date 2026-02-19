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