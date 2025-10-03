import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// اتصال به دیتابیس
const pool = new Pool({
  connectionString: "postgresql://postgres:1@localhost:5432/madreseh-elmohonar",
  ssl: false,
});

// تابع بررسی توکن و نقش ادمین
function verifyAdmin(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }
    const token = authHeader.replace('Bearer ', '');
    if (!process.env.JWT_SECRET) {
      return false;
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded && decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}

// دریافت لیست پیش‌ثبت‌نام‌ها (فقط برای ادمین)
export async function GET(request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      SELECT 
        p.id, 
        p.first_name, 
        p.last_name, 
        COALESCE(g.grade_name, 'نامشخص') as grade,
        p.phone, 
        p.status, 
        p.created_at, 
        p.updated_at 
      FROM pre_registrations p
      LEFT JOIN grades g ON p.grade_interest = g.id
      ORDER BY p.created_at DESC
    `);

    return NextResponse.json({ 
      success: true, 
      preRegistrations: result.rows 
    });

  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'خطا در دریافت اطلاعات',
      preRegistrations: []
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

// ثبت پیش‌ثبت‌نام جدید (بدون نیاز به توکن)
export async function POST(request) {
  let client;
  
  try {
    const body = await request.json();
    const { first_name, last_name, grade, phone } = body;

    // اعتبارسنجی ورودی‌ها
    if (!first_name || !last_name || !grade || !phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'همه فیلدها الزامی هستند' 
      }, { status: 400 });
    }

    // اعتبارسنجی شماره تلفن
    if (!/^09\d{9}$/.test(phone.trim())) {
      return NextResponse.json({ 
        success: false, 
        error: 'شماره تماس نامعتبر است' 
      }, { status: 400 });
    }

    client = await pool.connect();

    // پیدا کردن ID پایه تحصیلی
    let gradeId = null;
    if (grade) {
      const gradeResult = await client.query(
        'SELECT id FROM grades WHERE grade_name = $1',
        [grade]
      );
      if (gradeResult.rows.length > 0) {
        gradeId = gradeResult.rows[0].id;
      }
    }

    // بررسی تکراری نبودن شماره تماس
    const existingCheck = await client.query(
      'SELECT id FROM pre_registrations WHERE phone = $1',
      [phone.trim()]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'این شماره تماس قبلاً ثبت شده است' 
      }, { status: 409 });
    }

    // ثبت پیش‌ثبت‌نام با استفاده از grade_interest
    const insertResult = await client.query(`
      INSERT INTO pre_registrations (first_name, last_name, grade_interest, phone, status) 
      VALUES ($1, $2, $3, $4, 'pending') 
      RETURNING id, first_name, last_name, grade_interest, phone, status, created_at
    `, [
      first_name.trim(), 
      last_name.trim(), 
      gradeId,
      phone.trim()
    ]);

    const newRecord = insertResult.rows[0];

    return NextResponse.json({ 
      success: true, 
      message: 'پیش‌ثبت‌نام با موفقیت انجام شد',
      registration: {
        ...newRecord,
        grade: grade
      }
    });

  } catch (error) {
    // بررسی نوع خطا
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        error: 'این شماره تماس قبلاً ثبت شده است' 
      }, { status: 409 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ثبت اطلاعات' 
    }, { status: 500 });
    
  } finally {
    if (client) {
      client.release();
    }
  }
}