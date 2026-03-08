export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('certificate_id', code)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      certificate: {
        code: data.certificate_id,
        sender: data.sender_name,
        receiver: data.receiver_name,
        message: data.message,
        ritual: data.ritual_type,
        offering: data.offering,
        blockchain_hash: data.blockchain_hash,
        date: data.created_at,
        status: data.status,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
