import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// اتصال به دیتابیس
const pool = new Pool({
  connectionString: "postgresql://postgres:1@localhost:5432/madreseh-elmohonar",
  ssl: false,
});

export async function GET(request) {
  let client;
  try {
    client = await pool.connect();

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');
    const teacherId = searchParams.get('teacher_id');
    const gradeId = searchParams.get('grade_id');

    let query = `
      SELECT 
        sc.id, 
        sc.title, 
        sc.description, 
        sc.class_id, 
        sc.day_of_week, 
        sc.start_time, 
        sc.end_time,
        sc.created_at,
        sc.updated_at,
        COALESCE(c.class_name, 'نامشخص') as class_name,
        COALESCE(g.id, null) as grade_id,
        COALESCE(g.grade_name, 'نامشخص') as grade_name
      FROM special_classes sc
      LEFT JOIN classes c ON sc.class_id = c.id
      LEFT JOIN grades g ON c.grade_id = g.id
    `;
    
    let queryParams = [];
    let whereConditions = [];

    if (gradeId) {
      whereConditions.push(`g.id = $${queryParams.length + 1}`);
      queryParams.push(parseInt(gradeId));
    } else if (teacherId) {
      whereConditions.push(`c.teacher_id = $${queryParams.length + 1}`);
      queryParams.push(parseInt(teacherId));
    } else if (classId) {
      whereConditions.push(`sc.class_id = $${queryParams.length + 1}`);
      queryParams.push(parseInt(classId));
    }

    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY sc.day_of_week, sc.start_time`;

    console.log('🔍 Executing query:', query, 'with params:', queryParams);
    const result = await client.query(query, queryParams);

    const formattedItems = result.rows.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      class_id: item.class_id,
      class_name: item.class_name,
      grade_id: item.grade_id,
      grade_name: item.grade_name,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      created_at: item.created_at,
      updated_at: item.updated_at
    }));

    console.log('✅ Found special classes:', formattedItems.length);

    return NextResponse.json({ 
      success: true, 
      items: formattedItems,
      total: formattedItems.length
    });

  } catch (error) {
    console.error('❌ GET special-classes error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'خطا در دریافت کلاس‌های فوق‌العاده',
      items: []
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    console.log('📥 POST special-classes body:', body);

    const { title, description, class_id, day_of_week, start_time, end_time } = body;
    
    // اعتبارسنجی ورودی‌ها
    if (!title || !day_of_week || !start_time || !end_time) {
      console.log('❌ Missing required fields');
      return NextResponse.json({ 
        success: false, 
        message: 'فیلدهای عنوان، روز هفته، ساعت شروع و پایان الزامی هستند' 
      }, { status: 400 });
    }

    // اعتبارسنجی فرمت زمان
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(start_time) || !timePattern.test(end_time)) {
      console.log('❌ Invalid time format');
      return NextResponse.json({ 
        success: false, 
        message: 'فرمت زمان نامعتبر است. فرمت صحیح: HH:MM' 
      }, { status: 400 });
    }

    client = await pool.connect();
    console.log('✅ Database connected');

    // بررسی وجود کلاس در صورت ارسال class_id
    if (class_id && class_id !== 'null' && class_id !== '' && class_id !== null) {
      try {
        const classExists = await client.query(
          'SELECT id FROM classes WHERE id = $1',
          [parseInt(class_id)]
        );
        if (classExists.rows.length === 0) {
          console.log('❌ Class not found:', class_id);
          return NextResponse.json({ 
            success: false, 
            message: 'کلاس مورد نظر یافت نشد' 
          }, { status: 404 });
        }
        console.log('✅ Class exists:', class_id);
      } catch (classError) {
        console.log('⚠️ Could not verify class:', classError.message);
      }
    }

    // آماده‌سازی داده‌های ورودی
    const insertData = {
      title: title.trim(),
      description: description?.trim() || null,
      class_id: (class_id && class_id !== 'null' && class_id !== '' && class_id !== null) ? parseInt(class_id) : null,
      day_of_week: day_of_week.toLowerCase().trim(),
      start_time: start_time.trim(),
      end_time: end_time.trim()
    };

    console.log('📝 Insert data:', insertData);

    // ✅ اصلاح شده: اضافه کردن created_at و updated_at
    const insertResult = await client.query(`
      INSERT INTO special_classes (title, description, class_id, day_of_week, start_time, end_time, created_at, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
      RETURNING id, title, description, class_id, day_of_week, start_time, end_time, created_at, updated_at
    `, [
      insertData.title,
      insertData.description,
      insertData.class_id,
      insertData.day_of_week,
      insertData.start_time,
      insertData.end_time
    ]);

    const created = insertResult.rows[0];
    console.log('✅ Special class created:', created);

    // دریافت اطلاعات کلاس و پایه (اگر وجود دارد)
    let classInfo = null;
    if (created.class_id) {
      try {
        const classResult = await client.query(`
          SELECT c.class_name, g.id as grade_id, g.grade_name
          FROM classes c
          LEFT JOIN grades g ON c.grade_id = g.id
          WHERE c.id = $1
        `, [created.class_id]);
        
        if (classResult.rows.length > 0) {
          classInfo = classResult.rows[0];
        }
      } catch (classInfoError) {
        console.log('⚠️ Could not fetch class info:', classInfoError.message);
      }
    }

    // فرمت کردن داده خروجی
    const formattedCreated = {
      id: created.id,
      title: created.title,
      description: created.description,
      class_id: created.class_id,
      class_name: classInfo?.class_name || null,
      grade_id: classInfo?.grade_id || null,
      grade_name: classInfo?.grade_name || null,
      day_of_week: created.day_of_week,
      start_time: created.start_time,
      end_time: created.end_time,
      created_at: created.created_at,
      updated_at: created.updated_at
    };

    console.log('🎉 Success response:', formattedCreated);

    return NextResponse.json({ 
      success: true, 
      created: formattedCreated,
      message: 'کلاس فوق‌العاده با موفقیت ایجاد شد'
    });

  } catch (error) {
    console.error('💥 POST special-classes error details:');
    console.error('- Error message:', error.message);
    console.error('- Error code:', error.code);
    console.error('- Error detail:', error.detail);
    console.error('- Full error:', error);
    
    // بررسی خطاهای خاص دیتابیس
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        message: 'کلاس فوق‌العاده با این مشخصات قبلاً ثبت شده است' 
      }, { status: 409 });
    }
    
    if (error.code === '23503') {
      return NextResponse.json({ 
        success: false, 
        message: 'کلاس انتخاب شده معتبر نیست' 
      }, { status: 400 });
    }

    if (error.code === '23502') {
      return NextResponse.json({ 
        success: false, 
        message: 'یک یا چند فیلد اجباری مقدار null دارند' 
      }, { status: 400 });
    }

    if (error.code === '42703') {
      return NextResponse.json({ 
        success: false, 
        message: 'ستون مورد نظر در جدول وجود ندارد. لطفاً ساختار دیتابیس را بررسی کنید.' 
      }, { status: 500 });
    }

    if (error.code === '42P01') {
      return NextResponse.json({ 
        success: false, 
        message: 'جدول کلاس‌های فوق‌العاده وجود ندارد' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: false, 
      message: `خطای دیتابیس: ${error.message}`
    }, { status: 500 });
  } finally {
    if (client) {
      console.log('🔌 Releasing database connection');
      client.release();
    }
  }
}

export async function DELETE(request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        success: false, 
        message: 'شناسه معتبر مورد نیاز است' 
      }, { status: 400 });
    }

    client = await pool.connect();

    // بررسی وجود کلاس فوق‌العاده
    const existingClass = await client.query(
      'SELECT id, title FROM special_classes WHERE id = $1',
      [parseInt(id)]
    );

    if (existingClass.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'کلاس فوق‌العاده یافت نشد' 
      }, { status: 404 });
    }

    const classToDelete = existingClass.rows[0];
    
    await client.query(
      'DELETE FROM special_classes WHERE id = $1',
      [parseInt(id)]
    );
    
    console.log(`✅ Special class deleted: ${classToDelete.title} (ID: ${id})`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'کلاس فوق‌العاده با موفقیت حذف شد',
      deleted_id: parseInt(id)
    });

  } catch (error) {
    console.error('❌ DELETE special-classes error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'خطا در حذف کلاس فوق‌العاده'
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}