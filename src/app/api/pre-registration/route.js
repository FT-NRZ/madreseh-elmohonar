import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// تنظیمات امنیتی
const MAX_NAME_LENGTH = 50;
const MAX_PHONE_LENGTH = 11;
const MIN_NAME_LENGTH = 2;
const ALLOWED_GRADE_NAMES = [
  'اول ابتدایی', 'دوم ابتدایی', 'سوم ابتدایی', 'چهارم ابتدایی',
  'پنجم ابتدایی', 'ششم ابتدایی', 'اول متوسطه', 'دوم متوسطه', 'سوم متوسطه'
];

// Rate limiting storage
const rateLimitStore = new Map();

// اتصال امن به دیتابیس
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:1@localhost:5432/madreseh-elmohonar",
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// تابع تنظیف ورودی از SQL Injection و XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // حذف کاراکترهای خطرناک
    .replace(/\s+/g, ' ') // تبدیل فاصله‌های متعدد به یک فاصله
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // حذف کاراکترهای کنترلی
    .substring(0, MAX_NAME_LENGTH); // محدود کردن طول
}

// اعتبارسنجی نام فارسی
function isValidPersianName(name) {
  if (!name || name.length < MIN_NAME_LENGTH || name.length > MAX_NAME_LENGTH) {
    return false;
  }
  
  // فقط حروف فارسی، فاصله و برخی کاراکترهای مجاز
  const persianNameRegex = /^[آ-ی\s]+$/;
  return persianNameRegex.test(name);
}

// اعتبارسنجی شماره تلفن ایرانی
function isValidIranianPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  
  const cleanPhone = phone.trim().replace(/[-\s]/g, '');
  
  // فقط شماره‌های موبایل ایرانی
  const iranMobileRegex = /^09(0[1-5]|1[0-9]|3[0-9]|2[0-2]|9[0-9])\d{7}$/;
  return iranMobileRegex.test(cleanPhone) && cleanPhone.length === 11;
}

// Rate limiting
function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 دقیقه
  const maxRequests = 5; // حداکثر 5 درخواست در 15 دقیقه
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const record = rateLimitStore.get(ip);
  
  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  rateLimitStore.set(ip, record);
  return true;
}

// تشخیص IP واقعی
function getRealIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfIP = request.headers.get('cf-connecting-ip');
  
  if (cfIP) return cfIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  return 'unknown';
}

// بررسی User-Agent مشکوک
function isSuspiciousUserAgent(userAgent) {
  if (!userAgent) return true;
  
  const suspiciousPatterns = [
    /bot/i, /crawler/i, /spider/i, /scraper/i,
    /curl/i, /wget/i, /python/i, /php/i,
    /postman/i, /insomnia/i
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(userAgent));
}

// تابع بررسی امنیتی درخواست
function validateRequest(request) {
  const userAgent = request.headers.get('user-agent');
  const referer = request.headers.get('referer');
  const origin = request.headers.get('origin');
  
  // بررسی User-Agent
  if (isSuspiciousUserAgent(userAgent)) {
    return { valid: false, reason: 'مرورگر غیرمجاز' };
  }
  
  // بررسی Origin و Referer در production
  if (process.env.NODE_ENV === 'production') {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL,
      'https://yourdomain.com' // دامنه واقعی خود را اضافه کنید
    ];
    
    if (origin && !allowedOrigins.some(allowed => origin.includes(allowed))) {
      return { valid: false, reason: 'منبع غیرمجاز' };
    }
  }
  
  return { valid: true };
}

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
    return decoded && decoded.role === 'admin' && decoded.exp > Date.now() / 1000;
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
    
    // استفاده از Prepared Statement برای جلوگیری از SQL Injection
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
      WHERE p.status IN ('pending', 'approved', 'rejected')
      ORDER BY p.created_at DESC
      LIMIT 1000
    `);

    return NextResponse.json({ 
      success: true, 
      preRegistrations: result.rows 
    });

  } catch (error) {
    console.error('Database error:', error.message);
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

// ثبت پیش‌ثبت‌نام جدید
export async function POST(request) {
  let client;
  
  try {
    // بررسی امنیتی درخواست
    const requestValidation = validateRequest(request);
    if (!requestValidation.valid) {
      return NextResponse.json({ 
        success: false, 
        error: requestValidation.reason 
      }, { status: 403 });
    }

    // بررسی Rate Limiting
    const clientIP = getRealIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json({ 
        success: false, 
        error: 'تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً 15 دقیقه صبر کنید.' 
      }, { status: 429 });
    }

    // بررسی Content-Type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ 
        success: false, 
        error: 'نوع محتوا نامعتبر است' 
      }, { status: 400 });
    }

    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json({ 
        success: false, 
        error: 'فرمت JSON نامعتبر است' 
      }, { status: 400 });
    }

    const { first_name, last_name, grade, phone } = body;

    // اعتبارسنجی کامل ورودی‌ها
    if (!first_name || !last_name || !grade || !phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'همه فیلدها الزامی هستند' 
      }, { status: 400 });
    }

    // تنظیف و اعتبارسنجی نام
    const cleanFirstName = sanitizeInput(first_name);
    const cleanLastName = sanitizeInput(last_name);
    const cleanPhone = phone.toString().trim().replace(/[-\s]/g, '');

    if (!isValidPersianName(cleanFirstName)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نام باید فقط شامل حروف فارسی باشد و بین 2 تا 50 کاراکتر باشد' 
      }, { status: 400 });
    }

    if (!isValidPersianName(cleanLastName)) {
      return NextResponse.json({ 
        success: false, 
        error: 'نام خانوادگی باید فقط شامل حروف فارسی باشد و بین 2 تا 50 کاراکتر باشد' 
      }, { status: 400 });
    }

    // اعتبارسنجی شماره تلفن
    if (!isValidIranianPhone(cleanPhone)) {
      return NextResponse.json({ 
        success: false, 
        error: 'شماره تماس نامعتبر است. فقط شماره‌های موبایل ایرانی مجاز هستند' 
      }, { status: 400 });
    }

    // اعتبارسنجی پایه تحصیلی
    if (!ALLOWED_GRADE_NAMES.includes(grade)) {
      return NextResponse.json({ 
        success: false, 
        error: 'پایه تحصیلی نامعتبر است' 
      }, { status: 400 });
    }

    client = await pool.connect();

    // شروع Transaction
    await client.query('BEGIN');

    try {
      // پیدا کردن ID پایه تحصیلی با Prepared Statement
      let gradeId = null;
      const gradeResult = await client.query(
        'SELECT id FROM grades WHERE grade_name = $1 LIMIT 1',
        [grade]
      );
      
      if (gradeResult.rows.length > 0) {
        gradeId = gradeResult.rows[0].id;
      }

      // بررسی تکراری نبودن شماره تماس
      const existingCheck = await client.query(
        'SELECT id FROM pre_registrations WHERE phone = $1 LIMIT 1',
        [cleanPhone]
      );

      if (existingCheck.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ 
          success: false, 
          error: 'این شماره تماس قبلاً ثبت شده است' 
        }, { status: 409 });
      }

      // بررسی تعداد درخواست‌های امروز از همین IP
      const today = new Date().toISOString().split('T')[0];
      const dailyCheck = await client.query(`
        SELECT COUNT(*) as count 
        FROM pre_registrations 
        WHERE DATE(created_at) = $1 
        AND created_at > NOW() - INTERVAL '24 hours'
      `, [today]);

      if (parseInt(dailyCheck.rows[0].count) > 10) {
        await client.query('ROLLBACK');
        return NextResponse.json({ 
          success: false, 
          error: 'حداکثر تعداد درخواست روزانه رسیده است' 
        }, { status: 429 });
      }

      // ثبت پیش‌ثبت‌نام با Prepared Statement
      const insertResult = await client.query(`
        INSERT INTO pre_registrations (first_name, last_name, grade_interest, phone, status, created_at) 
        VALUES ($1, $2, $3, $4, 'pending', NOW()) 
        RETURNING id, first_name, last_name, grade_interest, phone, status, created_at
      `, [cleanFirstName, cleanLastName, gradeId, cleanPhone]);

      // Commit Transaction
      await client.query('COMMIT');

      const newRecord = insertResult.rows[0];

      // لاگ امنیتی
      console.log(`✅ New pre-registration: ${cleanFirstName} ${cleanLastName} from IP: ${clientIP}`);

      return NextResponse.json({ 
        success: true, 
        message: 'پیش‌ثبت‌نام با موفقیت انجام شد',
        registration: {
          id: newRecord.id,
          first_name: newRecord.first_name,
          last_name: newRecord.last_name,
          grade: grade,
          status: newRecord.status,
          created_at: newRecord.created_at
        }
      });

    } catch (innerError) {
      await client.query('ROLLBACK');
      throw innerError;
    }

  } catch (error) {
    console.error(`❌ Pre-registration error from IP ${clientIP}:`, error.message);
    
    // بررسی نوع خطا
    if (error.code === '23505') {
      return NextResponse.json({ 
        success: false, 
        error: 'این شماره تماس قبلاً ثبت شده است' 
      }, { status: 409 });
    }

    if (error.code === '23514') {
      return NextResponse.json({ 
        success: false, 
        error: 'داده‌های ورودی با قوانین سیستم مطابقت ندارد' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'خطا در ثبت اطلاعات. لطفاً دوباره تلاش کنید' 
    }, { status: 500 });
    
  } finally {
    if (client) {
      client.release();
    }
  }
}