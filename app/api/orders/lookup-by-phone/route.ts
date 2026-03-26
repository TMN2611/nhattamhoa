export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')?.trim()

  if (!phone) {
    return NextResponse.json({ error: 'Phone parameter required' }, { status: 400 })
  }

  const normalized = phone.replace(/\s+/g, '').replace(/^84/, '0')

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        sender_name,
        receiver_name,
        message,
        status,
        created_at,
        product_id
      `)
      .or(`phone.eq.${normalized},phone.eq.${phone}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] })
    }

    const productIds = [...new Set(orders.map(o => o.product_id).filter(Boolean))]
    let productMap: Record<string, string> = {}
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from('products')
        .select('id, name')
        .in('id', productIds)
      if (products) {
        productMap = Object.fromEntries(products.map(p => [p.id, p.name]))
      }
    }

    const certOrderIds = orders.filter(o => o.status === 'minted' || o.status === 'revoked').map(o => o.id)
    let certMap: Record<string, { certificate_code: string; blockchain_tx?: string }> = {}
    if (certOrderIds.length > 0) {
      const { data: certs } = await supabase
        .from('certificates')
        .select('order_id, certificate_code, blockchain_tx')
        .in('order_id', certOrderIds)
      if (certs) {
        certMap = Object.fromEntries(certs.map(c => [c.order_id, {
          certificate_code: c.certificate_code,
          blockchain_tx: c.blockchain_tx
        }]))
      }
    }

    const enriched = orders.map(order => ({
      id: order.id,
      sender_name: order.sender_name,
      receiver_name: order.receiver_name,
      message: order.message,
      status: order.status,
      created_at: order.created_at,
      product_name: order.product_id ? productMap[order.product_id] : undefined,
      certificate_code: certMap[order.id]?.certificate_code,
      blockchain_tx: certMap[order.id]?.blockchain_tx,
    }))

    return NextResponse.json({ success: true, orders: enriched })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
