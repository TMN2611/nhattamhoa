export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'
import { generateCertificateCode, generateBlockchainHash } from '@/lib/certificate'
import { saveCertificateOnChain } from '@/lib/blockchain'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { data: order, error: fetchErr } = await supabase.from('orders').select('*').eq('id', id).single()
    if (fetchErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status !== 'pending' && order.status !== 'paid') {
      const messages: Record<string, string> = {
        minted: 'Order is already minted',
        minting: 'Minting is already in progress',
        revoked: 'Cannot mint a revoked order',
      }
      return NextResponse.json(
        { error: messages[order.status] || `Cannot mint order with status: ${order.status}` },
        { status: 400 }
      )
    }

    const priorStatus = order.status

    await supabase.from('orders').update({ status: 'minting' }).eq('id', id)

    const certCode = generateCertificateCode()
    const now = new Date().toISOString()

    const hash = generateBlockchainHash({
      sender: order.sender_name || '',
      receiver: order.receiver_name || '',
      message: order.message || '',
      ritual: order.ritual_type || '',
      timestamp: now,
    })

    let blockchainTx: string | null = null
    try {
      blockchainTx = await saveCertificateOnChain(
        id,
        order.sender_name || '',
        order.receiver_name || '',
        order.message || ''
      )
    } catch (e) {
      console.warn('Blockchain save failed, continuing without tx:', e)
    }

    const qrUrl = `/verify/${certCode}`

    const { data: cert, error: certErr } = await supabase
      .from('certificates')
      .insert({
        certificate_code: certCode,
        order_id: id,
        hash,
        blockchain_hash: hash,
        blockchain_tx: blockchainTx,
        qr_url: qrUrl,
      })
      .select('*')
      .single()

    if (certErr) {
      await supabase.from('orders').update({ status: priorStatus }).eq('id', id)
      return NextResponse.json({ error: certErr.message }, { status: 500 })
    }

    await supabase
      .from('orders')
      .update({
        status: 'minted',
        certificate_id: certCode,
        blockchain_hash: blockchainTx || hash,
      })
      .eq('id', id)

    return NextResponse.json({ success: true, certificate: cert })
  } catch (error: any) {
    await supabase.from('orders').update({ status: 'pending' }).eq('id', id)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
