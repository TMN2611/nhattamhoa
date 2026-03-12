export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('status')

    if (error) throw error

    const orders = data || []
    const total = orders.length
    const pending = orders.filter((o: any) => o.status === 'pending').length
    const paid = orders.filter((o: any) => o.status === 'paid').length
    const minting = orders.filter((o: any) => o.status === 'minting').length
    const minted = orders.filter((o: any) => o.status === 'minted' || o.status === 'completed').length
    const revoked = orders.filter((o: any) => o.status === 'revoked').length
    const completed = minted

    return NextResponse.json({
      success: true,
      stats: { total, pending, paid, minting, minted, revoked, completed },
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
