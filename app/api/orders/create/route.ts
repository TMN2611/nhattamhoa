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

    if (!sender_name || !receiver_name || !message) {
      return NextResponse.json({ error: 'Missing required fields: sender_name, receiver_name, message' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `INSERT INTO orders (sender_name, receiver_name, message, phone, ritual_type, offering, public_vow, permanence_type, status, product_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9)
       RETURNING *`,
      [sender_name, receiver_name, message, phone, ritual_type, offering, public_vow, permanence_type, product_id || null]
    )

    const data = rows[0]
    console.log("Order created successfully:", JSON.stringify(data))

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
