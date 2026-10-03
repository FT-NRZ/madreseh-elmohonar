export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/s3';

function mimeByExt(ext) {
  const m = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.bmp': 'image/bmp',
    '.ico': 'image/x-icon',
    '.tif': 'image/tiff',
    '.tiff': 'image/tiff',
    '.avif': 'image/avif',
    '.heic': 'image/heic',
    '.heif': 'image/heif'
  };
  return m[(ext || '').toLowerCase()] || 'application/octet-stream';
}

function detectMimeBySignature(buf) {
  if (!buf || buf.length < 12) return null;
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(buf);
  if (b.slice(0, 8).equals(Buffer.from([0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A]))) return 'image/png';
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'image/jpeg';
  if (b.slice(0, 6).toString('ascii') === 'GIF87a' || b.slice(0, 6).toString('ascii') === 'GIF89a') return 'image/gif';
  if (b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  if (b.slice(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  return null;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    let relPath = searchParams.get('path') || '';
    const disp = (searchParams.get('disposition') || 'inline').toLowerCase() === 'attachment' ? 'attachment' : 'inline';
    const nameParam = (searchParams.get('name') || '').trim();

    if (!relPath) {
      return NextResponse.json({ error: 'مسیر فایل مشخص نشده' }, { status: 400 });
    }

    // لاگ ورودی خام
    console.log('📥 Download request RAW:', relPath);

    // اگر URL کامل است ولی مربوط به همین دامنه باشد → تبدیل به مسیر داخلی
    try {
      if (/^https?:\/\//i.test(relPath)) {
        const u = new URL(relPath);
        // اگر مسیر با /uploads شروع می‌کند، آن را داخلی فرض کن
        if (u.pathname.startsWith('/uploads/')) {
          relPath = u.pathname;
          console.log('🔄 Converted full URL to local path:', relPath);
        } else {
          // Liara objects may be private; sign their storage key before proxying.
          let remoteUrl = relPath;
          const bucket = process.env.LIARA_BUCKET_NAME;
          if (bucket && u.pathname.startsWith(`/${bucket}/`)) {
            const key = decodeURIComponent(u.pathname.slice(bucket.length + 2));
            remoteUrl = await getSignedUrl(
              s3,
              new GetObjectCommand({ Bucket: bucket, Key: key }),
              { expiresIn: 300 }
            );
          }

          console.log('🌐 Remote fetch proxy:', u.origin);
          const r = await fetch(remoteUrl);
            if (!r.ok) return NextResponse.json({ error: 'فایل یافت نشد (remote)' }, { status: 404 });
            const arrayBuf = await r.arrayBuffer();
            const fileName = nameParam || relPath.split('/').pop() || 'file';
            const sniff = detectMimeBySignature(Buffer.from(arrayBuf));
            const ct = sniff || r.headers.get('content-type') || mimeByExt(path.extname(fileName));
            return new NextResponse(Buffer.from(arrayBuf), {
              status: 200,
              headers: {
                'Content-Type': ct,
                'Content-Disposition': `${disp}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'public, max-age=3600'
              }
            });
        }
      }
    } catch {}

    // نرمال‌سازی
    try { relPath = decodeURIComponent(relPath); } catch {}
    let clean = relPath.replace(/\\/g, '/').trim();
    clean = clean.replace(/^\/+/, '');
    clean = clean.replace(/\/{2,}/g, '/'); // حذف اسلش‌های تکراری
    if (clean.startsWith('public/')) clean = clean.slice(7);
    if (!clean.startsWith('uploads/')) clean = 'uploads/' + clean;

    // لاگ مسیر تمیز
    console.log('🧹 Clean path:', clean);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const candidateMain = path.normalize(path.join(process.cwd(), 'public', clean));
    const candidateFlat = path.normalize(path.join(uploadsDir, path.basename(clean)));

    console.log('🔍 Candidates:', { candidateMain, candidateFlat });

    // امنیت
    if (!candidateMain.startsWith(uploadsDir) || !candidateFlat.startsWith(uploadsDir)) {
      console.log('⛔ Path security block');
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 403 });
    }

    // موجودی پوشه برای دیباگ
    let existing = [];
    try {
      existing = await fs.readdir(uploadsDir);
    } catch {}
    console.log('📁 Existing files count:', existing.length);

    // جستجوی فایل
    let filePath = null;
    try {
      await fs.access(candidateMain);
      filePath = candidateMain;
      console.log('✅ Found file (main):', filePath);
    } catch {
      try {
        await fs.access(candidateFlat);
        filePath = candidateFlat;
        console.log('✅ Found file (flat):', filePath);
      } catch {
        // fallback به سرور دیگر
        const base = process.env.UPLOADS_FALLBACK_BASE;
        if (base) {
          const fallbackUrl = new URL('/' + clean, base).toString();
          console.log('🔁 Trying fallback URL:', fallbackUrl);
          const r = await fetch(fallbackUrl);
          if (r.ok) {
            const arrayBuf = await r.arrayBuffer();
            const fallbackName = path.basename(clean);
            const fileName = nameParam || fallbackName;
            const sniff = detectMimeBySignature(Buffer.from(arrayBuf));
            const ct = sniff || r.headers.get('content-type') || mimeByExt(path.extname(fileName));
            console.log('✅ Fallback success:', fallbackUrl);
            return new NextResponse(Buffer.from(arrayBuf), {
              status: 200,
              headers: {
                'Content-Type': ct,
                'Content-Disposition': `${disp}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
                'X-Content-Type-Options': 'nosniff',
                'Cache-Control': 'public, max-age=3600'
              }
            });
          } else {
            console.log('❌ Fallback not found:', fallbackUrl, r.status);
          }
        }
        console.log('❌ File not found after all attempts');
        return NextResponse.json({ error: 'فایل یافت نشد', hint: 'local + fallback' }, { status: 404 });
      }
    }

    // خواندن و ارسال
    const data = await fs.readFile(filePath);
    const fallbackName = path.basename(filePath);
    const fileName = nameParam || fallbackName;
    const sniff = detectMimeBySignature(data);
    const ext = path.extname(fileName) || path.extname(fallbackName);
    const ct = sniff || mimeByExt(ext);

    console.log('📤 Sending file:', { fileName, ct, size: data.length, disp });

    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': ct,
        'Content-Disposition': `${disp}; filename="${encodeURIComponent(fileName)}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': disp === 'inline' ? 'public, max-age=3600' : 'public, max-age=31536000, immutable'
      }
    });
  } catch (error) {
    console.error('💥 Download route error:', error);
    return NextResponse.json({ error: 'خطای سرور', details: error.message }, { status: 500 });
  }
}