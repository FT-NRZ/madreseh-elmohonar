export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import jwt from 'jsonwebtoken';

// ------------ اتصال با فالبک SSL ------------
const RAW_CONN = process.env.DATABASE_URL || '';
let pool;

function buildPool(forceDisable = false) {
  const useSSL =
    !forceDisable &&
    (
      process.env.DB_SSL === 'true' ||
      /sslmode=(require|verify-full|verify-ca|prefer)/i.test(RAW_CONN)
    );
  return new Pool({
    connectionString: RAW_CONN,
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
}

async function getClient() {
  if (!pool) pool = buildPool();
  try {
    return await pool.connect();
  } catch (e) {
    if (/does not support ssl/i.test(e.message)) {
      try { await pool.end().catch(() => {}); } catch {}
      pool = buildPool(true);
      return await pool.connect();
    }
    throw e;
  }
}

// ------------ جدول ------------
async function ensurePreRegTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS pre_registrations (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name  TEXT NOT NULL,
      grade_interest TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    );
  `);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS uniq_pre_reg_phone ON pre_registrations(phone);`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_pre_reg_created_at ON pre_registrations(created_at);`);
}

// ------------ کمکی‌ها ------------
function sanitizeText(s) {
  if (typeof s !== 'string') return '';
  return s.trim().replace(/[<>\"'&]/g, '').replace(/\s+/g, ' ').slice(0, 50);
}
function digits(s, max = 11) {
  return String(s || '').replace(/\D/g, '').slice(0, max);
}
function isValidPersianName(n) {
  return /^[آ-ی\s]{2,50}$/.test(n || '');
}
function isValidIranPhone(p) {
  return /^09(0[1-5]|1[0-9]|3[0-9]|2[0-2]|9[0-9])\d{7}$/.test(p || '');
}
function realIP(req) {
  return req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || 'unknown';
}
function suspiciousUA(ua) {
  if (!ua) return false;
  return [/bot/i,/crawler/i,/spider/i,/scraper/i,/curl/i,/wget/i,/python/i,/php/i,/postman/i,/insomnia/i].some(r=>r.test(ua));
}
function hostOf(u) {
  try { return u ? new URL(u).host : ''; } catch { return ''; }
}

/*
  validateRequest:
  - in development: allow
  - in production: allow when origin/referrer host is in allowed list
  - allowed list can be provided via NEXT_PUBLIC_ALLOWED_HOSTS (comma separated)
  - always allow requests with missing origin/referrer if host header matches allowed host
*/
function validateRequest(req) {
  const ua = req.headers.get('user-agent');
  if (suspiciousUA(ua)) return { ok: false, reason: 'مرورگر مشکوک' };

  // dev is permissive
  if (process.env.NODE_ENV !== 'production') return { ok: true };

  // build allowed hosts
  const envList = (process.env.NEXT_PUBLIC_ALLOWED_HOSTS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const allowedHosts = new Set([
    ...envList,
    hostOf(process.env.NEXT_PUBLIC_SITE_URL),
    'elmohonar.liara.run',
    'www.elmohonar.liara.run'
  ].filter(Boolean));

  // also allow the current host header (useful when same origin)
  const hostHeader = req.headers.get('host');
  if (hostHeader) allowedHosts.add(hostHeader);

  const origin = req.headers.get('origin') || '';
  const referer = req.headers.get('referer') || '';
  const oHost = hostOf(origin);
  const rHost = hostOf(referer);

  // if origin provided, it must be allowed
  if (oHost) {
    if (!allowedHosts.has(oHost)) return { ok: false, reason: 'منبع غیرمجاز' };
    return { ok: true };
  }

  // if referer provided, it must be allowed
  if (rHost) {
    if (!allowedHosts.has(rHost)) return { ok: false, reason: 'منبع غیرمجاز' };
    return { ok: true };
  }

  // if neither origin nor referer present, allow (likely direct form submit or same-origin)
  return { ok: true };
}

// Rate limit ساده (IP)
const rate = new Map();
function checkRate(ip) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const limit = 5;
  const rec = rate.get(ip);
  if (!rec || now > rec.reset) {
    rate.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (rec.count >= limit) return false;
  rec.count++;
  return true;
}

// JWT ادمین
function verifyAdmin(req) {
  try {
    const h = req.headers.get('authorization') || req.headers.get('Authorization');
    if (!h?.startsWith('Bearer ')) return false;
    const token = h.slice(7);
    if (!process.env.JWT_SECRET) return false;
    const dec = jwt.verify(token, process.env.JWT_SECRET);
    return dec?.role === 'admin';
  } catch {
    return false;
  }
}

// ------------ POST (Public) ------------
export async function POST(request) {
  const ip = realIP(request);
  let client;
  try {
    const v = validateRequest(request);
    if (!v.ok) return NextResponse.json({ success: false, error: v.reason }, { status: 403 });

    // simple rate limit per IP
    if (!checkRate(ip)) {
      return NextResponse.json({ success: false, error: 'درخواست‌های زیاد، لطفاً بعداً تکرار کنید' }, { status: 429 });
    }

    const ct = request.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      return NextResponse.json({ success: false, error: 'نوع محتوا باید application/json باشد' }, { status: 400 });
    }

    const body = await request.json().catch(() => null);
    if (!body) return NextResponse.json({ success: false, error: 'JSON نامعتبر' }, { status: 400 });

    const first = sanitizeText(body.first_name);
    const last = sanitizeText(body.last_name);
    const gradeId = parseInt(body.grade_id) || 0;
    const phoneDigits = digits(body.phone);

    if (!first || !last || !gradeId || !phoneDigits) {
      return NextResponse.json({ success: false, error: 'فیلدهای اجباری ناقص است' }, { status: 400 });
    }
    if (!isValidPersianName(first)) return NextResponse.json({ success: false, error: 'نام نامعتبر' }, { status: 400 });
    if (!isValidPersianName(last)) return NextResponse.json({ success: false, error: 'نام خانوادگی نامعتبر' }, { status: 400 });
    if (!isValidIranPhone(phoneDigits)) return NextResponse.json({ success: false, error: 'شماره موبایل نامعتبر' }, { status: 400 });

    client = await getClient();
    await client.query('BEGIN');
    await ensurePreRegTable(client);

    const dup = await client.query('SELECT 1 FROM pre_registrations WHERE phone = $1 LIMIT 1', [phoneDigits]);
    if (dup.rows.length) {
      await client.query('ROLLBACK');
      return NextResponse.json({ success: false, error: 'این شماره قبلاً ثبت شده' }, { status: 409 });
    }

    const ins = await client.query(
      `INSERT INTO pre_registrations (first_name,last_name,grade_interest,phone,status,created_at)
       VALUES ($1,$2,$3,$4,'pending',NOW())
       RETURNING id, first_name, last_name, grade_interest, phone, status, created_at`,
      [first, last, gradeId.toString(), phoneDigits]
    );
    await client.query('COMMIT');

    const r = ins.rows[0];
    return NextResponse.json({
      success: true,
      message: 'ثبت شد',
      registration: {
        id: r.id,
        first_name: r.first_name,
        last_name: r.last_name,
        grade: r.grade_interest,
        phone: r.phone,
        status: r.status,
        created_at: r.created_at
      }
    }, { status: 200 });

  } catch (e) {
    try { client && await client.query('ROLLBACK'); } catch {}
    console.error('pre-registration POST error:', e && e.message ? e.message : e);
    return NextResponse.json({ success: false, error: 'خطای سرور' }, { status: 500 });
  } finally {
    try { client && client.release(); } catch {}
  }
}

// ------------ GET (Admin only) ------------
export async function GET(request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'دسترسی غیرمجاز' }, { status: 403 });
  }
  let client;
  try {
    client = await getClient();
    await ensurePreRegTable(client);
    const res = await client.query(`
      SELECT id, first_name, last_name, grade_interest AS grade,
             phone, status, created_at, updated_at
      FROM pre_registrations
      ORDER BY created_at DESC
      LIMIT 500
    `);
    return NextResponse.json({ success: true, preRegistrations: res.rows }, { status: 200 });
  } catch (e) {
    console.error('pre-registration GET error:', e && e.message ? e.message : e);
    return NextResponse.json({ success: false, error: 'خطا در دریافت اطلاعات' }, { status: 500 });
  } finally {
    try { client && client.release(); } catch {}
  }
}