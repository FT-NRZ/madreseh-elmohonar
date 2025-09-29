import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// اتصال به دیتابیس با connectionString
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1@localhost:5432/madreseh-elmohonar?schema=public",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// تابع بررسی توکن و نقش ادمین
function verifyAdmin(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return false;
  const token = authHeader.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

// دریافت اطلاعات یک پیش‌ثبت‌نام با ID مشخص
export async function GET(request, { params }) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;

    client = await pool.connect();

    const result = await client.query(
      `SELECT id, first_name, last_name, grade, phone, status, created_at, updated_at 
       FROM pre_registrations 
       WHERE id = $1`,
      [parseInt(id)]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      registration: result.rows[0] 
    });

  } catch (error) {
    console.error('💥 Get pre-registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور داخلی' 
    }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// به‌روزرسانی وضعیت یک پیش‌ثبت‌نام
export async function PUT(request, { params }) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    // اعتبارسنجی وضعیت
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'وضعیت نامعتبر است' 
      }, { status: 400 });
    }

    client = await pool.connect();

    // بررسی وجود درخواست
    const checkResult = await client.query(
      'SELECT id FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    // به‌روزرسانی وضعیت
    const updateResult = await client.query(
      `UPDATE pre_registrations 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING id, first_name, last_name, grade, phone, status, created_at, updated_at`,
      [status, parseInt(id)]
    );

    const updatedRegistration = updateResult.rows[0];
    console.log(`✅ Pre-registration ${id} status updated to ${status}`);

    return NextResponse.json({ 
      success: true, 
      message: 'وضعیت به‌روزرسانی شد',
      registration: updatedRegistration 
    });

  } catch (error) {
    console.error('💥 Update pre-registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور' 
    }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}

// حذف یک پیش‌ثبت‌نام
export async function DELETE(request, { params }) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;

    client = await pool.connect();

    // بررسی وجود درخواست
    const checkResult = await client.query(
      'SELECT id FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    // حذف درخواست
    await client.query(
      'DELETE FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    console.log(`✅ Pre-registration ${id} deleted`);

    return NextResponse.json({ 
      success: true, 
      message: 'درخواست حذف شد' 
    });

  } catch (error) {
    console.error('💥 Delete pre-registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور' 
    }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}