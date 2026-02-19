import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const rawUrl = process.env.DATABASE_URL;
const wantSSL = process.env.DB_SSL === 'true' && !/sslmode=disable/i.test(rawUrl || '');

const createPool = (sslEnabled) => new Pool({
  connectionString: rawUrl,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false
});

let pool = globalThis.__SPECIAL_POOL || createPool(wantSSL);
globalThis.__SPECIAL_POOL = pool;

async function getClient() {
  try {
    return await pool.connect();
  } catch (e) {
    if (/SSL/i.test(e.message)) {
      pool = createPool(false);
      globalThis.__SPECIAL_POOL = pool;
      return await pool.connect();
    }
    throw e;
  }
}

const validDays = ['saturday','sunday','monday','tuesday','wednesday','thursday','friday'];

export async function GET(request) {
  let client;
  try {
    client = await getClient();
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');
    const teacherId = searchParams.get('teacher_id');
    const gradeId = searchParams.get('grade_id');

    let query = `
      SELECT 
        sc.id, sc.title, sc.description, sc.class_id, sc.day_of_week,
        sc.start_time, sc.end_time, sc.created_at, sc.updated_at,
        COALESCE(c.class_name,'نامشخص') AS class_name,
        g.id AS grade_id,
        COALESCE(g.grade_name,'نامشخص') AS grade_name
      FROM special_classes sc
      LEFT JOIN classes c ON sc.class_id = c.id
      LEFT JOIN grades g ON c.grade_id = g.id
    `;
    const params = [];
    const where = [];
    if (gradeId) { where.push(`g.id = $${params.length + 1}`); params.push(+gradeId); }
    else if (teacherId) { where.push(`c.teacher_id = $${params.length + 1}`); params.push(+teacherId); }
    else if (classId) { where.push(`sc.class_id = $${params.length + 1}`); params.push(+classId); }
    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY sc.day_of_week, sc.start_time';

    const result = await client.query(query, params);
    return NextResponse.json({
      success: true,
      items: result.rows.map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        class_id: r.class_id,
        class_name: r.class_name,
        grade_id: r.grade_id,
        grade_name: r.grade_name,
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
        created_at: r.created_at,
        updated_at: r.updated_at
      })),
      total: result.rows.length
    });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message || 'خطا در دریافت' }, { status: 500 });
  } finally {
    client && client.release();
  }
}

export async function POST(request) {
  let client;
  try {
    const body = await request.json();
    const { title, description, class_id, day_of_week, start_time, end_time } = body;

    if (!title || !day_of_week || !start_time || !end_time) {
      return NextResponse.json({ success: false, message: 'فیلدهای الزامی ناقص است' }, { status: 400 });
    }
    const dw = day_of_week.toLowerCase().trim();
    if (!validDays.includes(dw)) {
      return NextResponse.json({ success: false, message: 'روز هفته نامعتبر است' }, { status: 400 });
    }
    const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timePattern.test(start_time) || !timePattern.test(end_time)) {
      return NextResponse.json({ success: false, message: 'فرمت زمان معتبر نیست (HH:MM)' }, { status: 400 });
    }
    if (start_time >= end_time) {
      return NextResponse.json({ success: false, message: 'زمان پایان باید بعد از شروع باشد' }, { status: 400 });
    }

    client = await getClient();

    let finalClassId = null;
    if (class_id && class_id !== 'null' && class_id !== '' && class_id !== null) {
      finalClassId = parseInt(class_id);
      const chk = await client.query('SELECT id FROM classes WHERE id = $1', [finalClassId]);
      if (!chk.rows.length) {
        return NextResponse.json({ success: false, message: 'کلاس یافت نشد' }, { status: 404 });
      }
    }

    // جلوگیری از تداخل زمانی
    if (finalClassId) {
      const overlap = await client.query(`
        SELECT id FROM special_classes
        WHERE class_id = $1 AND day_of_week = $2
          AND NOT (end_time <= $3 OR start_time >= $4)
      `, [finalClassId, dw, start_time, end_time]);
      if (overlap.rows.length) {
        return NextResponse.json({ success: false, message: 'این کلاس با زمان دیگری تداخل دارد' }, { status: 409 });
      }
    }

    const insert = await client.query(`
      INSERT INTO special_classes (title, description, class_id, day_of_week, start_time, end_time, created_at, updated_at)
      VALUES ($1,$2,$3,$4,$5,$6,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      RETURNING id,title,description,class_id,day_of_week,start_time,end_time,created_at,updated_at
    `, [
      title.trim(),
      description?.trim() || null,
      finalClassId,
      dw,
      start_time.trim(),
      end_time.trim()
    ]);

    const created = insert.rows[0];
    let classInfo = null;
    if (created.class_id) {
      const info = await client.query(`
        SELECT c.class_name, g.id AS grade_id, g.grade_name
        FROM classes c
        LEFT JOIN grades g ON c.grade_id = g.id
        WHERE c.id = $1
      `, [created.class_id]);
      if (info.rows.length) classInfo = info.rows[0];
    }

    return NextResponse.json({
      success: true,
      created: {
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
      },
      message: 'کلاس فوق‌العاده ایجاد شد'
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      message: e.message.includes('SSL') ? 'اتصال بدون SSL را تنظیم کنید (DB_SSL=false)' : `خطای دیتابیس: ${e.message}`
    }, { status: 500 });
  } finally {
    client && client.release();
  }
}

export async function DELETE(request) {
  let client;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id || isNaN(+id)) {
      return NextResponse.json({ success: false, message: 'شناسه نامعتبر' }, { status: 400 });
    }
    client = await getClient();
    const exists = await client.query('SELECT id FROM special_classes WHERE id = $1', [parseInt(id)]);
    if (!exists.rows.length) {
      return NextResponse.json({ success: false, message: 'یافت نشد' }, { status: 404 });
    }
    await client.query('DELETE FROM special_classes WHERE id = $1', [parseInt(id)]);
    return NextResponse.json({ success: true, deleted_id: parseInt(id), message: 'حذف شد' });
  } catch (e) {
    return NextResponse.json({ success: false, message: e.message || 'خطا در حذف' }, { status: 500 });
  } finally {
    client && client.release();
  }
}