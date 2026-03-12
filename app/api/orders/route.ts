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
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ success: true, orders: data })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
