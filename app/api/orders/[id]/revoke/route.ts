export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1 LIMIT 1', [id])
    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const order = orderRows[0]

    if (order.status === 'revoked') {
      return NextResponse.json({ error: 'Order is already revoked' }, { status: 400 })
    }

    if (order.status !== 'minted') {
      return NextResponse.json({ error: `Can only revoke minted orders. Current status: ${order.status}` }, { status: 400 })
    }

    const { rows: updated } = await pool.query(
      "UPDATE orders SET status = 'revoked' WHERE id = $1 RETURNING *",
      [id]
    )

    return NextResponse.json({ success: true, order: updated[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
