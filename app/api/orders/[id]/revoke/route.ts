export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'revoked') {
      return NextResponse.json({ error: 'Order is already revoked' }, { status: 400 })
    }

    if (order.status !== 'minted') {
      return NextResponse.json({ error: `Can only revoke minted orders. Current status: ${order.status}` }, { status: 400 })
    }

    const { data: updated, error: updateErr } = await supabase
      .from('orders')
      .update({ status: 'revoked' })
      .eq('id', id)
      .select('*')
      .single()

    if (updateErr) throw updateErr
    return NextResponse.json({ success: true, order: updated })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
