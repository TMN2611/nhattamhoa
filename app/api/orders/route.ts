import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
