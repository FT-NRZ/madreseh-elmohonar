import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/database';

const ADMIN_SEED_SECRET = process.env.ADMIN_SEED_SECRET || 'dev-secret';

export async function GET(request) {
  // فقط در محیط توسعه یا با secret خاص اجازه اجرا بده
  if (process.env.NODE_ENV !== 'development') {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${ADMIN_SEED_SECRET}`) {
      return NextResponse.json({
        status: 'forbidden'
      }, { status: 403 });
    }
  }

  try {
    const isConnected = await testDatabaseConnection();
    return NextResponse.json({
      status: 'ok',
      database: isConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'خطا در اتصال به دیتابیس',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}