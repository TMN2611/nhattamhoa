export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import path from 'path'
import fs from 'fs'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  try {
    let orderData: any = null

    const { data: certRows } = await supabase
      .from('certificates')
      .select('*')
      .eq('certificate_code', code)
      .limit(1)

    if (certRows && certRows.length > 0) {
      const certData = certRows[0]
      const { data: orderRows } = await supabase
        .from('orders')
        .select('*')
        .eq('id', certData.order_id)
        .limit(1)

      if (orderRows && orderRows.length > 0) {
        const order = orderRows[0]
        orderData = { ...order, blockchain_hash: certData.hash || certData.blockchain_hash || order.blockchain_hash }
      }
    }

    if (!orderData) {
      const { data: orderRows } = await supabase
        .from('orders')
        .select('*')
        .eq('certificate_id', code)
        .limit(1)

      if (orderRows && orderRows.length > 0) orderData = orderRows[0]
    }

    if (!orderData) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const fontPath = path.join(process.cwd(), 'fonts', 'DejaVuSans.ttf')
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ error: 'Font file not found at ' + fontPath }, { status: 500 })
    }

    const fontBytes = fs.readFileSync(fontPath)

    const host = req.headers.get('host') || 'nhattamhoa.replit.app'
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const verifyUrl = `${protocol}://${host}/certificate/${code}`

    const QRCode = await import('qrcode')
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#D4AF37', light: '#0a0a08' },
    })
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64')

    const PDFDocument = (await import('pdfkit')).default

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      autoFirstPage: false,
    })

    doc.registerFont('Vietnamese', fontBytes)

    doc.addPage({ size: 'A4', margin: 50 })
    doc.font('Vietnamese')

    const chunks: Buffer[] = []
    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const pdfReady = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    doc.rect(0, 0, 595, 842).fill('#0a0a08')

    doc.strokeColor('#D4AF37').lineWidth(2)
    doc.rect(20, 20, 555, 802).stroke()
    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.rect(25, 25, 545, 792).stroke()

    doc.font('Vietnamese')

    doc.fillColor('#D4AF37').fontSize(10)
    doc.text('FLOWER INTENTION CERTIFICATE', 0, 55, { align: 'center', width: 595 })

    doc.fillColor('#F5E6C8').fontSize(32)
    doc.text('NHAT TAM HOA', 0, 80, { align: 'center', width: 595 })

    doc.fillColor('#D4AF37').fontSize(9)
    doc.text('ETERNAL ROSES', 0, 120, { align: 'center', width: 595 })

    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.moveTo(200, 145).lineTo(395, 145).stroke()

    doc.fillColor('#D4AF37').fontSize(8)
    doc.text(code, 0, 155, { align: 'center', width: 595 })

    let y = 185

    const fields = [
      { label: 'NGUOI GUI', value: orderData.sender_name },
      { label: 'NGUOI NHAN', value: orderData.receiver_name },
      { label: 'LOI NHAN', value: orderData.message },
      { label: 'NGHI THUC', value: orderData.ritual_type || 'Loi The Vinh Cuu' },
      { label: 'NGAY TAO', value: new Date(orderData.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) },
    ]

    for (const field of fields) {
      doc.font('Vietnamese')
      doc.fillColor('#D4AF37').fontSize(8)
      doc.text(field.label, 60, y)

      doc.fillColor('#F5E6C8').fontSize(12)
      if (field.label === 'LOI NHAN') {
        const textHeight = doc.heightOfString(field.value || '', { width: 400 })
        doc.text(field.value || '', 60, y + 14, { width: 400 })
        y += 14 + textHeight + 16
      } else {
        doc.text(field.value || '', 60, y + 14)
        y += 40
      }
    }

    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.moveTo(200, y + 5).lineTo(395, y + 5).stroke()

    y += 20

    doc.font('Vietnamese')
    doc.fillColor('#D4AF37').fontSize(8)
    doc.text('XAC THUC BLOCKCHAIN', 60, y)
    doc.fillColor('#8A7D65').fontSize(7)
    doc.text(orderData.blockchain_hash || '', 60, y + 14, { width: 350 })

    doc.image(qrBuffer, 430, y - 10, { width: 100 })

    doc.font('Vietnamese')
    doc.fillColor('#8A7D65').fontSize(6)
    doc.text('Quet ma QR de xac thuc', 430, y + 95, { width: 100, align: 'center' })

    const bottomY = 770
    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.moveTo(200, bottomY).lineTo(395, bottomY).stroke()

    doc.font('Vietnamese')
    doc.fillColor('#C5A55A').fontSize(11)
    doc.text('Mot doi, mot doa, mot nguoi.', 0, bottomY + 10, { align: 'center', width: 595 })

    doc.end()

    const pdfBuffer = await pdfReady

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${code}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
