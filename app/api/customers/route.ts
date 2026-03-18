export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawPhone = searchParams.get('phone')

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    const phone = normalizePhone(rawPhone)
    if (phone.length < 9 || phone.length > 11) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    const { rows } = await pool.query(
      `SELECT id, phone, sender_name, receiver_name, receiver_phone, receiver_address, total_orders
       FROM customers
       WHERE phone_normalized = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [phone]
    )

    if (rows.length > 0) {
      const match = rows[0]
      return NextResponse.json({
        success: true,
        found: true,
        customer: {
          id: match.id,
          phone: match.phone,
          sender_name: match.sender_name,
          receiver_name: match.receiver_name,
          receiver_phone: match.receiver_phone || null,
          receiver_address: match.receiver_address || null,
          total_orders: match.total_orders || 0,
        }
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    console.error('Customer lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const phone = normalizePhone(body.phone || '')

    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: 'Valid phone is required' }, { status: 400 })
    }

    if (!body.sender_name || !body.receiver_name) {
      return NextResponse.json({ error: 'sender_name and receiver_name are required' }, { status: 400 })
    }

    const { rows: existing } = await pool.query(
      `SELECT * FROM customers WHERE phone_normalized = $1 ORDER BY updated_at DESC LIMIT 1`,
      [phone]
    )

    if (existing.length > 0) {
      const match = existing[0]
      const newTotal = (match.total_orders || 0) + (body.increment_orders ? 1 : 0)
      const lastOrderAt = body.increment_orders ? new Date().toISOString() : match.last_order_at

      const updates: string[] = [
        'sender_name = $2',
        'receiver_name = $3',
        'total_orders = $4',
        'last_order_at = $5',
      ]
      const values: any[] = [match.id, body.sender_name, body.receiver_name, newTotal, lastOrderAt]
      let idx = 6

      if (body.receiver_phone !== undefined) { updates.push(`receiver_phone = $${idx++}`); values.push(body.receiver_phone) }
      if (body.receiver_address !== undefined) { updates.push(`receiver_address = $${idx++}`); values.push(body.receiver_address) }
      if (body.last_ai_message !== undefined) { updates.push(`last_ai_message = $${idx++}`); values.push(body.last_ai_message) }
      if (body.email !== undefined) { updates.push(`email = $${idx++}`); values.push(body.email) }

      const { rows: updated } = await pool.query(
        `UPDATE customers SET ${updates.join(', ')} WHERE id = $1 RETURNING *`,
        values
      )
      return NextResponse.json({ success: true, customer: updated[0], upserted: 'updated' })
    } else {
      const columns = ['phone', 'sender_name', 'receiver_name', 'total_orders', 'first_order_at', 'last_order_at']
      const vals: any[] = [
        phone,
        body.sender_name,
        body.receiver_name,
        body.increment_orders ? 1 : 0,
        new Date().toISOString(),
        body.increment_orders ? new Date().toISOString() : null,
      ]

      if (body.receiver_phone !== undefined) { columns.push('receiver_phone'); vals.push(body.receiver_phone) }
      if (body.receiver_address !== undefined) { columns.push('receiver_address'); vals.push(body.receiver_address) }
      if (body.last_ai_message !== undefined) { columns.push('last_ai_message'); vals.push(body.last_ai_message) }
      if (body.email !== undefined) { columns.push('email'); vals.push(body.email) }

      const placeholders = vals.map((_, i) => `$${i + 1}`).join(', ')
      const { rows: created } = await pool.query(
        `INSERT INTO customers (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
        vals
      )
      return NextResponse.json({ success: true, customer: created[0], upserted: 'created' })
    }
  } catch (error: any) {
    console.error('Customer upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
