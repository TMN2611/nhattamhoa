export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request) {
  if (!validateAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const orders = data || []
    const total = orders.length
    const pending = orders.filter(o => o.status === 'pending').length
    const paid = orders.filter(o => o.status === 'paid').length
    const minting = orders.filter(o => o.status === 'minting').length
    const minted = orders.filter(o => o.status === 'minted' || o.status === 'completed').length
    const revoked = orders.filter(o => o.status === 'revoked').length
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
