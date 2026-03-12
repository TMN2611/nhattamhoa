export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('receiver_name, phone')
      .order('created_at', { ascending: false })

    if (error) throw error

    const match = (data || []).find(row => {
      const normalized = (row.phone || '').replace(/[^0-9]/g, '')
      return normalized === phone
    })

    if (match) {
      return NextResponse.json({
        success: true,
        found: true,
        receiver_name: match.receiver_name
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
