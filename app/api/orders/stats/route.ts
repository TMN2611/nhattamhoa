export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { getOrderStats } from '@/lib/db'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = getOrderStats()
    return NextResponse.json({ success: true, stats })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
