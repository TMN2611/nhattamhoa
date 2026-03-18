export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Creating order:", JSON.stringify(body))

    const sender_name = body.sender_name || body.sender
    const receiver_name = body.receiver_name || body.receiver
    const phone = body.phone || ''
    const message = body.message
    const ritual_type = body.ritual_type || body.ritual || null
    const offering = body.offering || null
    const product_id = body.product_id || null
    const public_vow = body.public_vow !== undefined ? body.public_vow : (body.publicVow !== undefined ? body.publicVow : true)
    const permanence_type = body.permanence_type || 'temporary'
    const receiver_phone = body.receiver_phone || null
    const receiver_address = body.receiver_address || null
    const quantity = body.quantity || 1

    if (!sender_name || !receiver_name || !message) {
      return NextResponse.json({ error: 'Missing required fields: sender_name, receiver_name, message' }, { status: 400 })
    }

    const isValidUUID = product_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product_id)

    const { rows } = await pool.query(
      `INSERT INTO orders
        (sender_name, receiver_name, message, phone, ritual_type, offering, public_vow, permanence_type, status, product_id, receiver_phone, receiver_address, quantity)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11, $12)
       RETURNING *`,
      [
        sender_name,
        receiver_name,
        message,
        phone,
        ritual_type,
        offering,
        public_vow,
        permanence_type,
        isValidUUID ? product_id : null,
        receiver_phone,
        receiver_address,
        quantity,
      ]
    )

    const data = rows[0]
    console.log("Order created successfully:", JSON.stringify(data))

    // Upsert customer (non-critical)
    try {
      await fetch(new URL('/api/customers', req.url).toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          sender_name,
          receiver_name,
          receiver_phone,
          receiver_address,
          last_ai_message: message,
          increment_orders: true,
        })
      })
    } catch (e) {
      console.warn('Customer upsert failed (non-critical):', e)
    }

    return NextResponse.json({
      success: true,
      order: data,
      orderId: data.id,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
