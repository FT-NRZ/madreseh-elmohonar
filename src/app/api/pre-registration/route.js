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
  console.log('🔍 Checking admin access...');
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('📝 Auth header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid Authorization header format');
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ JWT_SECRET not found in environment');
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded successfully, role:', decoded.role);
    return decoded && decoded.role === 'admin';
  } catch (error) {
    console.log('❌ JWT verification failed:', error.message);
    return false;
  }
}

// دریافت لیست پیش‌ثبت‌نام‌ها (فقط برای ادمین)
export async function GET(request) {
  console.log('🚀 GET /api/pre-registration called');
  
  if (!verifyAdmin(request)) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز - ابتدا وارد حساب ادمین شوید' 
    }, { status: 403 });
  }

  let client;
  try {
    console.log('🔗 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Database connected successfully');

    const result = await client.query(`
      SELECT id, first_name, last_name, grade, phone, status, created_at, updated_at 
      FROM pre_registrations 
      ORDER BY created_at DESC
    `);

    console.log('✅ Query executed successfully, found', result.rows.length, 'records');

    return NextResponse.json({ 
      success: true, 
      preRegistrations: result.rows 
    });

  } catch (error) {
    console.error('💥 Database error:', error.message);
    console.error('Full error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور: ' + error.message,
      preRegistrations: []
    }, { status: 500 });
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}

// ثبت پیش‌ثبت‌نام جدید (بدون نیاز به توکن)
export async function POST(request) {
  console.log('📝 POST /api/pre-registration called');
  let client;
  try {
    const body = await request.json();
    const { first_name, last_name, grade, phone } = body;

    // اعتبارسنجی
    if (!first_name || !last_name || !grade || !phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'همه فیلدها الزامی هستند' 
      }, { status: 400 });
    }

    client = await pool.connect();

    // بررسی تکراری نبودن شماره تماس
    const existingCheck = await client.query(
      'SELECT id FROM pre_registrations WHERE phone = $1',
      [phone]
    );

    if (existingCheck.rows.length > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'این شماره تماس قبلاً ثبت شده است' 
      }, { status: 409 });
    }

    // ثبت پیش‌ثبت‌نام
    const insertResult = await client.query(`
      INSERT INTO pre_registrations (first_name, last_name, grade, phone, status) 
      VALUES ($1, $2, $3, $4, 'pending') 
      RETURNING id
    `, [first_name.trim(), last_name.trim(), grade, phone.trim()]);

    const newId = insertResult.rows[0].id;
    console.log('✅ New pre-registration created with ID:', newId);

    // لاگ واضح اضافه شد
    console.log('ثبت شد!', {
      id: newId,
      first_name,
      last_name,
      grade,
      phone
    });

    return NextResponse.json({ 
      success: true, 
      message: 'پیش‌ثبت‌نام با موفقیت انجام شد',
      id: newId 
    });

  } catch (error) {
    console.error('💥 Pre-registration error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور داخلی' 
    }, { status: 500 });
  } finally {
    if (client) client.release();
  }
}