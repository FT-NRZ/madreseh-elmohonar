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
  console.log('🔍 [ID Route] Checking admin access...');
  try {
    const authHeader = request.headers.get('Authorization');
    console.log('📝 [ID Route] Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [ID Route] Invalid Authorization header format');
      return false;
    }
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 [ID Route] JWT_SECRET exists:', !!process.env.JWT_SECRET);
    
    if (!process.env.JWT_SECRET) {
      console.log('❌ [ID Route] JWT_SECRET not found in environment');
      return false;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ [ID Route] Token decoded successfully, role:', decoded.role);
    return decoded && decoded.role === 'admin';
  } catch (error) {
    console.log('❌ [ID Route] JWT verification failed:', error.message);
    return false;
  }
}

// به‌روزرسانی وضعیت یک پیش‌ثبت‌نام
export async function PUT(request, { params }) {
  console.log('🚀 PUT /api/pre-registration/[id] called');
  console.log('📋 Params:', params);
  
  if (!verifyAdmin(request)) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;
    console.log('🔄 Updating pre-registration with ID:', id);
    
    if (!id || isNaN(parseInt(id))) {
      console.log('❌ Invalid ID provided:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه نامعتبر است' 
      }, { status: 400 });
    }
    
    const body = await request.json();
    console.log('📋 Request body received:', body);
    
    const { status } = body;

    // اعتبارسنجی وضعیت - استفاده مستقیم از مقادیر
    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      console.log('❌ Invalid status:', status);
      return NextResponse.json({ 
        success: false, 
        error: 'وضعیت نامعتبر است. باید یکی از موارد approved، rejected یا pending باشد' 
      }, { status: 400 });
    }

    console.log('🔗 Connecting to database...');
    client = await pool.connect();
    console.log('✅ Database connected successfully');

    // بررسی constraint های موجود
    console.log('🔍 Checking current constraints...');
    try {
      const constraintResult = await client.query(`
        SELECT pg_get_constraintdef(con.oid) AS constraint_definition
        FROM pg_constraint con
        JOIN pg_class rel ON rel.oid = con.conrelid
        JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
        WHERE nsp.nspname = 'public'
        AND rel.relname = 'pre_registrations'
        AND con.conname LIKE '%status%'
      `);
      
      if (constraintResult.rows.length > 0) {
        console.log('📋 Current constraint:', constraintResult.rows[0].constraint_definition);
      } else {
        console.log('📋 No status constraint found');
      }
    } catch (constraintError) {
      console.log('⚠️ Could not check constraints:', constraintError.message);
    }

    // بررسی وجود درخواست
    console.log('🔍 Checking if pre-registration exists...');
    const checkResult = await client.query(
      'SELECT id, status FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Pre-registration not found with ID:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست با این شناسه یافت نشد' 
      }, { status: 404 });
    }

    const currentRecord = checkResult.rows[0];
    console.log('📄 Current record:', currentRecord);

    // تست امکان update با مقدار جدید
    console.log('🧪 Testing status update...');
    console.log('💾 Updating status from', currentRecord.status, 'to', status);
    
    // به‌روزرسانی وضعیت
    const updateResult = await client.query(`
      UPDATE pre_registrations 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 
      RETURNING id, first_name, last_name, grade_interest, phone, status, created_at, updated_at
    `, [status, parseInt(id)]);

    if (updateResult.rows.length === 0) {
      console.log('❌ Update failed - no rows affected');
      return NextResponse.json({ 
        success: false, 
        error: 'به‌روزرسانی ناموفق بود' 
      }, { status: 500 });
    }

    const updatedRecord = updateResult.rows[0];
    console.log('✅ Pre-registration updated successfully:', updatedRecord);

    // دریافت نام پایه برای response
    let gradeName = 'نامشخص';
    if (updatedRecord.grade_interest) {
      try {
        const gradeResult = await client.query(
          'SELECT grade_name FROM grades WHERE id = $1',
          [updatedRecord.grade_interest]
        );
        if (gradeResult.rows.length > 0) {
          gradeName = gradeResult.rows[0].grade_name;
        }
      } catch (gradeError) {
        console.log('⚠️ Could not fetch grade name:', gradeError.message);
      }
    }

    const responseData = {
      ...updatedRecord,
      grade: gradeName
    };

    console.log(`✅ Pre-registration ${id} status updated from ${currentRecord.status} to ${status}`);

    return NextResponse.json({ 
      success: true, 
      message: `وضعیت به ${status === 'approved' ? 'تأیید شده' : status === 'rejected' ? 'رد شده' : 'در انتظار'} تغییر یافت`,
      registration: responseData 
    });

  } catch (error) {
    console.log('Update pre-registration error:', error.message);
    if (error.code === '23514') {
      return NextResponse.json({ success: false, error: 'وضعیت نامعتبر بر اساس محدودیت دیتابیس' }, { status: 400 });
    }
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'تداخل داده‌ها' }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: 'خطای سرور: ' + error.message }, { status: 500 });
  }
}

// دریافت اطلاعات یک پیش‌ثبت‌نام با ID مشخص
export async function GET(request, { params }) {
  console.log('🚀 GET /api/pre-registration/[id] called');
  
  if (!verifyAdmin(request)) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;
    console.log('🔍 Looking for pre-registration with ID:', id);

    if (!id || isNaN(parseInt(id))) {
      console.log('❌ Invalid ID provided:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه نامعتبر است' 
      }, { status: 400 });
    }

    client = await pool.connect();
    console.log('✅ Database connected successfully');

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
      WHERE p.id = $1
    `, [parseInt(id)]);

    console.log('✅ Query executed, found', result.rows.length, 'records');

    if (result.rows.length === 0) {
      console.log('❌ Pre-registration not found');
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
    console.log('💥 Get pre-registration error:', error.message);
    console.log('Full error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور داخلی: ' + error.message 
    }, { status: 500 });
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}

// حذف یک پیش‌ثبت‌نام
export async function DELETE(request, { params }) {
  console.log('🚀 DELETE /api/pre-registration/[id] called');
  
  if (!verifyAdmin(request)) {
    console.log('❌ Admin access denied');
    return NextResponse.json({ 
      success: false, 
      error: 'دسترسی غیرمجاز' 
    }, { status: 403 });
  }

  let client;
  try {
    const { id } = params;
    console.log('🗑️ Deleting pre-registration with ID:', id);

    if (!id || isNaN(parseInt(id))) {
      console.log('❌ Invalid ID provided:', id);
      return NextResponse.json({ 
        success: false, 
        error: 'شناسه نامعتبر است' 
      }, { status: 400 });
    }

    client = await pool.connect();
    console.log('✅ Database connected successfully');

    // بررسی وجود درخواست
    const checkResult = await client.query(
      'SELECT id, first_name, last_name FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    if (checkResult.rows.length === 0) {
      console.log('❌ Pre-registration not found');
      return NextResponse.json({ 
        success: false, 
        error: 'درخواست یافت نشد' 
      }, { status: 404 });
    }

    const recordToDelete = checkResult.rows[0];
    console.log('📄 Record to delete:', recordToDelete);

    // حذف درخواست
    const deleteResult = await client.query(
      'DELETE FROM pre_registrations WHERE id = $1',
      [parseInt(id)]
    );

    if (deleteResult.rowCount === 0) {
      console.log('❌ Delete failed - no rows affected');
      return NextResponse.json({ 
        success: false, 
        error: 'حذف ناموفق بود' 
      }, { status: 500 });
    }

    console.log(`✅ Pre-registration ${id} (${recordToDelete.first_name} ${recordToDelete.last_name}) deleted successfully`);

    return NextResponse.json({ 
      success: true, 
      message: 'درخواست با موفقیت حذف شد' 
    });

  } catch (error) {
    console.log('💥 Delete pre-registration error:', error.message);
    console.log('Full error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور: ' + error.message 
    }, { status: 500 });
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}

export async function PATCH(request, { params }) {
  console.log('🔄 PATCH redirecting to PUT');
  return PUT(request, { params });
}