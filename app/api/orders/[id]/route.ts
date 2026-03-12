export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json({ success: true, order: rows[0] })
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

    const { rows: existing } = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
    if (existing.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = existing[0]
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
    const updates = Object.keys(body).filter(k => allowedFields.includes(k))
    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const setClauses = updates.map((k, i) => `${k} = $${i + 1}`).join(', ')
    const values = updates.map(k => body[k])
    values.push(id)

    const { rows } = await pool.query(
      `UPDATE orders SET ${setClauses} WHERE id = $${values.length} RETURNING *`,
      values
    )

    return NextResponse.json({ success: true, order: rows[0] })
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
    const { rows: certs } = await pool.query(
      'SELECT id FROM certificates WHERE order_id = $1 LIMIT 1',
      [id]
    )

    if (certs.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete order: a certificate exists for this order' },
        { status: 403 }
      )
    }

    await pool.query('DELETE FROM orders WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
