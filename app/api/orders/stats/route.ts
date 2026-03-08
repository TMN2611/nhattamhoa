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
    const completed = orders.filter(o => o.status === 'completed').length

    return NextResponse.json({
      success: true,
      stats: { total, pending, completed },
    })
  } catch (error: any) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
