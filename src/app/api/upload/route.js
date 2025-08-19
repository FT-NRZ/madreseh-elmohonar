import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req) {
  const data = await req.formData()
  const file = data.get('file')
  if (!file) {
    return NextResponse.json({ error: 'فایل ارسال نشده' }, { status: 400 })
  }
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  const filename = Date.now() + '-' + file.name.replace(/\s/g, '_')
  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, buffer)
  return NextResponse.json({ url: `/uploads/${filename}` })
}