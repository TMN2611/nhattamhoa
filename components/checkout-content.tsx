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
    errors.fullName = 'Vui long nhap ten cua ban'
  }
  if (!data.recipientName.trim()) {
    errors.recipientName = 'Vui long nhap ten nguoi nhan'
  }
  if (!data.phoneNumber.trim()) {
    errors.phoneNumber = 'Vui long nhap so dien thoai'
  } else if (!/^[0-9]{9,11}$/.test(data.phoneNumber.replace(/\s/g, ''))) {
    errors.phoneNumber = 'So dien thoai khong hop le'
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
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm mb-2 tracking-wide"
        style={{ color: '#C5A55A' }}
      >
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3.5 font-serif text-base transition-colors duration-300 focus:outline-none"
        style={{
          border: '1px solid rgba(212,175,55,0.2)',
          background: '#0D0B09',
          color: '#F5E6C8',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)'
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'
        }}
      />
      {error && (
        <p className="mt-1.5 text-xs" style={{ color: '#A52525' }}>{error}</p>
      )}
    </div>
  )
}

function CertificateReveal({
  buyerName,
  recipientName,
}: {
  buyerName: string
  recipientName: string
}) {
  return (
    <div className="flex flex-col items-center gap-10 py-8">
      {/* Success message */}
      <div className="text-center space-y-3 animate-in fade-in duration-700">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ border: '1px solid rgba(212,175,55,0.3)' }}
        >
          <ShieldCheck className="h-7 w-7" style={{ color: '#D4AF37' }} />
        </div>
        <p
          className="text-[10px] tracking-[0.5em] uppercase"
          style={{ color: '#D4AF37' }}
        >
          {'L\u1eddi th\u1ec1 \u0111\u00e3 \u0111\u01b0\u1ee3c ghi nh\u1eadn'}
        </p>
        <h2
          className="text-2xl md:text-3xl font-light font-display"
          style={{ color: '#F5E6C8' }}
        >
          {'Ch\u1ee9ng th\u01b0 c\u1ee7a b\u1ea1n \u0111\u00e3 s\u1eb5n s\u00e0ng'}
        </h2>
      </div>

      {/* Certificate */}
      <CommitmentCertificate
        buyerName={buyerName}
        recipientName={recipientName}
        animate={true}
      />

      {/* Back home */}
      <Link
        href="/"
        className="flex items-center gap-2 text-sm transition-colors tracking-wider uppercase"
        style={{ color: '#C5A55A' }}
      >
        <ArrowLeft className="h-4 w-4" />
        {'Quay v\u1ec1 trang ch\u1ee7'}
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
  const [isTransitioning, setIsTransitioning] = useState(false)

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

  function handleSubmit() {
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setIsTransitioning(true)
    setTimeout(() => {
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <CertificateReveal
        buyerName={formData.fullName}
        recipientName={formData.recipientName}
      />
    )
  }

  return (
    <div
      className="transition-all duration-800 ease-out"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? 'scale(0.97) translateY(10px)' : 'scale(1) translateY(0)',
      }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left: Live Certificate Preview */}
        <div className="order-2 lg:order-1">
          <p
            className="text-[10px] tracking-[0.4em] uppercase mb-6 text-center lg:text-left"
            style={{ color: '#C5A55A' }}
          >
            {'Xem tr\u01b0\u1edbc ch\u1ee9ng th\u01b0'}
          </p>
          <CommitmentCertificate
            buyerName={formData.fullName || "Buyer's Name"}
            recipientName={formData.recipientName || "Recipient's Name"}
            animate={false}
          />
        </div>

        {/* Right: Form */}
        <div className="order-1 lg:order-2">
          <div className="mb-8">
            <p
              className="text-[10px] tracking-[0.4em] uppercase mb-3"
              style={{ color: '#D4AF37' }}
            >
              {'Th\u00f4ng tin cam k\u1ebft'}
            </p>
            <h2
              className="text-2xl md:text-3xl font-light font-display"
              style={{ color: '#F5E6C8' }}
            >
              {'Vi\u1ebft l\u1eddi th\u1ec1 c\u1ee7a b\u1ea1n'}
            </h2>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{ color: '#8A7D65' }}
            >
              {'\u0110i\u1ec1n \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin \u0111\u1ec3 t\u1ea1o ch\u1ee9ng th\u01b0 cam k\u1ebft. T\u1ea5t c\u1ea3 c\u00e1c tr\u01b0\u1eddng \u0111\u1ec1u b\u1eaft bu\u1ed9c.'}
            </p>
          </div>

          <div className="space-y-5">
            <FormInput
              id="full-name"
              label="H\u1ecd v\u00e0 t\u00ean"
              icon={User}
              placeholder="Nh\u1eadp h\u1ecd v\u00e0 t\u00ean c\u1ee7a b\u1ea1n..."
              value={formData.fullName}
              onChange={updateField('fullName')}
              error={errors.fullName}
            />

            <FormInput
              id="recipient-name"
              label="T\u00ean ng\u01b0\u1eddi nh\u1eadn"
              icon={Heart}
              placeholder="Nh\u1eadp t\u00ean ng\u01b0\u1eddi b\u1ea1n y\u00eau th\u01b0\u01a1ng..."
              value={formData.recipientName}
              onChange={updateField('recipientName')}
              error={errors.recipientName}
            />

            <FormInput
              id="phone-number"
              label="S\u1ed1 \u0111i\u1ec7n tho\u1ea1i"
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
                className="flex items-center gap-2 text-sm mb-2 tracking-wide"
                style={{ color: '#C5A55A' }}
              >
                <PenLine className="h-4 w-4" />
                {'Th\u01b0 t\u00ecnh'}
              </label>
              <div
                className="p-1"
                style={{
                  border: '1px solid rgba(212,175,55,0.2)',
                  background: '#0D0B09',
                }}
              >
                <div className="letter-paper">
                  <textarea
                    id="love-letter"
                    value={formData.loveLetter}
                    onChange={(e) => updateField('loveLetter')(e.target.value)}
                    placeholder="G\u1eedi ng\u01b0\u1eddi t\u00f4i y\u00eau th\u01b0\u01a1ng nh\u1ea5t..."
                    rows={5}
                    className="w-full bg-transparent px-3 py-2 resize-none focus:outline-none italic leading-8 font-serif text-base"
                    style={{ color: '#F5E6C8' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Vow summary */}
          <div
            className="mt-8 p-6 text-center"
            style={{
              border: '1px solid rgba(212,175,55,0.12)',
              background: 'rgba(13,11,9,0.8)',
            }}
          >
            <p
              className="text-[9px] tracking-[0.4em] uppercase mb-3"
              style={{ color: '#D4AF37' }}
            >
              {'L\u1eddi th\u1ec1 Nh\u1ea5t T\u00e2m'}
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#C5A55A' }}
            >
              {formData.fullName && formData.recipientName ? (
                <>
                  {'B\u1ea1n x\u00e1c nh\u1eadn r\u1eb1ng t\u1ea5t c\u1ea3 hoa h\u1ed3ng Nh\u1ea5t T\u00e2m, h\u00f4m nay v\u00e0 m\u00e3i m\u00e3i, ch\u1ec9 d\u00e0nh cho '}
                  <span className="text-lg italic font-display" style={{ color: '#F5E6C8' }}>
                    {formData.recipientName}
                  </span>
                </>
              ) : (
                <span className="italic" style={{ color: '#555040' }}>
                  {'Nh\u1eadp t\u00ean \u0111\u1ec3 xem l\u1eddi th\u1ec1 c\u1ee7a b\u1ea1n...'}
                </span>
              )}
            </p>
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="mt-6 w-full py-4 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-500 cursor-pointer"
            style={
              canSubmit
                ? {
                    background: 'linear-gradient(90deg, #B8860B, #D4AF37, #B8860B)',
                    color: '#0A0A08',
                    boxShadow: '0 0 20px rgba(212,175,55,0.15)',
                  }
                : {
                    background: '#1A1814',
                    color: '#555040',
                    cursor: 'not-allowed',
                    border: '1px solid #2A2520',
                  }
            }
          >
            {'X\u00e1c nh\u1eadn l\u1eddi th\u1ec1 & Thanh to\u00e1n'}
          </button>

          {!canSubmit && (
            <p
              className="mt-3 text-center text-xs"
              style={{ color: '#555040' }}
            >
              {'Vui l\u00f2ng \u0111i\u1ec1n \u0111\u1ea7y \u0111\u1ee7 t\u1ea5t c\u1ea3 c\u00e1c tr\u01b0\u1eddng \u0111\u1ec3 ti\u1ebfp t\u1ee5c'}
            </p>
          )}

          <p
            className="mt-4 text-center text-[10px] tracking-wider"
            style={{ color: '#555040' }}
          >
            {'Thanh to\u00e1n an to\u00e0n. Ch\u1ee9ng th\u01b0 s\u1ebd \u0111\u01b0\u1ee3c g\u1eedi sau khi x\u00e1c nh\u1eadn.'}
          </p>
        </div>
      </div>
    </div>
  )
}
