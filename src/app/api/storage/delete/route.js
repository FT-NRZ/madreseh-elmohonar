import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

export async function DELETE(req) {
  try {
    const { key } = await req.json(); // لیارا از req.json() استفاده کرده

    const command = new DeleteObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: key,
    });

    await s3.send(command);

    return Response.json({ 
      success: true,
      message: "File deleted" 
    });

  } catch (error) {
    console.error('خطا در حذف:', error);
    return Response.json({ 
      success: false, 
      error: 'خطا در حذف فایل' 
    });
  }
}