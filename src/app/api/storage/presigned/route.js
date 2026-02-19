import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "@/lib/s3";

export async function POST(req) {
  try {
    const { key } = await req.json();

    const command = new GetObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 ساعت اعتبار

    return Response.json({ 
      success: true,
      url: url 
    });

  } catch (error) {
    console.error('خطا در تولید لینک موقت:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در تولید لینک موقت' 
    });
  }
}