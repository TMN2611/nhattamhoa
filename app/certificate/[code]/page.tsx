'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Shield } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

interface CertificateData {
  code: string
  sender: string
  receiver: string
  message: string
  ritual: string
  offering: string
  blockchain_hash: string
  date: string
  status: string
}

export default function CertificatePage() {
  const params = useParams()
  const code = params.code as string
  const [cert, setCert] = useState<CertificateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/certificate/${code}`)
        const data = await res.json()
        if (data.success) {
          setCert(data.certificate)
        } else {
          setError('Không tìm thấy chứng thư.')
        }
      } catch {
        setError('Có lỗi xảy ra.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code])

  function handleDownloadPDF() {
    if (!cert) return
    window.open(`/api/certificate/${cert.code}/pdf`, '_blank')
  }

  const verifyUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/certificate/${code}`
    : `/certificate/${code}`

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gold">Đang tải chứng thư...</p>
      </main>
    )
  }

  if (error || !cert) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Link href="/lookup" className="text-gold text-sm tracking-wider uppercase hover:text-foreground transition-colors">
            Quay lại tra cứu
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a08] py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-[3px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#D4AF37]">
          <div className="p-[6px] bg-[#0a0a08]">
            <div className="p-[2px] bg-gradient-to-br from-[#D4AF37]/60 via-[#B8860B]/40 to-[#D4AF37]/60">
              <div className="bg-[#0d0b09] px-8 py-12 md:px-16 md:py-16">
                <div className="text-center mb-10">
                  <p className="text-xs tracking-[0.35em] uppercase text-[#D4AF37] mb-4">
                    Flower Intention Certificate
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-[#f5f0e8] font-display tracking-wider">
                    NHẤT TÂM HOA
                  </h1>
                  <p className="text-xs tracking-[0.3em] text-[#D4AF37] mt-2">
                    {cert.code}
                  </p>
                </div>

                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-10" />

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-1">Sender</p>
                    <p className="text-xl text-[#f5f0e8] italic font-display">{cert.sender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-1">Receiver</p>
                    <p className="text-xl text-[#f5f0e8] italic font-display">{cert.receiver}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-1">Message</p>
                    <p className="text-sm text-[#D4AF37]/90 leading-relaxed italic">{cert.message}</p>
                  </div>
                  {cert.ritual && (
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-1">Ritual</p>
                      <p className="text-sm text-[#D4AF37]/90">{cert.ritual}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-1">Date</p>
                    <p className="text-sm text-[#D4AF37]/90">
                      {new Date(cert.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-10" />

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 p-4 border border-[#D4AF37]/20 bg-[#1a1814]/60 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-4 w-4 text-[#D4AF37]" />
                      <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37]">
                        Blockchain Verification
                      </p>
                    </div>
                    <p className="text-[10px] text-[#8A7D65] font-mono break-all">
                      {cert.blockchain_hash}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-green-500 uppercase tracking-widest">Verified</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="p-3 bg-white rounded">
                      <QRCodeSVG
                        value={verifyUrl}
                        size={120}
                        level="H"
                        fgColor="#0a0a08"
                        bgColor="#ffffff"
                      />
                    </div>
                    <p className="text-[9px] text-[#8A7D65] tracking-wider uppercase">
                      Quét để xác thực
                    </p>
                  </div>
                </div>

                <p className="text-center text-[#f5f0e8] font-display text-lg tracking-[0.15em] mt-10">
                  MỘT ĐỜI, MỘT ĐÓA, MỘT NGƯỜI.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-wider uppercase text-xs transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          >
            <Download className="h-4 w-4" />
            Download Certificate PDF
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#f5f0e8] transition-colors tracking-wider uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
