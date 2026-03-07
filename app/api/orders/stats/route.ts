import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const total = await prisma.order.count();
    const pending = await prisma.order.count({ where: { status: 'pending' } });
    const recorded = await prisma.order.count({ where: { status: 'recorded' } });

    return NextResponse.json({
      success: true,
      stats: { total, pending, recorded },
    });
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
