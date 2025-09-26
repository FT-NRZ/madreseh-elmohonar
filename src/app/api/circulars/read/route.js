import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { circular_id, teacher_id } = body;
    
    // بررسی اینکه قبلاً خوانده شده یا نه
    const existingRead = await prisma.circular_reads.findFirst({
      where: {
        circular_id: parseInt(circular_id),
        teacher_id: parseInt(teacher_id)
      }
    });
    
    if (!existingRead) {
      await prisma.circular_reads.create({
        data: {
          circular_id: parseInt(circular_id),
          teacher_id: parseInt(teacher_id),
        }
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking circular as read:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در علامت‌گذاری خواندن',
      details: error.message 
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}