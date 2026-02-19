import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt';

export async function POST(request) {
  try {
    // احراز هویت
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'توکن مورد نیاز است' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = verifyJWT(token);
      if (!payload) {
        return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });
      }
    } catch {
      return NextResponse.json({ success: false, error: 'توکن نامعتبر است' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'uploads';

    if (!file) {
      return NextResponse.json({ success: false, error: 'فایلی انتخاب نشده است' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'فقط فایل‌های تصویری مجاز هستند' }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'حجم فایل نباید بیشتر از 5 مگابایت باشد' }, { status: 400 });
    }

    // ساخت URL مطلق نسبت به همین درخواست
    const storageUrl = new URL('/api/storage/upload', request.url).toString();

    const passForm = new FormData();
    passForm.append('file', file);
    passForm.append('folder', folder);

    const resp = await fetch(storageUrl, {
      method: 'POST',
      body: passForm
    });

    if (!resp.ok) {
      return NextResponse.json({ success: false, error: 'خطا در ذخیره‌سازی فایل' }, { status: 500 });
    }

    const result = await resp.json();
    if (result.success && result.url) {
      return NextResponse.json({
        success: true,
        url: result.url,
        fileName: result.fileName,
        originalName: result.originalName
      });
    }

    return NextResponse.json({ success: false, error: result.error || 'آپلود ناموفق بود' }, { status: 500 });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'خطای سرور: ' + e.message }, { status: 500 });
  }
}