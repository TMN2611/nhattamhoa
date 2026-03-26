'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Phone, FileText, ExternalLink, Shield, Clock, Package } from 'lucide-react'
import Link from 'next/link'

interface Order {
  id: string
  sender_name: string
  receiver_name: string
  message?: string
  status: string
  created_at: string
  certificate_code?: string
  blockchain_tx?: string
  product_name?: string
}

export default function LookupPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'code' | 'phone'>('code')
  const [code, setCode] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [searched, setSearched] = useState(false)

  async function handleCodeLookup(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch(`/api/certificate/${code.trim()}`)
      const data = await res.json()

      if (data.success) {
        router.push(`/certificate/${code.trim()}`)
      } else {
        setError('Không tìm thấy chứng thư với mã này. Vui lòng kiểm tra lại.')
      }
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePhoneLookup(e: React.FormEvent) {
    e.preventDefault()
    const cleaned = phone.replace(/\s/g, '')
    if (!cleaned || cleaned.length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ')
      return
    }

    setError('')
    setLoading(true)
    setSearched(false)

    try {
      const res = await fetch(`/api/orders/lookup-by-phone?phone=${encodeURIComponent(cleaned)}`)
      const data = await res.json()

      if (data.success && data.orders?.length > 0) {
        setOrders(data.orders)
      } else {
        setOrders([])
      }
      setSearched(true)
    } catch {
      setError('Có lỗi xảy ra. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  function getStatusLabel(status: string) {
    const map: Record<string, { label: string; color: string }> = {
      pending: { label: 'Chờ xử lý', color: 'text-yellow-500' },
      paid: { label: 'Đã thanh toán', color: 'text-blue-500' },
      minting: { label: 'Đang phát hành', color: 'text-orange-500' },
      minted: { label: 'Đã chứng nhận', color: 'text-green-500' },
      revoked: { label: 'Đã thu hồi', color: 'text-red-500' },
    }
    return map[status] || { label: status, color: 'text-muted-foreground' }
  }

  return (
    <main className="min-h-screen bg-background flex items-start justify-center px-6 pt-28 pb-20">
      <div className="max-w-lg w-full">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-6">
            Tra cứu
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-foreground font-display leading-tight mb-4">
            Tìm chứng thư & đơn hàng
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Tra cứu bằng mã chứng thư hoặc số điện thoại người đặt.
          </p>
        </div>

        <div className="flex border border-border mb-8">
          <button
            onClick={() => { setTab('code'); setError(''); setOrders([]); setSearched(false) }}
            className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase font-medium transition-all ${
              tab === 'code'
                ? 'bg-gold text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-3.5 w-3.5 inline mr-2" />
            Mã chứng thư
          </button>
          <button
            onClick={() => { setTab('phone'); setError(''); setOrders([]); setSearched(false) }}
            className={`flex-1 py-3 text-xs tracking-[0.2em] uppercase font-medium transition-all ${
              tab === 'phone'
                ? 'bg-gold text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Phone className="h-3.5 w-3.5 inline mr-2" />
            Số điện thoại
          </button>
        </div>

        {tab === 'code' ? (
          <form onSubmit={handleCodeLookup} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NTH-XXXXXXXX"
                className="w-full border border-border bg-card pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors font-mono text-lg tracking-wider text-center"
              />
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <button
              type="submit"
              disabled={!code.trim() || loading}
              className={`w-full py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
                code.trim() && !loading
                  ? 'bg-gold text-primary-foreground hover:opacity-90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
              }`}
            >
              {loading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </form>
        ) : (
          <>
            <form onSubmit={handlePhoneLookup} className="space-y-4">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0xxx xxx xxx"
                  className="w-full border border-border bg-card pl-12 pr-4 py-4 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-gold/60 transition-colors text-lg tracking-wider text-center"
                />
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Nhập số điện thoại người đặt hàng để xem lịch sử đơn hàng và xác minh trên blockchain.
              </p>

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <button
                type="submit"
                disabled={!phone.trim() || loading}
                className={`w-full py-4 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-500 ${
                  phone.trim() && !loading
                    ? 'bg-gold text-primary-foreground hover:opacity-90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                }`}
              >
                {loading ? 'Đang tìm...' : 'Tra cứu đơn hàng'}
              </button>
            </form>

            {searched && orders.length === 0 && (
              <div className="mt-8 text-center py-10 border border-border bg-card">
                <p className="text-muted-foreground text-sm">
                  Không tìm thấy đơn hàng nào với số điện thoại này.
                </p>
              </div>
            )}

            {orders.length > 0 && (
              <div className="mt-8 space-y-4">
                <p className="text-xs tracking-[0.3em] uppercase text-gold mb-4">
                  Tìm thấy {orders.length} đơn hàng
                </p>

                {orders.map((order) => {
                  const status = getStatusLabel(order.status)
                  return (
                    <div key={order.id} className="border border-border bg-card p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {order.sender_name} → {order.receiver_name}
                          </p>
                          {order.product_name && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{order.product_name}</p>
                          )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-wider font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>

                      {order.message && (
                        <p className="text-sm text-muted-foreground italic font-display leading-relaxed border-l-2 border-gold/20 pl-3">
                          &ldquo;{order.message}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(order.created_at).toLocaleDateString('vi-VN', {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.certificate_code && (
                          <Link
                            href={`/certificate/${order.certificate_code}`}
                            className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase px-3 py-1.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
                          >
                            <Shield className="h-3 w-3" />
                            Xem chứng thư
                          </Link>
                        )}
                        {order.blockchain_tx && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${order.blockchain_tx}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-[10px] tracking-wider uppercase px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Xem trên Polygon
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}

                <div className="border border-border bg-card p-4 mt-6">
                  <div className="flex gap-3 items-start">
                    <Shield className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gold text-[11px] font-bold uppercase tracking-wider mb-1">
                        Xác minh trên Blockchain
                      </p>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        Mỗi chứng thư được ghi nhận vĩnh viễn trên mạng Polygon. 
                        Bấm &quot;Xem trên Polygon&quot; để tự kiểm tra giao dịch trên blockchain — 
                        dữ liệu minh bạch, không thể chỉnh sửa hay xóa bỏ.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
