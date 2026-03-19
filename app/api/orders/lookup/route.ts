export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    const { data: customerRows } = await supabase
      .from('customers')
      .select('sender_name, receiver_name, receiver_phone, receiver_address, total_orders')
      .eq('phone_normalized', phone)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (customerRows && customerRows.length > 0) {
      const customer = customerRows[0]
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

    const { data: orderRows } = await supabase
      .from('orders')
      .select('receiver_name, sender_name, phone, receiver_phone, receiver_address')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1)

    if (orderRows && orderRows.length > 0) {
      const order = orderRows[0]
      return NextResponse.json({
        success: true,
        found: true,
        receiver_name: order.receiver_name,
        sender_name: order.sender_name,
        receiver_phone: order.receiver_phone || null,
        receiver_address: order.receiver_address || null,
        total_orders: 0,
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
