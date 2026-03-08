'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAdminLoggedIn, setAdminSession, getAdminToken } from '@/lib/admin-utils'

interface Order {
  id: string
  buyerName: string
  recipientName: string
  phoneNumber: string
  loveLetter: string
  status: string
  txHash: string | null
  createdAt: string
}

interface Stats {
  total: number
  pending: number
  recorded: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [recordingId, setRecordingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [router])

  async function fetchData() {
    const token = getAdminToken()
    const headers = { 'Authorization': `Bearer ${token}` }
    try {
      const [ordersRes, statsRes] = await Promise.all([
        fetch('/api/orders', { headers }),
        fetch('/api/orders/stats', { headers }),
      ])

      const ordersData = await ordersRes.json()
      const statsData = await statsRes.json()

      setOrders(ordersData.orders || [])
      setStats(statsData.stats || null)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function recordOnBlockchain(orderId: string) {
    setRecordingId(orderId)
    const token = getAdminToken()
    try {
      const res = await fetch('/api/orders/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ orderId }),
      })

      if (res.ok) {
        await fetchData()
      }
    } catch (err) {
      console.error('Error recording order:', err)
    } finally {
      setRecordingId(null)
    }
  }

  function handleLogout() {
    setAdminSession(false)
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black p-6">
        <div className="text-center text-[#C5A55A]">Đang tải...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-light font-display text-[#F5E6C8] mb-1">
              Admin Dashboard
            </h1>
            <p className="text-[#8A7D65] text-sm">Quản lý đơn hàng và chứng thư</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-[#D4AF37]/40 text-[#D4AF37] text-sm tracking-wider uppercase hover:bg-[#D4AF37]/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-2">Tổng đơn hàng</p>
              <p className="text-4xl font-light text-[#D4AF37]">{stats.total}</p>
            </div>
            <div className="p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-2">Đang chờ</p>
              <p className="text-4xl font-light text-[#C5A55A]">{stats.pending}</p>
            </div>
            <div className="p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-2">Đã ghi lên Blockchain</p>
              <p className="text-4xl font-light text-[#D4AF37]">{stats.recorded}</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#D4AF37]/10">
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Mã đơn
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Người tặng
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Người nhận
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  SĐT
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Lời nhắn
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  TX Hash
                </th>
                <th className="px-6 py-4 text-left text-[#D4AF37] text-sm font-medium tracking-wide">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#0d0b09]/80 transition-colors">
                  <td className="px-6 py-4 text-[#F5E6C8] text-sm font-mono">
                    {order.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-[#C5A55A] text-sm">
                    {order.buyerName}
                  </td>
                  <td className="px-6 py-4 text-[#C5A55A] text-sm">
                    {order.recipientName}
                  </td>
                  <td className="px-6 py-4 text-[#8A7D65] text-sm">
                    {order.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-[#8A7D65] text-sm max-w-xs truncate">
                    {order.loveLetter}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 text-xs tracking-wide uppercase font-medium ${
                        order.status === 'pending'
                          ? 'bg-[#C5A55A]/20 text-[#C5A55A]'
                          : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                      }`}
                    >
                      {order.status === 'pending' ? 'Chờ' : 'Ghi'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#8A7D65] text-xs font-mono">
                    {order.txHash ? `${order.txHash.substring(0, 8)}...` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {order.status === 'pending' ? (
                      <button
                        onClick={() => recordOnBlockchain(order.id)}
                        disabled={recordingId === order.id}
                        className="px-4 py-2 text-xs tracking-wider uppercase font-medium bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] disabled:opacity-50 transition-all"
                      >
                        {recordingId === order.id ? 'Ghi...' : 'Ghi'}
                      </button>
                    ) : (
                      <span className="text-[#8A7D65] text-xs">✓ Đã ghi</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="p-8 text-center text-[#8A7D65]">
              Không có đơn hàng nào
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-[#D4AF37] hover:text-[#F5E6C8] transition-colors text-sm tracking-wider uppercase">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
