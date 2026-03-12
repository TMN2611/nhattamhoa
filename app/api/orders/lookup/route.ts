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
      `SELECT receiver_name FROM orders WHERE REGEXP_REPLACE(phone, '[^0-9]', '', 'g') = $1 ORDER BY created_at DESC LIMIT 1`,
      [phone]
    )

    if (rows.length > 0) {
      return NextResponse.json({
        success: true,
        found: true,
        receiver_name: rows[0].receiver_name
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
