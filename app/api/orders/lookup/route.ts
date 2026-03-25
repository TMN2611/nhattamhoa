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
    const flow = searchParams.get('flow') || 'gift'

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    const phone = normalizePhone(rawPhone)

    if (phone.length < 9 || phone.length > 11) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    // For RITUAL flow: look for the FIRST ritual order specifically
    // This enforces "Một đời, một người" — One Person, One Lifetime
    if (flow === 'ritual') {
      const { data: ritualOrders } = await supabase
        .from('orders')
        .select('receiver_name, sender_name, phone, receiver_phone, receiver_address, ritual_type, created_at')
        .eq('phone', phone)
        .not('ritual_type', 'is', null)
        .neq('ritual_type', 'Gift')
        .order('created_at', { ascending: true })
        .limit(1)

      if (ritualOrders && ritualOrders.length > 0) {
        const order = ritualOrders[0]
        return NextResponse.json({
          success: true,
          found: true,
          receiver_name: order.receiver_name,
          sender_name: order.sender_name,
          receiver_phone: order.receiver_phone || null,
          receiver_address: order.receiver_address || null,
          total_orders: 1,
          // Indicate that this is a locked ritual commitment
          is_ritual_locked: true,
          ritual_type: order.ritual_type,
        })
      }

      // Also check for ritual orders via ritual_type existing in product_type
      const { data: ritualViaProduct } = await supabase
        .from('orders')
        .select(`
          receiver_name, sender_name, phone, receiver_phone, receiver_address, created_at,
          product:products!orders_product_id_fkey(product_type)
        `)
        .eq('phone', phone)
        .order('created_at', { ascending: true })
        .limit(5)

      if (ritualViaProduct && ritualViaProduct.length > 0) {
        const ritualOrder = ritualViaProduct.find((o: any) => o.product?.product_type === 'ritual')
        if (ritualOrder) {
          return NextResponse.json({
            success: true,
            found: true,
            receiver_name: ritualOrder.receiver_name,
            sender_name: ritualOrder.sender_name,
            receiver_phone: ritualOrder.receiver_phone || null,
            receiver_address: ritualOrder.receiver_address || null,
            total_orders: 1,
            is_ritual_locked: true,
          })
        }
      }

      // No ritual orders found — allow new ritual
      return NextResponse.json({ success: true, found: false, is_ritual_locked: false })
    }

    // For GIFT flow: check customers table first, then any order
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
        is_ritual_locked: false,
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
        is_ritual_locked: false,
      })
    }

    return NextResponse.json({ success: true, found: false, is_ritual_locked: false })
  } catch (error: any) {
    console.error('Lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
