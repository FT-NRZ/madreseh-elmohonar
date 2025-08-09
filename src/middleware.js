import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // صفحات عمومی که نیاز به احراز هویت ندارند
  const publicPaths = [
    '/',
    '/login',
    '/api/auth/login',
    '/api/auth/test',
    '/api/auth/seed',
    '/_next',
    '/favicon.ico'
  ];
  
  // اگر مسیر عمومی است، اجازه ادامه بده
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // بررسی token در هدر Authorization
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '') || 
                request.cookies.get('token')?.value;

  if (!token) {
    // اگر API است، خطای 401 برگردان
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({
        success: false,
        message: 'احراز هویت مورد نیاز است'
      }, { status: 401 });
    }
    
    // وگرنه به صفحه لاگین هدایت کن
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // بررسی اعتبار token
  const payload = verifyJWT(token);
  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({
        success: false,
        message: 'توکن نامعتبر است'
      }, { status: 401 });
    }
    
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // بررسی دسترسی بر اساس نقش
  if (pathname.startsWith('/dashboard/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard/teacher') && payload.role !== 'teacher') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard/student') && payload.role !== 'student') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // اضافه کردن اطلاعات کاربر به headers برای استفاده در API
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId.toString());
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-national-code', payload.nationalCode);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};