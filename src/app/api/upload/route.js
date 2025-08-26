import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'فایلی انتخاب نشده است' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // ساختن نام یکتا برای فایل
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);

    // ایجاد پوشه uploads اگر وجود نداشته باشد
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ذخیره فایل
    await writeFile(filePath, buffer);
    
    // برگرداندن URL فایل
    const fileUrl = `/uploads/${fileName}`;
    
    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      fileName: fileName 
    });

  } catch (error) {
    console.error('خطا در آپلود فایل:', error);
    return NextResponse.json({ 
      error: 'خطا در آپلود فایل' 
    }, { status: 500 });
  }
}