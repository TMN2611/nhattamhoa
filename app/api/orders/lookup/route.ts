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

    const { data: customer, error: custErr } = await supabaseAdmin
      .from('customers')
      .select('sender_name, receiver_name, receiver_phone, receiver_address, total_orders')
      .eq('phone_normalized', phone)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (custErr && custErr.code !== 'PGRST116') {
      console.warn('Customer lookup error (falling back to orders):', custErr.message)
    }

    if (customer) {
      return NextResponse.json({
        success: true,
        found: true,
        receiver_name: customer.receiver_name,
        sender_name: customer.sender_name,
        receiver_phone: customer.receiver_phone || null,
        receiver_address: customer.receiver_address || null,
        total_orders: customer.total_orders || 0,
      })
    }

    const { data: orders, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('receiver_name, sender_name, phone')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)

    if (orderError) throw orderError

    if (orders && orders.length > 0) {
      return NextResponse.json({
        success: true,
        found: true,
        receiver_name: orders[0].receiver_name,
        sender_name: orders[0].sender_name,
        total_orders: 0,
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
