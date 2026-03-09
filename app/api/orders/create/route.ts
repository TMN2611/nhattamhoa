export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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

    const orderData: Record<string, unknown> = {
      sender_name,
      receiver_name,
      message,
      phone,
      ritual_type,
      offering,
      public_vow,
      permanence_type,
      status: 'pending',
    }
    if (product_id) orderData.product_id = product_id

    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (error) {
      console.error("Order insert failed:", JSON.stringify(error))
      return NextResponse.json({
        error: error.message || 'Failed to create order',
        details: error,
      }, { status: 500 })
    }

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
