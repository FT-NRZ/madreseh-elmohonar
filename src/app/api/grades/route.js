import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET() {
  try {
    const grades = await prisma.grades.findMany({
      orderBy: { grade_level: 'asc' }
    });
    
    return NextResponse.json({
      success: true,
      grades
    });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({
      success: false,
      grades: []
    }, { status: 500 });
  }
}
