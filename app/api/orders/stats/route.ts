export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { validateAdminRequest } from '@/lib/admin-utils'

export async function GET(req: Request) {
  if (!validateAdminRequest(req).valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase.from('orders').select('status')

    if (error) throw error

    const rows = data || []
    const total = rows.length
    const pending = rows.filter((o: any) => o.status === 'pending').length
    const paid = rows.filter((o: any) => o.status === 'paid').length
    const minting = rows.filter((o: any) => o.status === 'minting').length
    const minted = rows.filter((o: any) => o.status === 'minted' || o.status === 'completed').length
    const revoked = rows.filter((o: any) => o.status === 'revoked').length
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
