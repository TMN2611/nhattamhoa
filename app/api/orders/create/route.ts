export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateCertificateCode, generateBlockchainHash } from '@/lib/certificate'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log("Creating order:", JSON.stringify(body))

    const sender_name = body.sender_name || body.sender
    const receiver_name = body.receiver_name || body.receiver
    const phone = body.phone || ''
    const message = body.message
    const ritual_type = body.ritual_type || body.ritual || null
    const offering = body.offering || null
    const product_id = body.product_id || null
    const public_vow = body.public_vow !== undefined ? body.public_vow : (body.publicVow !== undefined ? body.publicVow : true)

    if (!sender_name || !receiver_name || !message) {
      return NextResponse.json({ error: 'Missing required fields: sender_name, receiver_name, message' }, { status: 400 })
    }

    const certificate_id = generateCertificateCode()
    const blockchain_hash = generateBlockchainHash({
      sender: sender_name,
      receiver: receiver_name,
      message,
      ritual: ritual_type || '',
      timestamp: new Date().toISOString(),
    })

    console.log("Generated certificate:", certificate_id)
    console.log("Generated hash:", blockchain_hash)

    const fullOrderData: Record<string, unknown> = {
      sender_name,
      receiver_name,
      message,
      phone,
      ritual_type,
      offering,
      certificate_id,
      blockchain_hash,
      public_vow,
      status: 'pending',
    }
    if (product_id) fullOrderData.product_id = product_id

    let data: any = null
    let insertError: any = null

    const result1 = await supabase
      .from('orders')
      .insert(fullOrderData)
      .select()
      .single()

    if (!result1.error) {
      data = result1.data
    } else {
      console.log("Full insert failed, trying with fewer columns:", result1.error.message)

      const minimalOrderData: Record<string, unknown> = {
        sender_name,
        receiver_name,
        message,
      }

      const optionalFields: Record<string, unknown> = {
        phone, ritual_type, offering, certificate_id,
        blockchain_hash, public_vow, status: 'pending',
      }
      if (product_id) optionalFields.product_id = product_id

      for (const [key, value] of Object.entries(optionalFields)) {
        minimalOrderData[key] = value
      }

      const fieldsToTry = Object.keys(optionalFields)
      let currentData = { ...minimalOrderData }

      for (let attempt = 0; attempt <= fieldsToTry.length; attempt++) {
        const result = await supabase
          .from('orders')
          .insert(currentData)
          .select()
          .single()

        if (!result.error) {
          data = result.data
          break
        }

        const missingCol = result.error.message.match(/Could not find the '(\w+)' column/)?.[1]
        if (missingCol && currentData[missingCol] !== undefined) {
          console.log(`Removing missing column: ${missingCol}`)
          delete currentData[missingCol]
        } else {
          insertError = result.error
          console.error("Insert failed:", JSON.stringify(result.error))
          break
        }
      }
    }

    if (!data) {
      return NextResponse.json({
        error: insertError?.message || 'Failed to create order',
        details: insertError,
      }, { status: 500 })
    }

    console.log("Order created successfully:", JSON.stringify(data))

    const { error: certError } = await supabase
      .from('certificates')
      .insert({
        certificate_code: certificate_id,
        order_id: data.id,
        blockchain_hash: blockchain_hash,
      })

    if (certError) {
      console.error('Certificate creation error:', JSON.stringify(certError))
    } else {
      console.log("Certificate record created:", certificate_id)
    }

    return NextResponse.json({
      success: true,
      order: data,
      orderId: data.id,
      certificate_id,
      certificate_code: certificate_id,
      blockchain_hash,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
