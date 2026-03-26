'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Shield, CheckCircle, XCircle, ArrowLeft } from 'lucide-react'

interface VerifyData {
  code: string
  sender: string
  receiver: string
  message: string
  hash: string
  blockchain_tx: string
  date: string
  status: string
}

export default function VerifyPage() {
  const params = useParams()
  const code = params.code as string
  const [data, setData] = useState<VerifyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/certificate/${code}`)
        const json = await res.json()
        if (json.success) {
          const cert = json.certificate
          setData({
            code: cert.code,
            sender: cert.sender,
            receiver: cert.receiver,
            message: cert.message,
            hash: cert.hash || cert.blockchain_hash || '',
            blockchain_tx: cert.blockchain_tx || '',
            date: cert.date,
            status: cert.status,
          })
        } else {
          setError('Không tìm thấy chứng thư.')
        }
      } catch {
        setError('Có lỗi xảy ra khi xác thực.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [code])

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gold">Đang xác thực chứng thư...</p>
      </main>
    )
  }

  if (error || !data) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Xác thực thất bại</h1>
          <p className="text-destructive mb-6">{error}</p>
          <Link href="/" className="text-gold text-sm tracking-wider uppercase hover:text-foreground transition-colors">
            Về trang chủ
          </Link>
        </div>
      </main>
    )
  }

  const isValid = data.status === 'minted' || data.status === 'paid' || data.status === 'completed'
  const isRevoked = data.status === 'revoked'

  return (
    <main className="min-h-screen bg-background py-20 px-6">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.35em] uppercase text-gold mb-4">
            Certificate Verification
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-wider">
            NHẤT TÂM HOA
          </h1>
        </div>

        <div className="p-[2px] bg-gradient-to-br from-[#D4AF37] via-[#B8860B] to-[#D4AF37]">
          <div className="bg-card px-8 py-10">
            <div className="flex items-center justify-center gap-3 mb-8">
              {isRevoked ? (
                <>
                  <XCircle className="h-8 w-8 text-destructive" />
                  <span className="text-lg text-destructive font-bold tracking-wider uppercase">Đã thu hồi</span>
                </>
              ) : isValid ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <span className="text-lg text-green-500 font-bold tracking-wider uppercase">Xác thực thành công</span>
                </>
              ) : (
                <>
                  <Shield className="h-8 w-8 text-gold" />
                  <span className="text-lg text-gold font-bold tracking-wider uppercase">Đang xử lý</span>
                </>
              )}
            </div>

            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-8" />

            <div className="space-y-5">
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Mã chứng thư</p>
                <p className="text-sm text-foreground font-mono">{data.code}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Người gửi</p>
                <p className="text-lg text-foreground italic font-display">{data.sender}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Người nhận</p>
                <p className="text-lg text-foreground italic font-display">{data.receiver}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Lời nhắn</p>
                <p className="text-sm text-gold leading-relaxed italic">{data.message}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Ngày tạo</p>
                <p className="text-sm text-gold">
                  {new Date(data.date).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1">Trạng thái</p>
                <p className={`text-sm font-medium ${isRevoked ? 'text-destructive' : isValid ? 'text-green-500' : 'text-gold'}`}>
                  {data.status}
                </p>
              </div>
            </div>

            {(data.hash || data.blockchain_tx) && (
              <>
                <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent my-8" />
                <div className="p-4 border border-gold/20 bg-black/40">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-4 w-4 text-gold" />
                    <p className="text-[10px] tracking-[0.2em] uppercase text-gold">
                      Blockchain Verification
                    </p>
                  </div>
                  {data.hash && (
                    <div className="mb-2">
                      <p className="text-[9px] text-gold uppercase tracking-wider mb-1">Hash</p>
                      <p className="text-[10px] text-muted-foreground font-mono break-all">{data.hash}</p>
                    </div>
                  )}
                  {data.blockchain_tx && (
                    <div>
                      <p className="text-[9px] text-gold uppercase tracking-wider mb-1">Transaction Hash</p>
                      <p className="text-[10px] text-muted-foreground font-mono break-all mb-1">{data.blockchain_tx}</p>
                      <a
                        href={`https://amoy.polygonscan.com/tx/${data.blockchain_tx}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] text-gold hover:text-foreground uppercase tracking-widest underline underline-offset-2 transition-colors"
                      >
                        Xem trên Polygon Blockchain ↗
                      </a>
                    </div>
                  )}
                  {isValid && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[9px] text-green-500 uppercase tracking-widest">Verified on Polygon Blockchain</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8">
          <Link
            href={`/certificate/${data.code}`}
            className="text-sm text-gold hover:text-foreground transition-colors tracking-wider uppercase"
          >
            Xem chứng thư đầy đủ
          </Link>
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
