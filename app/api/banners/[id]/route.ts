export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req).valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()
    const updates: any = {}
    if (body.title !== undefined) updates.title = body.title
    if (body.link_url !== undefined) updates.link_url = body.link_url
    if (body.is_active !== undefined) updates.is_active = body.is_active
    if (body.sort_order !== undefined) updates.sort_order = body.sort_order

    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, banner: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req).valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { error } = await supabase.from('banners').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
