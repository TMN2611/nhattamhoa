export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  console.log("Certificate lookup for code:", code)

  try {
    const { data: certData, error: certError } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .single()

    if (certData && !certError) {
      console.log("Found certificate record:", JSON.stringify(certData))

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', certData.order_id)
        .single()

      if (order && !orderError) {
        console.log("Found order:", JSON.stringify(order))
        return NextResponse.json({
          success: true,
          certificate: {
            code: code,
            sender: order.sender_name,
            receiver: order.receiver_name,
            message: order.message,
            ritual: order.ritual_type,
            offering: order.offering,
            blockchain_hash: certData.blockchain_hash || order.blockchain_hash,
            date: order.created_at,
            status: order.status,
          },
        })
      }
    }

    console.log("Certificate not found in certificates table, trying orders table directly")

    const { data: orderDirect, error: orderDirectError } = await supabase
      .from('orders')
      .select('*')
      .eq('certificate_id', code)
      .single()

    if (orderDirect && !orderDirectError) {
      console.log("Found order directly:", JSON.stringify(orderDirect))
      return NextResponse.json({
        success: true,
        certificate: {
          code: orderDirect.certificate_id || code,
          sender: orderDirect.sender_name,
          receiver: orderDirect.receiver_name,
          message: orderDirect.message,
          ritual: orderDirect.ritual_type,
          offering: orderDirect.offering,
          blockchain_hash: orderDirect.blockchain_hash,
          date: orderDirect.created_at,
          status: orderDirect.status,
        },
      })
    }

    console.log("Certificate not found anywhere. Cert error:", certError, "Order error:", orderDirectError)
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  } catch (error: any) {
    console.error("Certificate lookup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
