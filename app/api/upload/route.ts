export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-utils'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  const auth = validateAdminRequest(req);
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/quicktime': 'mov',
    }
    const ext = mimeToExt[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, MP4, WebM, MOV' }, { status: 400 })
    }

    const isVideo = file.type.startsWith('video/')
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max ${isVideo ? '50MB' : '5MB'}` }, { status: 400 })
    }

    const prefix = isVideo ? 'video' : 'product'
    const safeName = `${prefix}-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, safeName), buffer)

    const url = `/uploads/${safeName}`

    return NextResponse.json({
      success: true,
      url,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
