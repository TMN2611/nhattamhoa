import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveCertificateOnChain } from '@/lib/blockchain';

export async function POST(req: Request) {
  try {
    const { buyerName, recipientName, message } = await req.json();

    if (!buyerName || !recipientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const orderId = uuidv4();
    
    // In a real scenario, we might want to handle this as an async background task 
    // but the prompt asks to return the txHash.
    const txHash = await saveCertificateOnChain(orderId, buyerName, recipientName, message);

    return NextResponse.json({
      success: true,
      orderId,
      txHash,
    });
  } catch (error: any) {
    console.error('Blockchain certificate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
