export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { validateAdminRequest } from '@/lib/admin-utils'
import { generateCertificateCode, generateBlockchainHash } from '@/lib/certificate'
import { saveCertificateOnChain } from '@/lib/blockchain'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id])
    if (orderRows.length === 0) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const order = orderRows[0]

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

    await pool.query("UPDATE orders SET status = 'minting' WHERE id = $1", [id])

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

    let cert: any
    try {
      const { rows: certRows } = await pool.query(
        `INSERT INTO certificates (certificate_code, order_id, hash, blockchain_hash, blockchain_tx, qr_url)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [certCode, id, hash, hash, blockchainTx, qrUrl]
      )
      cert = certRows[0]
    } catch (certErr: any) {
      await pool.query(`UPDATE orders SET status = $1 WHERE id = $2`, [priorStatus, id])
      return NextResponse.json({ error: certErr.message }, { status: 500 })
    }

    await pool.query(
      `UPDATE orders SET status = 'minted', certificate_id = $1, blockchain_hash = $2 WHERE id = $3`,
      [certCode, blockchainTx || hash, id]
    )

    return NextResponse.json({ success: true, certificate: cert })
  } catch (error: any) {
    await pool.query("UPDATE orders SET status = 'pending' WHERE id = $1", [id])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
