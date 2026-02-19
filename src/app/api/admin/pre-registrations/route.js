export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';  // استفاده از Prisma به جای Pool
import { verifyJWT } from '@/lib/jwt';    // استفاده از تابع مرکزی JWT

// Rate limiting
const rateLimitMap = new Map();
const MAX_REQUESTS = 100;
const TIME_WINDOW = 60 * 1000;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - TIME_WINDOW;
  
  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
  rateLimitMap.set(ip, requests);
  
  if (requests.length >= MAX_REQUESTS) return false;
  requests.push(now);
  return true;
}

function getClientIP(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return realIP || 'unknown';
}

function getToken(request) {
  const auth = request.headers.get('authorization') || request.headers.get('Authorization');
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return null;
}

// بررسی امنیتی ورودی
function detectSecurityThreats(value) {
  if (typeof value !== 'string') return false;
  const patterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|EXEC)\b)/i,
    /(--|\/\*|\*\/|;|\||&&)/,
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  return patterns.some(pattern => pattern.test(value));
}

// تابع بررسی توکن و نقش ادمین
function verifyAdmin(request) {
  console.log('🔍 [Admin Route] Checking admin access...');
  try {
    const token = getToken(request);
    console.log('📝 [Admin Route] Token exists:', !!token);
    
    if (!token) {
      console.log('❌ [Admin Route] No token provided');
      return null;
    }
    
    if (detectSecurityThreats(token)) {
      console.log('❌ [Admin Route] Token suspicious');
      return null;
    }

    const payload = verifyJWT(token);
    console.log('✅ [Admin Route] Token decoded successfully, role:', payload?.role);
    return payload && payload.role === 'admin' ? payload : null;
  } catch (error) {
    console.log('❌ [Admin Route] JWT verification failed:', error.message);
    return null;
  }
}

// دریافت لیست همه پیش‌ثبت‌نام‌ها (فقط ادمین)
export async function GET(request) {
  const ip = getClientIP(request);
  
  try {
    console.log('🚀 GET /api/admin/pre-registrations called');
    
    // Rate limiting
    if (!checkRateLimit(ip)) {
      console.log('❌ Rate limit exceeded for IP:', ip);
      return NextResponse.json({ 
        success: false, 
        error: 'تعداد درخواست‌ها بیش از حد مجاز' 
      }, { status: 429 });
    }

    // بررسی احراز هویت و نقش ادمین
    const admin = verifyAdmin(request);
    if (!admin) {
      console.log('❌ Admin access denied');
      return NextResponse.json({ 
        success: false, 
        error: 'دسترسی غیرمجاز - فقط ادمین‌ها' 
      }, { status: 403 });
    }

    console.log('📋 Fetching all pre-registrations with Prisma...');
    
    // استفاده از Prisma به جای query خام
    const preRegistrations = await prisma.pre_registrations.findMany({
      include: {
        grades: {
          select: {
            id: true,
            grade_name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    console.log('✅ Found', preRegistrations.length, 'pre-registrations');

    // تبدیل به فرمت مورد انتظار کلاینت
    const formattedData = preRegistrations.map(reg => ({
      id: reg.id,
      first_name: reg.first_name,
      last_name: reg.last_name,
      phone: reg.phone,
      status: reg.status,
      created_at: reg.created_at,
      updated_at: reg.updated_at,
      grade: reg.grades?.grade_name || reg.grade_interest?.toString() || 'نامشخص',
      grade_interest: reg.grade_interest
    }));

    const response = NextResponse.json({ 
      success: true, 
      registrations: formattedData 
    });

    // هدرهای امنیتی
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;

  } catch (error) {
    console.error('💥 Get pre-registrations error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: 'خطای سرور داخلی' 
    }, { status: 500 });
  }
}