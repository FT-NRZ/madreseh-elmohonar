import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('🗑️ حذف کاربر با ID:', id);
    
    // بررسی مجوز ادمین
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت یافت نشد' }, 
        { status: 401 }
      );
    }

    // تایید توکن
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' }, 
        { status: 401 }
      );
    }

    // بررسی نقش ادمین
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'شما مجوز این عملیات را ندارید' }, 
        { status: 403 }
      );
    }

    // بررسی معتبر بودن ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر نامعتبر است' }, 
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    try {
      console.log('📊 حذف با raw SQL...');
      
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });

      // ابتدا چک کنیم کاربر وجود داره یا نه
      const checkResult = await pool.query(
        'SELECT u.*, e.role FROM users u LEFT JOIN entrances e ON u.id = e.user_id WHERE u.id = $1',
        [userId]
      );

      if (checkResult.rows.length === 0) {
        await pool.end();
        return NextResponse.json(
          { success: false, message: 'کاربر مورد نظر یافت نشد' }, 
          { status: 404 }
        );
      }

      const userToDelete = checkResult.rows[0];
      console.log('✅ کاربر یافت شد:', userToDelete.first_name, userToDelete.last_name);

      // بررسی اینکه ادمین خودش رو حذف نکنه
      if (userToDelete.id === decoded.id) {
        await pool.end();
        return NextResponse.json(
          { success: false, message: 'شما نمی‌توانید خودتان را حذف کنید' }, 
          { status: 400 }
        );
      }

      // حذف کاربر
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      
      console.log('🗑️ کاربر حذف شد');
      
      await pool.end();

      return NextResponse.json({ 
        success: true, 
        message: `کاربر ${userToDelete.first_name} ${userToDelete.last_name} با موفقیت حذف شد`,
        deletedUser: {
          id: userToDelete.id,
          firstName: userToDelete.first_name,
          lastName: userToDelete.last_name,
          role: userToDelete.role || 'unknown'
        }
      });

    } catch (dbError) {
      console.error('💥 خطای دیتابیس:', dbError);
      
      if (dbError.code === '23503') {
        return NextResponse.json(
          { success: false, message: 'نمی‌توان این کاربر را حذف کرد (دارای اطلاعات مرتبط)' }, 
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'خطا در دیتابیس: ' + dbError.message }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 خطای سرور:', error);
    
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور: ' + error.message }, 
      { status: 500 }
    );
  }
}

// PUT برای ویرایش کاربر
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    console.log('✏️ ویرایش کاربر با ID:', id);
    
    // بررسی مجوز ادمین
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت یافت نشد' }, 
        { status: 401 }
      );
    }

    // تایید توکن
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' }, 
        { status: 401 }
      );
    }

    // بررسی نقش ادمین
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'شما مجوز این عملیات را ندارید' }, 
        { status: 403 }
      );
    }

    // بررسی معتبر بودن ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { success: false, message: 'شناسه کاربر نامعتبر است' }, 
        { status: 400 }
      );
    }

    const userId = parseInt(id);

    // دریافت داده‌های ارسالی
    const body = await request.json();
    const { 
      firstName, 
      lastName, 
      username, 
      password, 
      phone, 
      email,
      role 
    } = body;

    console.log('📝 داده‌های دریافتی:', { firstName, lastName, username, role });

    // اعتبارسنجی داده‌ها
    if (!firstName || !lastName || !username) {
      return NextResponse.json(
        { success: false, message: 'نام، نام خانوادگی و نام کاربری الزامی است' }, 
        { status: 400 }
      );
    }

    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });

      // ابتدا چک کنیم کاربر وجود داره یا نه
      const checkResult = await pool.query(
        'SELECT u.*, e.role FROM users u LEFT JOIN entrances e ON u.id = e.user_id WHERE u.id = $1',
        [userId]
      );

      if (checkResult.rows.length === 0) {
        await pool.end();
        return NextResponse.json(
          { success: false, message: 'کاربر مورد نظر یافت نشد' }, 
          { status: 404 }
        );
      }

      const currentUser = checkResult.rows[0];
      console.log('✅ کاربر یافت شد:', currentUser.first_name, currentUser.last_name);

      // چک کردن تکراری نبودن username (اگر تغییر کرده)
      if (username !== currentUser.username) {
        const usernameCheck = await pool.query(
          'SELECT id FROM users WHERE username = $1 AND id != $2',
          [username, userId]
        );

        if (usernameCheck.rows.length > 0) {
          await pool.end();
          return NextResponse.json(
            { success: false, message: 'این نام کاربری قبلاً استفاده شده است' }, 
            { status: 400 }
          );
        }
      }

      // آپدیت اطلاعات کاربر
      let updateQuery;
      let updateParams;

      if (password && password.trim() !== '') {
        // اگر رمز عبور جدید ارسال شده، hash کن
        const hashedPassword = await bcrypt.hash(password, 10);
        
        updateQuery = `
          UPDATE users 
          SET first_name = $1, last_name = $2, username = $3, password = $4, 
              phone = $5, email = $6, updated_at = NOW()
          WHERE id = $7
          RETURNING id, first_name, last_name, username, phone, email, created_at, updated_at
        `;
        updateParams = [firstName, lastName, username, hashedPassword, phone, email, userId];
      } else {
        // اگر رمز عبور ارسال نشده، همون قبلی رو نگه دار
        updateQuery = `
          UPDATE users 
          SET first_name = $1, last_name = $2, username = $3, 
              phone = $4, email = $5, updated_at = NOW()
          WHERE id = $6
          RETURNING id, first_name, last_name, username, phone, email, created_at, updated_at
        `;
        updateParams = [firstName, lastName, username, phone, email, userId];
      }

      const updateResult = await pool.query(updateQuery, updateParams);
      const updatedUser = updateResult.rows[0];

      // اگر نقش تغییر کرده، جدول entrances رو هم آپدیت کن
      if (role && role !== currentUser.role) {
        await pool.query(
          'UPDATE entrances SET role = $1 WHERE user_id = $2',
          [role, userId]
        );
      }

      console.log('✅ کاربر ویرایش شد');
      
      await pool.end();

      return NextResponse.json({ 
        success: true, 
        message: `کاربر ${updatedUser.first_name} ${updatedUser.last_name} با موفقیت ویرایش شد`,
        user: {
          id: updatedUser.id,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          username: updatedUser.username,
          phone: updatedUser.phone,
          email: updatedUser.email,
          role: role || currentUser.role,
          updatedAt: updatedUser.updated_at
        }
      });

    } catch (dbError) {
      console.error('💥 خطای دیتابیس:', dbError);
      
      if (dbError.code === '23505') {
        return NextResponse.json(
          { success: false, message: 'نام کاربری یا ایمیل تکراری است' }, 
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, message: 'خطا در دیتابیس: ' + dbError.message }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('💥 خطای سرور:', error);
    
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور: ' + error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت یافت نشد' }, 
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' }, 
        { status: 401 }
      );
    }

    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'شما مجوز این عملیات را ندارید' }, 
        { status: 403 }
      );
    }

    try {
      const { Pool } = await import('pg');
      
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL
      });

      const result = await pool.query(
        `SELECT u.id, u.first_name, u.last_name, u.username, u.phone, u.email, 
                u.is_active, u.created_at, u.updated_at, e.role, e.last_login_at,
                s.student_number, s.class_id, s.status as student_status,
                t.teacher_code, t.subject, t.status as teacher_status
         FROM users u 
         LEFT JOIN entrances e ON u.id = e.user_id
         LEFT JOIN students s ON u.id = s.user_id  
         LEFT JOIN teachers t ON u.id = t.user_id
         WHERE u.id = $1`,
        [parseInt(id)]
      );

      if (result.rows.length === 0) {
        await pool.end();
        return NextResponse.json(
          { success: false, message: 'کاربر یافت نشد' }, 
          { status: 404 }
        );
      }

      const user = result.rows[0];
      
      await pool.end();

      return NextResponse.json({ 
        success: true, 
        user: {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          phone: user.phone,
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          lastLogin: user.last_login_at,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          // اطلاعات اضافی بسته به نقش
          studentInfo: user.student_number ? {
            studentNumber: user.student_number,
            classId: user.class_id,
            status: user.student_status
          } : null,
          teacherInfo: user.teacher_code ? {
            teacherCode: user.teacher_code,
            subject: user.subject,
            status: user.teacher_status
          } : null
        }
      });

    } catch (dbError) {
      console.error('💥 خطای دیتابیس:', dbError);
      return NextResponse.json(
        { success: false, message: 'خطا در دیتابیس: ' + dbError.message }, 
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('خطای سرور:', error);
    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' }, 
      { status: 500 }
    );
  }
}