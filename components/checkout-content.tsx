'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { User, Heart, Phone, PenLine, ShieldCheck, ArrowLeft, Sparkles, Download } from 'lucide-react'
import { CommitmentCertificate } from '@/components/commitment-certificate'

interface FormData {
  senderName: string
  receiverName: string
  phone: string
  message: string
}

interface FormErrors {
  senderName?: string
  receiverName?: string
  phone?: string
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.senderName.trim()) errors.senderName = 'Vui lòng nhập tên của bạn'
  if (!data.receiverName.trim()) errors.receiverName = 'Vui lòng nhập tên người nhận'
  if (!data.phone.trim()) {
    errors.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^[0-9]{9,11}$/.test(data.phone.replace(/\s/g, ''))) {
    errors.phone = 'Số điện thoại không hợp lệ'
  }
  return errors
}

function isFormComplete(data: FormData): boolean {
  return data.senderName.trim().length > 0 && data.receiverName.trim().length > 0 && data.phone.trim().length > 0 && data.message.trim().length > 0
}

function FormInput({ id, label, icon: Icon, type = 'text', placeholder, value, onChange, error }: {
  id: string; label: string; icon: React.ComponentType<{ className?: string }>; type?: string; placeholder: string; value: string; onChange: (val: string) => void; error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm text-[#C5A55A] mb-2 tracking-wide">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-[#D4AF37]/20 bg-[#0d0b09] px-4 py-3.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 transition-colors font-serif text-base"
      />
      {error && <p className="mt-1.5 text-xs text-[#A52525]">{error}</p>}
    </div>
  )
}

export function CheckoutContent() {
  const [formData, setFormData] = useState<FormData>({
    senderName: '',
    receiverName: '',
    phone: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [orderResult, setOrderResult] = useState<{ orderId: string; certificate_id: string; blockchain_hash: string } | null>(null)
  const [generatingMessage, setGeneratingMessage] = useState(false)
  const [publicVow, setPublicVow] = useState(true)
  const [ritualType, setRitualType] = useState('')
  const [offering, setOffering] = useState('')
  const [moment, setMoment] = useState('')
  const [productId, setProductId] = useState('')

  useEffect(() => {
    setRitualType(localStorage.getItem('ntt_ritual_type') || '')
    setOffering(localStorage.getItem('ntt_offering') || '')
    setMoment(localStorage.getItem('ntt_moment') || '')
    setProductId(localStorage.getItem('ntt_selected_product') || '')
  }, [])

  const updateField = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => { const next = { ...prev }; delete next[field as keyof FormErrors]; return next })
      }
    },
    [errors]
  )

  async function handleAISuggest() {
    setGeneratingMessage(true)
    try {
      const res = await fetch('/api/generate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_name: formData.receiverName || 'người thương',
          sender_name: formData.senderName || 'người gửi',
          ritual_type: ritualType,
          moment: moment,
        }),
      })
      const data = await res.json()
      if (data.success && data.message) {
        setFormData(prev => ({ ...prev, message: data.message }))
      }
    } catch (err) {
      console.error('AI suggest error:', err)
    } finally {
      setGeneratingMessage(false)
    }
  }

  async function handleSubmit() {
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsFlipping(true)

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_name: formData.senderName,
          receiver_name: formData.receiverName,
          phone: formData.phone,
          message: formData.message,
          ritual_type: ritualType,
          offering: offering,
          product_id: productId || undefined,
          public_vow: publicVow,
        }),
      })

      const data = await response.json()
      console.log('Order response:', data)
      if (data.success) {
        setOrderResult({
          orderId: data.orderId,
          certificate_id: data.certificate_id || data.certificate_code,
          blockchain_hash: data.blockchain_hash,
        })
        localStorage.setItem('ntt_returning_user', 'true')
        localStorage.removeItem('ntt_ritual_step')
        localStorage.removeItem('ntt_moment')
        localStorage.removeItem('ntt_ritual_type')
        localStorage.removeItem('ntt_offering')
        setTimeout(() => setSubmitted(true), 700)
      } else {
        console.error('Order failed:', data.error, data.details)
        setIsFlipping(false)
        alert('Lỗi tạo đơn hàng: ' + (data.error || 'Vui lòng thử lại'))
      }
    } catch (err) {
      console.error('Failed to create order', err)
      setIsFlipping(false)
      alert('Không thể kết nối. Vui lòng thử lại.')
    }
  }

  async function handleDownloadPDF() {
    if (!orderResult) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()

    doc.setFillColor(10, 10, 8)
    doc.rect(0, 0, 210, 297, 'F')
    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(1)
    doc.rect(10, 10, 190, 277)
    doc.rect(13, 13, 184, 271)

    doc.setTextColor(212, 175, 55)
    doc.setFontSize(10)
    doc.text('FLOWER INTENTION CERTIFICATE', 105, 35, { align: 'center' })
    doc.setTextColor(245, 230, 200)
    doc.setFontSize(28)
    doc.text('NHAT TAM HOA', 105, 55, { align: 'center' })
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(8)
    doc.text('ETERNAL ROSES', 105, 63, { align: 'center' })

    doc.setDrawColor(212, 175, 55)
    doc.line(60, 75, 150, 75)

    let y = 95
    const fields = [
      ['Sender', formData.senderName],
      ['Receiver', formData.receiverName],
      ['Message', formData.message],
      ['Ritual', ritualType || 'N/A'],
      ['Date', new Date().toLocaleDateString('vi-VN')],
      ['Certificate Code', orderResult.certificate_id],
      ['Blockchain Hash', orderResult.blockchain_hash],
    ]
    for (const [label, value] of fields) {
      doc.setTextColor(212, 175, 55)
      doc.setFontSize(8)
      doc.text(label.toUpperCase(), 30, y)
      doc.setTextColor(245, 230, 200)
      doc.setFontSize(11)
      if (label === 'Message' || label === 'Blockchain Hash') {
        const lines = doc.splitTextToSize(value || '', 150)
        doc.text(lines, 30, y + 8)
        y += 8 + lines.length * 6 + 10
      } else {
        doc.text(value || '', 30, y + 8)
        y += 22
      }
    }

    doc.setDrawColor(212, 175, 55)
    doc.line(60, y + 5, 150, y + 5)
    doc.setTextColor(197, 165, 90)
    doc.setFontSize(9)
    doc.text('MOT DOI, MOT DOA, MOT NGUOI.', 105, y + 18, { align: 'center' })

    doc.save(`certificate-${orderResult.certificate_id}.pdf`)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-10 py-8 animate-in fade-in duration-700">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30">
            <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37]">
            Nghi lễ đã hoàn tất
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
            Lời nguyện của bạn đã được ghi nhận
          </h2>
          <p className="text-sm text-[#8A7D65] mt-3">
            Chứng thư sẽ được gửi đến email của bạn.
          </p>
        </div>

        <CommitmentCertificate
          buyerName={formData.senderName}
          recipientName={formData.receiverName}
          blockchainData={orderResult ? { orderId: orderResult.certificate_id, txHash: orderResult.blockchain_hash } : null}
          animate={true}
        />

        {orderResult && (
          <div className="space-y-4 w-full max-w-md">
            <div className="p-4 bg-[#0d0b09] border border-[#D4AF37]/20 text-center">
              <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-2">Mã chứng thư</p>
              <p className="text-lg text-[#F5E6C8] font-mono">{orderResult.certificate_id}</p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-wider uppercase text-xs transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
              <Download className="h-4 w-4" />
              Download Certificate PDF
            </button>
          </div>
        )}

        <Link href="/" className="flex items-center gap-2 text-sm text-[#C5A55A] hover:text-[#D4AF37] transition-colors tracking-wider uppercase">
          <ArrowLeft className="h-4 w-4" />
          Quay về trang chủ
        </Link>
      </div>
    )
  }

  const canSubmit = isFormComplete(formData)

  return (
    <div className={`perspective-container transition-all duration-700 ${isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="order-2 lg:order-1">
          <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A] mb-6 text-center lg:text-left">
            Xem trước chứng thư
          </p>
          <CommitmentCertificate
            buyerName={formData.senderName || "Sender's Name"}
            recipientName={formData.receiverName || "Receiver's Name"}
            animate={false}
          />
        </div>

        <div className="order-1 lg:order-2">
          <div className="mb-8">
            <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A] mb-3">Thông tin nghi lễ</p>
            <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
              Hoàn tất nghi lễ hoa
            </h2>
            {(ritualType || offering) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {ritualType && (
                  <span className="px-3 py-1 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] tracking-wider">
                    {ritualType}
                  </span>
                )}
                {offering && (
                  <span className="px-3 py-1 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#C5A55A] tracking-wider">
                    {offering}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <FormInput id="sender-name" label="Tên người gửi" icon={User} placeholder="Nhập họ và tên của bạn..." value={formData.senderName} onChange={updateField('senderName')} error={errors.senderName} />
            <FormInput id="receiver-name" label="Tên người nhận" icon={Heart} placeholder="Nhập tên người bạn yêu thương..." value={formData.receiverName} onChange={updateField('receiverName')} error={errors.receiverName} />
            <FormInput id="phone" label="Số điện thoại" icon={Phone} type="tel" placeholder="0xxx xxx xxx" value={formData.phone} onChange={updateField('phone')} error={errors.phone} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="message" className="flex items-center gap-2 text-sm text-[#C5A55A] tracking-wide">
                  <PenLine className="h-4 w-4" />
                  Lời nhắn
                </label>
                <button
                  onClick={handleAISuggest}
                  disabled={generatingMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {generatingMessage ? 'Đang viết...' : 'AI Suggest Message'}
                </button>
              </div>
              <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-1">
                <div className="letter-paper">
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField('message')(e.target.value)}
                    placeholder="Gửi người tôi yêu thương nhất..."
                    rows={5}
                    className="w-full bg-transparent px-3 py-2 text-[#F5E6C8] placeholder:text-[#555040] resize-none focus:outline-none italic leading-8 font-serif text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <label className="mt-6 flex items-center gap-3 cursor-pointer group">
            <div className={`h-5 w-5 flex-shrink-0 border transition-all duration-300 flex items-center justify-center ${
              publicVow ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-[#D4AF37]/40 group-hover:border-[#D4AF37]/60'
            }`}>
              {publicVow && (
                <svg className="h-3 w-3 text-[#0a0a08]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={publicVow}
              onChange={(e) => setPublicVow(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-[#C5A55A]/80">
              Cho phép hiển thị lời thề trên trang &ldquo;Những Lời Thề&rdquo;
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`mt-6 w-full py-4 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-500 cursor-pointer ${
              canSubmit
                ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]'
                : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
            }`}
          >
            Xác nhận & Thanh toán
          </button>

          {!canSubmit && (
            <p className="mt-3 text-center text-sm text-[#6B5F4A]">
              Vui lòng điền đầy đủ tất cả các trường để tiếp tục
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
