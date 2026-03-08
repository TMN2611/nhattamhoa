export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { createOrder } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const { buyerName, recipientName, phoneNumber, loveLetter } = await req.json()

    if (!buyerName || !recipientName || !phoneNumber || !loveLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const order = createOrder({ buyerName, recipientName, phoneNumber, loveLetter })

    return NextResponse.json({
      success: true,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
