export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { getAllOrders } from '@/lib/db'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const orders = getAllOrders()
    return NextResponse.json({ success: true, orders })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
