export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { validateAdminRequest } from '@/lib/admin-utils'
import { supabase } from '@/lib/supabase'

const BUCKET_NAME = "uploads"

async function ensureBucket(): Promise<boolean> {
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
      console.error("Failed to list buckets:", listError)
      return false
    }
    const exists = buckets?.some((b) => b.name === BUCKET_NAME)
    if (!exists) {
      const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 52428800,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ],
      })
      if (createError) {
        console.error("Failed to create bucket:", createError)
        return false
      }
    }
    return true
  } catch (e) {
    console.error("ensureBucket exception:", e)
    return false
  }
}

let bucketReady = false

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

    if (!bucketReady) {
      const ok = await ensureBucket()
      if (!ok) {
        return NextResponse.json({ error: 'Storage system not ready. Please try again.' }, { status: 503 })
      }
      bucketReady = true
    }

    const prefix = isVideo ? 'video' : 'product'
    const safeName = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const filePath = `products/${safeName}`

    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Supabase upload error:", uploadError)
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
