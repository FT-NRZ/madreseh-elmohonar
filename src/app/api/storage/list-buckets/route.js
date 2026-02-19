import { ListBucketsCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function GET() {
  try {
    const command = new ListBucketsCommand({});
    const data = await s3.send(command);
    
    return Response.json({ 
      success: true,
      buckets: data.Buckets 
    });

  } catch (error) {
    console.error('خطا در دریافت باکت‌ها:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در دریافت لیست باکت‌ها' 
    });
  }
}