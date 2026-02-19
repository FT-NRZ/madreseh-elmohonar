import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix'); // اختیاری

    const command = new ListObjectsV2Command({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Prefix: prefix, // اگر خالی باشه، همه فایل‌ها رو برمی‌گردونه
    });

    const data = await s3.send(command);
    
    // اضافه کردن URL کامل برای هر فایل
    const files = data.Contents?.map(file => ({
      ...file,
      url: `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/${file.Key}`
    })) || [];

    return Response.json({ 
      success: true,
      files: files 
    });

  } catch (error) {
    console.error('خطا در دریافت فایل‌ها:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در دریافت لیست فایل‌ها' 
    });
  }
}