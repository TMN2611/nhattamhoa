export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ banners: [], error: error.message })
    }

    return NextResponse.json({ success: true, banners: data || [] })
  } catch (err: any) {
    return NextResponse.json({ banners: [], error: err.message })
  }
}

export async function POST(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { image_url, title, link_url, sort_order } = body

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('banners')
      .insert({ image_url, title: title || null, link_url: link_url || null, sort_order: sort_order || 0 })
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, banner: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
