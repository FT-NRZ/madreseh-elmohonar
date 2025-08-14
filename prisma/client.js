// filepath: c:\Users\Amir\Desktop\madreseh-elmohonar\madreseh-elmohonar\prisma\client.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;