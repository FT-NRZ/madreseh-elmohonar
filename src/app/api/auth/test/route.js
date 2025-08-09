import { NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/database';

export async function GET() {
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
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}