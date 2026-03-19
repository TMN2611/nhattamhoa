export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const rawPhone = searchParams.get('phone')

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
    }

    const phone = normalizePhone(rawPhone)
    if (phone.length < 9 || phone.length > 11) {
      return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('customers')
      .select('id, phone, sender_name, receiver_name, receiver_phone, receiver_address, total_orders')
      .eq('phone_normalized', phone)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (data && data.length > 0) {
      const match = data[0]
      return NextResponse.json({
        success: true,
        found: true,
        customer: {
          id: match.id,
          phone: match.phone,
          sender_name: match.sender_name,
          receiver_name: match.receiver_name,
          receiver_phone: match.receiver_phone || null,
          receiver_address: match.receiver_address || null,
          total_orders: match.total_orders || 0,
        }
      })
    }

    return NextResponse.json({ success: true, found: false })
  } catch (error: any) {
    console.error('Customer lookup error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const phone = normalizePhone(body.phone || '')

    if (!phone || phone.length < 9) {
      return NextResponse.json({ error: 'Valid phone is required' }, { status: 400 })
    }

    if (!body.sender_name || !body.receiver_name) {
      return NextResponse.json({ error: 'sender_name and receiver_name are required' }, { status: 400 })
    }

    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_normalized', phone)
      .order('updated_at', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      const match = existing[0]
      const newTotal = (match.total_orders || 0) + (body.increment_orders ? 1 : 0)
      const lastOrderAt = body.increment_orders ? new Date().toISOString() : match.last_order_at

      const updates: Record<string, any> = {
        sender_name: body.sender_name,
        receiver_name: body.receiver_name,
        total_orders: newTotal,
        last_order_at: lastOrderAt,
        updated_at: new Date().toISOString(),
      }

      if (body.receiver_phone !== undefined) updates.receiver_phone = body.receiver_phone
      if (body.receiver_address !== undefined) updates.receiver_address = body.receiver_address
      if (body.last_ai_message !== undefined) updates.last_ai_message = body.last_ai_message
      if (body.email !== undefined) updates.email = body.email

      const { data: updated, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', match.id)
        .select('*')
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, customer: updated, upserted: 'updated' })
    } else {
      const insert: Record<string, any> = {
        phone,
        sender_name: body.sender_name,
        receiver_name: body.receiver_name,
        total_orders: body.increment_orders ? 1 : 0,
        first_order_at: new Date().toISOString(),
        last_order_at: body.increment_orders ? new Date().toISOString() : null,
      }

      if (body.receiver_phone !== undefined) insert.receiver_phone = body.receiver_phone
      if (body.receiver_address !== undefined) insert.receiver_address = body.receiver_address
      if (body.last_ai_message !== undefined) insert.last_ai_message = body.last_ai_message
      if (body.email !== undefined) insert.email = body.email

      const { data: created, error } = await supabase
        .from('customers')
        .insert(insert)
        .select('*')
        .single()

      if (error) throw error
      return NextResponse.json({ success: true, customer: created, upserted: 'created' })
    }
  } catch (error: any) {
    console.error('Customer upsert error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
