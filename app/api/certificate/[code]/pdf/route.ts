export const dynamic = "force-dynamic"

import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import path from 'path'
import fs from 'fs'

export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  try {
    let orderData: any = null

    const { rows: certRows } = await pool.query(
      'SELECT * FROM certificates WHERE certificate_code = $1',
      [code]
    )

    if (certRows.length > 0) {
      const certData = certRows[0]
      const { rows: orderRows } = await pool.query(
        'SELECT * FROM orders WHERE id = $1',
        [certData.order_id]
      )

      if (orderRows.length > 0) {
        const order = orderRows[0]
        orderData = { ...order, blockchain_hash: certData.hash || certData.blockchain_hash || order.blockchain_hash }
      }
    }

    if (!orderData) {
      const { rows: orderRows } = await pool.query(
        'SELECT * FROM orders WHERE certificate_id = $1',
        [code]
      )

      if (orderRows.length > 0) orderData = orderRows[0]
    }

    if (!orderData) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    const PDFDocument = (await import('pdfkit')).default
    const QRCode = await import('qrcode')

    const fontPath = path.join(process.cwd(), 'fonts', 'DejaVuSans.ttf')
    if (!fs.existsSync(fontPath)) {
      return NextResponse.json({ error: 'Font file not found' }, { status: 500 })
    }

    const host = req.headers.get('host') || 'nhattamhoa.replit.app'
    const protocol = req.headers.get('x-forwarded-proto') || 'https'
    const verifyUrl = `${protocol}://${host}/verify/${code}`

    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      color: { dark: '#D4AF37', light: '#0a0a08' },
    })
    const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64')

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))

    const pdfReady = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
    })

    doc.registerFont('Vietnamese', fontPath)
    doc.font('Vietnamese')

    doc.rect(0, 0, 595, 842).fill('#0a0a08')

    doc.strokeColor('#D4AF37').lineWidth(2)
    doc.rect(20, 20, 555, 802).stroke()
    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.rect(25, 25, 545, 792).stroke()

    const cx = 297.5

    doc.fillColor('#D4AF37').fontSize(10)
    doc.text('FLOWER INTENTION CERTIFICATE', 0, 55, { align: 'center', width: 595 })

    doc.fillColor('#F5E6C8').fontSize(32)
    doc.text('NHẤT TÂM HOA', 0, 80, { align: 'center', width: 595 })

    doc.fillColor('#D4AF37').fontSize(9)
    doc.text('ETERNAL ROSES', 0, 120, { align: 'center', width: 595 })

    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.moveTo(200, 145).lineTo(395, 145).stroke()

    doc.fillColor('#D4AF37').fontSize(8)
    doc.text(code, 0, 155, { align: 'center', width: 595 })

    let y = 185

    const fields = [
      { label: 'NGƯỜI GỬI', value: orderData.sender_name },
      { label: 'NGƯỜI NHẬN', value: orderData.receiver_name },
      { label: 'LỜI NHẮN', value: orderData.message },
      { label: 'NGHI THỨC', value: orderData.ritual_type || 'Lời Thề Vĩnh Cửu' },
      { label: 'NGÀY TẠO', value: new Date(orderData.created_at).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }) },
    ]

    for (const field of fields) {
      doc.fillColor('#D4AF37').fontSize(8)
      doc.text(field.label, 60, y)

      doc.fillColor('#F5E6C8').fontSize(12)
      if (field.label === 'LỜI NHẮN') {
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

    doc.fillColor('#D4AF37').fontSize(8)
    doc.text('XÁC THỰC BLOCKCHAIN', 60, y)
    doc.fillColor('#8A7D65').fontSize(7)
    doc.text(orderData.blockchain_hash || '', 60, y + 14, { width: 350 })

    doc.image(qrBuffer, 430, y - 10, { width: 100 })

    doc.fillColor('#8A7D65').fontSize(6)
    doc.text('Quét mã QR để xác thực', 430, y + 95, { width: 100, align: 'center' })

    const bottomY = 770
    doc.strokeColor('#D4AF37').lineWidth(0.5)
    doc.moveTo(200, bottomY).lineTo(395, bottomY).stroke()

    doc.fillColor('#C5A55A').fontSize(11)
    doc.text('Một đời, một đóa, một người.', 0, bottomY + 10, { align: 'center', width: 595 })

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
