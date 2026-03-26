'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Download, Shield } from 'lucide-react'

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
    <main className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <div className="p-[3px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#D4AF37]">
          <div className="p-[6px] bg-background">
            <div className="p-[2px] bg-gradient-to-br from-[#D4AF37]/60 via-[#B8860B]/40 to-[#D4AF37]/60">
              <div className="bg-card px-8 py-12 md:px-16 md:py-16">
                <div className="text-center mb-10">
                  <p className="text-xs tracking-[0.35em] uppercase text-gold mb-4">
                    Flower Intention Certificate
                  </p>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-wider">
                    NHẤT TÂM HOA
                  </h1>
                  <p className="text-xs tracking-[0.3em] text-gold mt-2">
                    {cert.code}
                  </p>
                </div>

                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-10" />

                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Sender</p>
                    <p className="text-xl text-foreground italic font-display">{cert.sender}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Receiver</p>
                    <p className="text-xl text-foreground italic font-display">{cert.receiver}</p>
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Message</p>
                    <p className="text-sm text-gold leading-relaxed italic">{cert.message}</p>
                  </div>
                  {cert.ritual && (
                    <div>
                      <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Ritual</p>
                      <p className="text-sm text-gold">{cert.ritual}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Date</p>
                    <p className="text-sm text-gold">
                      {new Date(cert.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-10" />

                <div className="p-4 border border-gold/20 bg-black/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-gold" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold">
                      Blockchain Verification
                    </p>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono break-all">
                    {cert.blockchain_hash}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[9px] text-green-500 uppercase tracking-widest">Verified</span>
                  </div>
                </div>

                <p className="text-center text-foreground font-display text-lg tracking-[0.15em] mt-10">
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
            className="flex items-center gap-2 text-sm text-gold hover:text-gold transition-colors tracking-wider uppercase"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
