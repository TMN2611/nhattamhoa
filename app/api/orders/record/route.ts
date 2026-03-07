import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { saveCertificateOnChain } from '@/lib/blockchain';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const txHash = await saveCertificateOnChain(
      orderId,
      order.buyerName,
      order.recipientName,
      order.loveLetter
    );

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'recorded',
        txHash,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Record order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
