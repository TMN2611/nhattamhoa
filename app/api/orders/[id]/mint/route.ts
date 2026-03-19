export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'
import { generateCertificateCode, generateBlockchainHash } from '@/lib/certificate'
import { saveCertificateOnChain, checkWalletBalance } from '@/lib/blockchain'

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

    // Check wallet balance before attempting mint
    const balanceCheck = await checkWalletBalance()
    if (!balanceCheck.isConfigured) {
      return NextResponse.json(
        {
          error: 'Blockchain not configured',
          details: 'Missing PRIVATE_KEY, NEXT_PUBLIC_RPC_URL, or NEXT_PUBLIC_CONTRACT_ADDRESS'
        },
        { status: 500 }
      )
    }

    if (!balanceCheck.hasBalance) {
      return NextResponse.json(
        {
          error: 'Insufficient MATIC in blockchain wallet',
          details: `Wallet ${balanceCheck.address} has 0 MATIC. Please fund the wallet to continue minting.`,
          wallet: balanceCheck.address,
          currentBalance: balanceCheck.formatted,
          action: 'Fund wallet and retry'
        },
        { status: 402 }
      )
    }

    // Mark as "minting" to prevent concurrent mint attempts
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
      // Attempt blockchain transaction
      blockchainTx = await saveCertificateOnChain(
        id,
        order.sender_name || '',
        order.receiver_name || '',
        order.message || ''
      )
      console.log(`[MINT SUCCESS] Order ${id} minted to blockchain: ${blockchainTx}`)
    } catch (blockchainError: any) {
      console.error(`[MINT FAILED] Order ${id} blockchain error:`, blockchainError.message)

      // Rollback status to prior (paid or pending)
      await supabase.from('orders').update({ status: priorStatus }).eq('id', id)

      const errorName = blockchainError.name || 'BlockchainError'

      if (errorName === 'InsufficientFunds') {
        const balance = await checkWalletBalance()
        return NextResponse.json(
          {
            error: 'Insufficient MATIC in wallet',
            details: blockchainError.message,
            wallet: balance.address,
            currentBalance: balance.formatted,
            requiredAction: 'Fund wallet with MATIC and retry mint',
            orderId: id,
            orderStatus: priorStatus
          },
          { status: 402 }
        )
      }

      if (errorName === 'BlockchainNotConfigured') {
        return NextResponse.json(
          {
            error: 'Blockchain not configured',
            details: blockchainError.message
          },
          { status: 500 }
        )
      }

      // Generic blockchain error - order rolled back to prior status
      return NextResponse.json(
        {
          error: 'Blockchain transaction failed',
          details: blockchainError.message,
          orderId: id,
          orderStatus: priorStatus,
          retryable: true
        },
        { status: 502 }
      )
    }

    // Only create certificate if blockchain succeeded
    if (!blockchainTx) {
      await supabase.from('orders').update({ status: priorStatus }).eq('id', id)
      return NextResponse.json(
        { error: 'Blockchain transaction hash not received' },
        { status: 502 }
      )
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
      console.error(`[MINT ERROR] Certificate creation failed for order ${id}:`, certErr.message)
      // Rollback order status since certificate failed
      await supabase.from('orders').update({ status: priorStatus }).eq('id', id)
      return NextResponse.json({ error: 'Failed to create certificate: ' + certErr.message }, { status: 500 })
    }

    // Mark order as minted
    await supabase
      .from('orders')
      .update({
        status: 'minted',
        certificate_id: certCode,
        blockchain_hash: blockchainTx,
      })
      .eq('id', id)

    console.log(`[MINT COMPLETE] Order ${id} successfully minted`)

    return NextResponse.json({ success: true, certificate: cert })
  } catch (error: any) {
    console.error(`[MINT EXCEPTION] Unexpected error:`, error)
    // Try to rollback status
    try {
      await supabase.from('orders').update({ status: 'paid' }).eq('id', id)
    } catch (rollbackErr) {
      console.error('Failed to rollback status:', rollbackErr)
    }
    return NextResponse.json({ error: 'Unexpected error: ' + error.message }, { status: 500 })
  }
}
