export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-utils'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(req: Request) {
  if (!validateAdminRequest(req)) {
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
    }
    const ext = mimeToExt[file.type]
    if (!ext) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF' }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 })
    }

    const safeName = `product-${Date.now()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const publicDir = join(process.cwd(), 'public', 'images')
    await writeFile(join(publicDir, safeName), buffer)

    return NextResponse.json({
      success: true,
      url: `/images/${safeName}`,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
