export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      throw error
    }
    if (!data) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, order: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await req.json()

    const { data: order, error: fetchErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchErr) {
      if (fetchErr.code === 'PGRST116') {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }
      throw fetchErr
    }
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const status = order.status
    const isPermanent = order.permanence_type === 'permanent'

    if (status === 'minted' || status === 'revoked') {
      return NextResponse.json(
        { error: 'Cannot edit a minted or revoked order' },
        { status: 403 }
      )
    }

    if (status === 'minting') {
      return NextResponse.json(
        { error: 'Cannot edit an order while minting is in progress' },
        { status: 403 }
      )
    }

    if (status === 'paid') {
      const allowedFields = ['message']
      const disallowed = Object.keys(body).filter(k => !allowedFields.includes(k))
      if (disallowed.length > 0) {
        return NextResponse.json(
          { error: `Paid orders can only update: ${allowedFields.join(', ')}. Disallowed: ${disallowed.join(', ')}` },
          { status: 403 }
        )
      }
    }

    if (isPermanent && (status === 'paid' || status === 'pending')) {
      const senderReceiverFields = ['sender_name', 'receiver_name']
      const blocked = Object.keys(body).filter(k => senderReceiverFields.includes(k))
      if (blocked.length > 0) {
        return NextResponse.json(
          { error: `Permanent orders cannot change sender/receiver fields: ${blocked.join(', ')}` },
          { status: 403 }
        )
      }
    }

    const allowedFields = ['sender_name', 'receiver_name', 'message', 'phone', 'ritual_type', 'offering', 'public_vow', 'permanence_type', 'status', 'certificate_id', 'blockchain_hash', 'product_id']
    const updates: Record<string, any> = {}
    for (const k of allowedFields) {
      if (k in body) updates[k] = body[k]
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ success: true, order: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { data: certs, error: certCheckErr } = await supabaseAdmin
      .from('certificates')
      .select('id')
      .eq('order_id', id)
      .limit(1)

    if (certCheckErr) throw certCheckErr

    if (certs && certs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete order: a certificate exists for this order' },
        { status: 403 }
      )
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
