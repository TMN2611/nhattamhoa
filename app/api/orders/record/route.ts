export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { getOrderById, updateOrderStatus } from '@/lib/db'
import { saveCertificateOnChain } from '@/lib/blockchain'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function POST(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
    }

    const order = getOrderById(orderId)

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'recorded') {
      return NextResponse.json({ error: 'Order already recorded on blockchain' }, { status: 409 })
    }

    const txHash = await saveCertificateOnChain(
      orderId,
      order.buyerName,
      order.recipientName,
      order.loveLetter
    )

    const updatedOrder = updateOrderStatus(orderId, 'recorded', txHash)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error('Record order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
