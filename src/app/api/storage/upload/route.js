import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export const runtime = 'nodejs';

export async function POST(req) {
  try {
    console.log('🔄 Storage upload started');

    // چک متغیرهای محیطی
    const endpoint = process.env.LIARA_ENDPOINT || 'https://storage.c2.liara.space';
    const bucket = process.env.LIARA_BUCKET_NAME;
    const accessKey = process.env.LIARA_ACCESS_KEY;
    const secretKey = process.env.LIARA_SECRET_KEY;

    console.log('🔧 Environment variables:', {
      endpoint,
      bucket: bucket ? 'SET' : 'MISSING',
      accessKey: accessKey ? 'SET' : 'MISSING',
      secretKey: secretKey ? 'SET' : 'MISSING'
    });

    if (!bucket) {
      console.error('❌ LIARA_BUCKET_NAME missing');
      return Response.json({ success: false, error: 'Bucket name not configured' }, { status: 500 });
    }

    if (!accessKey || !secretKey) {
      console.error('❌ Access keys missing');
      return Response.json({ success: false, error: 'Access keys not configured' }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get('folder') || 'uploads';

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    console.log('📄 File details:', {
      name: file.name,
      type: file.type,
      size: file.size,
      folder
    });

    // Validations
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ success: false, error: 'File size too large (max 5MB)' }, { status: 400 });
    }

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 
  'application/pdf'
];

if (!allowedTypes.includes(file.type)) {
  return Response.json({ success: false, error: 'File type not allowed' }, { status: 400 });
}

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 12);
    const extension = (file.name.split('.').pop() || 'bin').toLowerCase();
    const key = `${folder}/${timestamp}-${randomString}.${extension}`;

    console.log('📦 Upload details:', { bucket, key });

    // Convert to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // S3 upload command
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: 'public-read',
    });

    console.log('📤 Uploading to Liara...');
    
    const result = await s3.send(command);
    console.log('📊 S3 Response:', result);

    // Generate public URL
    const publicUrl = `${endpoint}/${bucket}/${key}`;
    
    console.log('✅ Upload successful:', publicUrl);

    return Response.json({
      success: true,
      url: publicUrl,
      fileName: key.split('/').pop(),
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('💥 Storage upload error:', error);
    
    // Detailed error logging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });

    return Response.json({ 
      success: false, 
      error: `Upload failed: ${error.message || 'Unknown error'}` 
    }, { status: 500 });
  }
}