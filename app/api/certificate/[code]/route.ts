export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  console.log("Certificate lookup for code:", code)

  try {
    const { data: certData, error: certErr } = await supabaseAdmin
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .single()

    if (certErr && certErr.code !== 'PGRST116') throw certErr

    if (certData) {
      console.log("Found certificate record:", JSON.stringify(certData))

      const { data: order, error: orderErr } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', certData.order_id)
        .single()

      if (orderErr && orderErr.code !== 'PGRST116') throw orderErr

      if (order) {
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
            hash: certData.hash || certData.blockchain_hash || order.blockchain_hash,
            blockchain_hash: certData.hash || certData.blockchain_hash || order.blockchain_hash,
            blockchain_tx: certData.blockchain_tx || '',
            qr_url: certData.qr_url || '',
            date: order.created_at,
            status: order.status,
          },
        })
      }
    }

    console.log("Certificate not found in certificates table, trying orders table directly")

    const { data: orderDirect, error: directErr } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('certificate_id', code)
      .single()

    if (directErr && directErr.code !== 'PGRST116') throw directErr

    if (orderDirect) {
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
          hash: orderDirect.blockchain_hash || '',
          blockchain_hash: orderDirect.blockchain_hash || '',
          blockchain_tx: '',
          qr_url: '',
          date: orderDirect.created_at,
          status: orderDirect.status,
        },
      })
    }

    console.log("Certificate not found anywhere.")
    return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
  } catch (error: any) {
    console.error("Certificate lookup error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
