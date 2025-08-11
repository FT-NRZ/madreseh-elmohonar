import { PrismaClient } from '@prisma/client';
import { verifyJWT } from '@/lib/jwt';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


// بررسی احراز هویت
async function authenticate(request) {
  const token = request.headers.get('Authorization')?.split(' ')[1];
  if (!token) {
    return { error: 'توکن احراز هویت یافت نشد' };
  }

  const decoded = verifyJWT(token);
  if (!decoded) {
    return { error: 'توکن احراز هویت نامعتبر است' };
  }

  return decoded;
}

// GET: دریافت همه کلاس‌ها
export async function GET(request) {
  try {
    const classes = await prisma.classes.findMany();
    return Response.json({ success: true, classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return Response.json({ success: false, message: 'خطا در دریافت کلاس‌ها' }, { status: 500 });
  }
}

// POST: ایجاد کلاس جدید
export async function POST(request) {
  try {
    const { class_name, class_number, grade_id, teacher_id, capacity, description, academic_year } = await request.json();

    const newClass = await prisma.classes.create({
    data: {
      class_name,
      class_number,
      grade_id: parseInt(grade_id), // اجباری
      teacher_id: teacher_id ? parseInt(teacher_id) : null,
      capacity: parseInt(capacity), // اجباری
      description,
      academic_year,
    },
  });

    return Response.json({ success: true, class: newClass, message: 'کلاس با موفقیت ایجاد شد' }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return Response.json({ success: false, message: 'خطا در ایجاد کلاس' }, { status: 500 });
  }
}

// PUT: ویرایش کلاس موجود
export async function PUT(request) {
  try {
    const decoded = await authenticate(request);
    if (decoded.error) {
      return Response.json({ success: false, message: decoded.error }, { status: 401 });
    }

    const { id, class_name, class_number, grade_id, teacher_id, capacity, description, academic_year } = await request.json();

    const updatedClass = await prisma.classes.update({
      where: { id: parseInt(id) },
      data: {
        class_name,
        class_number,
        grade_id: grade_id ? parseInt(grade_id) : null,
        teacher_id: teacher_id ? parseInt(teacher_id) : null,
        capacity: capacity ? parseInt(capacity) : null,
        description,
        academic_year,
      },
    });

    return Response.json({ success: true, class: updatedClass, message: 'کلاس با موفقیت ویرایش شد' });
  } catch (error) {
    console.error('Error updating class:', error);
    return Response.json({ success: false, message: 'خطا در ویرایش کلاس' }, { status: 500 });
  }
}

// DELETE: حذف کلاس
export async function DELETE(request) {
  try {
    const decoded = await authenticate(request);
    if (decoded.error) {
      return Response.json({ success: false, message: decoded.error }, { status: 401 });
    }

    const { id } = await request.json();

    await prisma.classes.delete({
      where: { id: parseInt(id) },
    });

    return Response.json({ success: true, message: 'کلاس با موفقیت حذف شد' });
  } catch (error) {
    console.error('Error deleting class:', error);
    return Response.json({ success: false, message: 'خطا در حذف کلاس' }, { status: 500 });
  }
}