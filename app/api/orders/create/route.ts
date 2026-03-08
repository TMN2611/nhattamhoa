export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCertificateCode, generateBlockchainHash } from '@/lib/certificate'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sender_name, receiver_name, phone, message, ritual_type, offering, product_id, public_vow } = body

    if (!sender_name || !receiver_name || !phone || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const certificate_id = generateCertificateCode()
    const blockchain_hash = generateBlockchainHash({
      sender: sender_name,
      receiver: receiver_name,
      message,
      ritual: ritual_type || '',
      timestamp: new Date().toISOString(),
    })

    const { data, error } = await supabase
      .from('orders')
      .insert({
        sender_name,
        receiver_name,
        phone,
        message,
        ritual_type: ritual_type || null,
        offering: offering || null,
        product_id: product_id || null,
        public_vow: public_vow !== false,
        certificate_id,
        blockchain_hash,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase order creation error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      order: data,
      orderId: data.id,
      certificate_id,
      blockchain_hash,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
