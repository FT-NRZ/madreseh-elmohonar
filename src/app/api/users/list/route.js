import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // احراز هویت و نقش admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    const payload = verifyJWT(token);
    if (!payload || payload.role !== 'admin') {
      return Response.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // teachers یا students

    let users = [];

    if (role === 'teachers') {
      users = await prisma.teachers.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true
            }
          }
        }
      });

      users = users.map(teacher => ({
        id: teacher.id,
        user_id: teacher.users.id,
        name: `${teacher.users.first_name} ${teacher.users.last_name}`,
        username: teacher.users.username,
        teacher_code: teacher.teacher_code
      }));

    } else if (role === 'students') {
      users = await prisma.students.findMany({
        include: {
          users: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              username: true
            }
          }
        }
      });

      users = users.map(student => ({
        id: student.users.id,
        name: `${student.users.first_name} ${student.users.last_name}`,
        username: student.users.username,
        student_number: student.student_number
      }));
    }

    return Response.json({ success: true, users }, { status: 200 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error fetching users:', error);
    }
    return Response.json({
      success: false,
      error: 'خطا در دریافت کاربران'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}