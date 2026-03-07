'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { User, Heart, Phone, PenLine, ShieldCheck, ArrowLeft } from 'lucide-react'
import { CommitmentCertificate } from '@/components/commitment-certificate'

interface FormData {
  fullName: string
  recipientName: string
  phoneNumber: string
  loveLetter: string
}

interface FormErrors {
  fullName?: string
  recipientName?: string
  phoneNumber?: string
}

function validateForm(data: FormData): FormErrors {
  const errors: FormErrors = {}
  if (!data.fullName.trim()) {
    errors.fullName = 'Vui lòng nhập tên của bạn'
  }
  if (!data.recipientName.trim()) {
    errors.recipientName = 'Vui lòng nhập tên người nhận'
  }
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'Vui lòng nhập số điện thoại'
  } else if (!/^[0-9]{9,11}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
    errors.phoneNumber = 'Số điện thoại không hợp lệ'
  }
  return errors
}

function isFormComplete(data: FormData): boolean {
  return (
    data.fullName.trim().length > 0 &&
    data.recipientName.trim().length > 0 &&
    data.phoneNumber.trim().length > 0 &&
    data.loveLetter.trim().length > 0
  )
}

function FormInput({
  id,
  label,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  type?: string
  placeholder: string
  value: string
  onChange: (val: string) => void
  error?: string
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
      {error && (
        <p className="mt-1.5 text-xs text-[#A52525]">{error}</p>
      )}
    </div>
  )
}

function CertificateReveal({
  buyerName,
  recipientName,
  blockchainData,
}: {
  buyerName: string
  recipientName: string
  blockchainData: { orderId: string, txHash: string } | null
}) {
  return (
    <div className="flex flex-col items-center gap-10 py-8 animate-in fade-in duration-700">
      {/* Success message */}
      <div className="text-center space-y-3">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30">
          <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
        </div>
        <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37]">
          Đơn hàng đã được nhận
        </p>
        <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
          {'Lời thề của bạn đã được ghi nhận'}
        </h2>
        <p className="text-sm text-[#8A7D65] mt-3">
          {'Quản trị viên sẽ xác nhận và ghi lên blockchain trong thời gian sớm nhất.'}
        </p>
      </div>

      {/* Certificate Preview */}
      <CommitmentCertificate
        buyerName={buyerName}
        recipientName={recipientName}
        blockchainData={blockchainData}
        animate={true}
      />

      {blockchainData && (
        <div className="p-4 bg-[#0d0b09] border border-[#D4AF37]/20 rounded text-center max-w-md">
          <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-2">
            Mã đơn hàng
          </p>
          <p className="text-sm text-[#F5E6C8] font-mono break-all">
            {blockchainData.orderId}
          </p>
        </div>
      )}

      {/* Back home */}
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-[#C5A55A] hover:text-[#D4AF37] transition-colors tracking-wider uppercase"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay về trang chủ
      </Link>
    </div>
  )
}

export function CheckoutContent() {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    recipientName: '',
    phoneNumber: '',
    loveLetter: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)
  const [blockchainData, setBlockchainData] = useState<{ orderId: string, txHash: string } | null>(null)

  const updateField = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[field as keyof FormErrors]
          return next
        })
      }
    },
    [errors]
  )

  const canSubmit = isFormComplete(formData)

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
          buyerName: formData.fullName,
          recipientName: formData.recipientName,
          phoneNumber: formData.phoneNumber,
          loveLetter: formData.loveLetter,
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setBlockchainData({ orderId: data.orderId, txHash: '' });
      }
    } catch (err) {
      console.error("Failed to create order", err);
    }

    setTimeout(() => {
      setSubmitted(true)
    }, 700)
  }

  if (submitted) {
    return (
      <CertificateReveal
        buyerName={formData.fullName}
        recipientName={formData.recipientName}
        blockchainData={blockchainData}
      />
    )
  }

  return (
    <div className={`perspective-container transition-all duration-700 ${isFlipping ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: Certificate Preview */}
        <div className="order-2 lg:order-1">
          <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A] mb-6 text-center lg:text-left">
            Xem trước chứng thư
          </p>
          <CommitmentCertificate
            buyerName={formData.fullName || 'Buyer\'s Name'}
            recipientName={formData.recipientName || 'Recipient\'s Name'}
            animate={false}
          />
        </div>

        {/* Right: Form */}
        <div className="order-1 lg:order-2">
          <div className="mb-8">
            <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A] mb-3">
              Thông tin cam kết
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
              {'Viết lời thề của bạn'}
            </h2>
            <p className="mt-2 text-sm text-[#8A7D65] leading-relaxed">
              {'Điền đầy đủ thông tin để tạo chứng thư cam kết. Tất cả các trường đều bắt buộc.'}
            </p>
          </div>

          <div className="space-y-5">
            <FormInput
              id="full-name"
              label="Họ và tên"
              icon={User}
              placeholder="Nhập họ và tên của bạn..."
              value={formData.fullName}
              onChange={updateField('fullName')}
              error={errors.fullName}
            />

            <FormInput
              id="recipient-name"
              label="Tên người nhận"
              icon={Heart}
              placeholder="Nhập tên người bạn yêu thương..."
              value={formData.recipientName}
              onChange={updateField('recipientName')}
              error={errors.recipientName}
            />

            <FormInput
              id="phone-number"
              label="Số điện thoại"
              icon={Phone}
              type="tel"
              placeholder="0xxx xxx xxx"
              value={formData.phoneNumber}
              onChange={updateField('phoneNumber')}
              error={errors.phoneNumber}
            />

            {/* Love letter */}
            <div>
              <label
                htmlFor="love-letter"
                className="flex items-center gap-2 text-sm text-[#C5A55A] mb-2 tracking-wide"
              >
                <PenLine className="h-4 w-4" />
                Thư tình
              </label>
              <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-1">
                <div className="letter-paper">
                  <textarea
                    id="love-letter"
                    value={formData.loveLetter}
                    onChange={(e) => updateField('loveLetter')(e.target.value)}
                    placeholder="Gửi người tôi yêu thương nhất..."
                    rows={5}
                    className="w-full bg-transparent px-3 py-2 text-[#F5E6C8] placeholder:text-[#555040] resize-none focus:outline-none italic leading-8 font-serif text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vow summary */}
          <div className="mt-8 border border-[#D4AF37]/15 bg-[#0d0b09]/80 p-6 text-center">
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#D4AF37] mb-3">
              Lời thề Nhất Tâm
            </p>
            <p className="text-sm text-[#C5A55A] leading-relaxed">
              {formData.fullName && formData.recipientName ? (
                <>
                  {'Bạn xác nhận rằng tất cả hoa hồng Nhất Tâm, hôm nay và mãi mãi, chỉ dành cho '}
                  <span className="text-[#F5E6C8] italic text-lg font-display">
                    {formData.recipientName}
                  </span>
                </>
              ) : (
                <span className="text-[#6B5F4A] italic">
                  {'Nhập tên để xem lời thề của bạn...'}
                </span>
              )}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`mt-6 w-full py-4 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-500 cursor-pointer ${
              canSubmit
                ? 'bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]'
                : 'bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]'
            }`}
          >
            {'Xác nhận lời thề & Thanh toán'}
          </button>

          {!canSubmit && (
            <p className="mt-3 text-center text-sm text-[#6B5F4A]">
              {'Vui lòng điền đầy đủ tất cả các trường để tiếp tục'}
            </p>
          )}

          <p className="mt-4 text-center text-xs text-[#6B5F4A] tracking-wider">
            {'Thanh toán an toàn. Chứng thư sẽ được gửi sau khi xác nhận.'}
          </p>
        </div>
      </div>
    </div>
  )
}
