import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { verifyJWT } from '@/lib/jwt';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('student_id');
    
    if (!studentId) return NextResponse.json({ results: [] });

    // احراز هویت دانش‌آموز
    const token = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded && decoded.role === 'student') {
        // فقط نتایج آزمون‌های معلمان تخصیص‌یافته
        const results = await prisma.exam_results.findMany({
          where: { 
            student_id: Number(studentId),
            exams: {
              teachers: {
                student_teacher: {
                  some: { student_id: Number(studentId) }
                }
              }
            }
          },
          include: { 
            exams: {
              include: {
                teachers: {
                  include: { users: true }
                }
              }
            }
          },
          orderBy: { id: 'desc' }
        });
        return NextResponse.json({ results });
      }
    }

    // اگر احراز هویت نشد، همه نتایج (برای سازگاری قدیمی)
    const results = await prisma.exam_results.findMany({
      where: { student_id: Number(studentId) },
      include: { exams: true },
      orderBy: { id: 'desc' }
    });
    return NextResponse.json({ results });
  } catch (error) {
    console.error('GET /exam-results error:', error);
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
