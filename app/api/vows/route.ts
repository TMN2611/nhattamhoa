export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '3', 10)

    const { rows } = await pool.query(
      `SELECT sender_name, receiver_name, message, public_vow, created_at
       FROM orders WHERE public_vow = true ORDER BY created_at DESC LIMIT $1`,
      [limit]
    )
    return NextResponse.json({ success: true, vows: rows })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
