'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAdminLoggedIn, setAdminSession, getAdminToken } from '@/lib/admin-utils'
import { Trash2, Edit2, CheckCircle, Package, ShoppingBag, Plus, X, Shield, Ban, CreditCard, Loader2 } from 'lucide-react'

interface Order {
  id: string
  sender_name: string
  receiver_name: string
  phone: string
  message: string
  ritual_type: string | null
  offering: string | null
  permanence_type: string | null
  product_id: string | null
  certificate_id: string
  blockchain_hash: string
  status: string
  created_at: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_permanent_available: boolean
}

interface Stats {
  total: number
  pending: number
  completed: number
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lý',
  paid: 'Đã thanh toán',
  minting: 'Đang đúc',
  minted: 'Đã đúc',
  revoked: 'Đã thu hồi',
  completed: 'Hoàn thành',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-900/30 text-yellow-400',
  paid: 'bg-blue-900/30 text-blue-400',
  minting: 'bg-purple-900/30 text-purple-400',
  minted: 'bg-green-900/30 text-green-400',
  revoked: 'bg-red-900/30 text-red-400',
  completed: 'bg-green-900/30 text-green-500',
}

function canEditOrder(order: Order): boolean {
  return order.status === 'pending' || order.status === 'paid'
}

function canDeleteOrder(order: Order): boolean {
  return order.status === 'pending' && !order.certificate_id
}

function canMintOrder(order: Order): boolean {
  return order.status === 'pending' || order.status === 'paid'
}

function canRevokeOrder(order: Order): boolean {
  return order.status === 'minted'
}

function isFieldLocked(order: Order, field: string): boolean {
  if (order.status === 'paid' && field !== 'message') return true
  if (order.permanence_type === 'permanent' && (field === 'sender_name' || field === 'receiver_name')) return true
  return false
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'orders' | 'products'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editForm, setEditForm] = useState({ sender_name: '', receiver_name: '', message: '', status: '' })
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image_url: '', category: '', is_permanent_available: true })
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login')
      return
    }
    fetchData()
  }, [router])

  const headers = () => ({ 'Authorization': `Bearer ${getAdminToken()}`, 'Content-Type': 'application/json' })

  async function fetchData() {
    try {
      const token = getAdminToken()
      const authHeaders = { 'Authorization': `Bearer ${token}` }

      const [ordersRes, statsRes, productsRes] = await Promise.all([
        fetch('/api/orders', { headers: authHeaders }),
        fetch('/api/orders/stats', { headers: authHeaders }),
        fetch('/api/products'),
      ])

      const ordersData = await ordersRes.json()
      const statsData = await statsRes.json()
      const productsData = await productsRes.json()

      setOrders(ordersData.orders || [])
      setStats(statsData.stats || null)
      setProducts(productsData.products || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  async function apiCall(url: string, method: string, body?: any) {
    const res = await fetch(url, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    return res.json()
  }

  async function markPaid(orderId: string) {
    setActionLoading(orderId)
    const data = await apiCall(`/api/orders/${orderId}`, 'PUT', { status: 'paid' })
    if (!data.success) alert('Lỗi: ' + (data.error || 'Unknown'))
    await fetchData()
    setActionLoading(null)
  }

  async function mintOrder(orderId: string) {
    if (!confirm('Xác nhận đúc chứng thư blockchain cho đơn hàng này?')) return
    setActionLoading(orderId)
    const data = await apiCall(`/api/orders/${orderId}/mint`, 'POST')
    if (!data.success) alert('Lỗi đúc: ' + (data.error || 'Unknown'))
    await fetchData()
    setActionLoading(null)
  }

  async function revokeOrder(orderId: string) {
    if (!confirm('Thu hồi chứng thư? Hành động này không thể hoàn tác.')) return
    setActionLoading(orderId)
    const data = await apiCall(`/api/orders/${orderId}/revoke`, 'POST')
    if (!data.success) alert('Lỗi thu hồi: ' + (data.error || 'Unknown'))
    await fetchData()
    setActionLoading(null)
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return
    setActionLoading(orderId)
    const data = await apiCall(`/api/orders/${orderId}`, 'DELETE')
    if (!data.success) alert('Lỗi xóa: ' + (data.error || 'Unknown'))
    await fetchData()
    setActionLoading(null)
  }

  function startEditOrder(order: Order) {
    if (!canEditOrder(order)) {
      alert('Đơn hàng ở trạng thái ' + (STATUS_LABELS[order.status] || order.status) + ' không thể chỉnh sửa.')
      return
    }
    setEditingOrder(order)
    setEditForm({
      sender_name: order.sender_name || '',
      receiver_name: order.receiver_name || '',
      message: order.message || '',
      status: order.status || 'pending',
    })
  }

  async function saveEditOrder() {
    if (!editingOrder) return
    const updates: Record<string, string> = {}

    if (!isFieldLocked(editingOrder, 'sender_name') && editForm.sender_name !== editingOrder.sender_name) {
      updates.sender_name = editForm.sender_name
    }
    if (!isFieldLocked(editingOrder, 'receiver_name') && editForm.receiver_name !== editingOrder.receiver_name) {
      updates.receiver_name = editForm.receiver_name
    }
    if (editForm.message !== editingOrder.message) {
      updates.message = editForm.message
    }

    if (Object.keys(updates).length === 0) {
      setEditingOrder(null)
      return
    }

    setActionLoading(editingOrder.id)
    const data = await apiCall(`/api/orders/${editingOrder.id}`, 'PUT', updates)
    if (data.success) {
      setEditingOrder(null)
      await fetchData()
    } else {
      alert('Lỗi: ' + (data.error || 'Unknown'))
    }
    setActionLoading(null)
  }

  async function handleSaveProduct() {
    const body: any = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image_url: productForm.image_url,
      category: productForm.category,
      is_permanent_available: productForm.is_permanent_available,
    }

    try {
      if (editingProduct) {
        await apiCall(`/api/products/${editingProduct.id}`, 'PUT', body)
      } else {
        await apiCall('/api/products', 'POST', body)
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', image_url: '', category: '', is_permanent_available: true })
      await fetchData()
    } catch (err) {
      console.error('Error saving product:', err)
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    await apiCall(`/api/products/${productId}`, 'DELETE')
    await fetchData()
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || '',
      is_permanent_available: product.is_permanent_available !== false,
    })
    setShowProductForm(true)
  }

  function handleLogout() {
    setAdminSession(false)
    router.push('/admin/login')
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black p-6">
        <div className="text-center text-[#C5A55A] pt-20">Đang tải...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light font-display text-[#F5E6C8] mb-1">Admin Dashboard</h1>
            <p className="text-[#8A7D65] text-sm">Quản lý đơn hàng và sản phẩm</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-2 border border-[#D4AF37]/40 text-[#D4AF37] text-sm tracking-wider uppercase hover:bg-[#D4AF37]/10 transition-colors">
            Đăng xuất
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-5 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-1">Tổng đơn hàng</p>
              <p className="text-3xl font-light text-[#D4AF37]">{stats.total}</p>
            </div>
            <div className="p-5 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-1">Đang chờ</p>
              <p className="text-3xl font-light text-[#C5A55A]">{stats.pending}</p>
            </div>
            <div className="p-5 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <p className="text-[#8A7D65] text-sm mb-1">Hoàn thành</p>
              <p className="text-3xl font-light text-[#D4AF37]">{stats.completed}</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab('orders')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm tracking-wider uppercase transition-colors ${
              tab === 'orders' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-[#8A7D65] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Đơn hàng
          </button>
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm tracking-wider uppercase transition-colors ${
              tab === 'products' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-[#8A7D65] border border-[#D4AF37]/10 hover:border-[#D4AF37]/30'
            }`}
          >
            <Package className="h-4 w-4" />
            Sản phẩm
          </button>
        </div>

        {tab === 'orders' && (
          <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#D4AF37]/10">
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Người gửi</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Người nhận</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Loại</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Ngày</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const loading = actionLoading === order.id
                  return (
                    <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#0d0b09]/80">
                      <td className="px-4 py-3 text-[#C5A55A] text-sm">{order.sender_name}</td>
                      <td className="px-4 py-3 text-[#C5A55A] text-sm">{order.receiver_name}</td>
                      <td className="px-4 py-3 text-[#8A7D65] text-xs">
                        {order.permanence_type === 'permanent' ? (
                          <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37]">Thiên Niên</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-[#555040]/30 text-[#8A7D65]">Duyên Khởi</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-0.5 text-xs tracking-wide uppercase ${STATUS_COLORS[order.status] || 'bg-gray-800 text-gray-400'}`}>
                          {STATUS_LABELS[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8A7D65] text-xs">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {loading ? (
                          <Loader2 className="h-4 w-4 text-[#D4AF37] animate-spin" />
                        ) : (
                          <div className="flex items-center gap-1">
                            {order.status === 'pending' && (
                              <button onClick={() => markPaid(order.id)} className="p-1.5 text-blue-400 hover:bg-blue-900/20 transition-colors" title="Đánh dấu đã thanh toán">
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                            {canMintOrder(order) && (
                              <button onClick={() => mintOrder(order.id)} className="p-1.5 text-green-400 hover:bg-green-900/20 transition-colors" title="Đúc chứng thư">
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                            {canRevokeOrder(order) && (
                              <button onClick={() => revokeOrder(order.id)} className="p-1.5 text-orange-400 hover:bg-orange-900/20 transition-colors" title="Thu hồi">
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                            {canEditOrder(order) && (
                              <button onClick={() => startEditOrder(order)} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors" title="Sửa">
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteOrder(order) && (
                              <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-[#A52525] hover:bg-[#A52525]/10 transition-colors" title="Xóa">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {orders.length === 0 && (
              <div className="p-8 text-center text-[#8A7D65]">Không có đơn hàng nào</div>
            )}
          </div>
        )}

        {editingOrder && tab === 'orders' && (
          <div className="mt-4 p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#D4AF37] text-sm tracking-wider uppercase">Sửa đơn hàng</h3>
                {editingOrder.status === 'paid' && (
                  <p className="text-xs text-yellow-500 mt-1">Đơn đã thanh toán — chỉ sửa được lời nhắn</p>
                )}
                {editingOrder.permanence_type === 'permanent' && (
                  <p className="text-xs text-[#D4AF37] mt-1">Chứng thư vĩnh viễn — không sửa được tên người gửi/nhận</p>
                )}
              </div>
              <button onClick={() => setEditingOrder(null)} className="text-[#8A7D65] hover:text-[#F5E6C8]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[#8A7D65] text-xs mb-1 block">Người gửi</label>
                <input
                  value={editForm.sender_name}
                  onChange={e => setEditForm(f => ({ ...f, sender_name: e.target.value }))}
                  disabled={isFieldLocked(editingOrder, 'sender_name')}
                  className={`w-full border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]/60 ${isFieldLocked(editingOrder, 'sender_name') ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="text-[#8A7D65] text-xs mb-1 block">Người nhận</label>
                <input
                  value={editForm.receiver_name}
                  onChange={e => setEditForm(f => ({ ...f, receiver_name: e.target.value }))}
                  disabled={isFieldLocked(editingOrder, 'receiver_name')}
                  className={`w-full border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]/60 ${isFieldLocked(editingOrder, 'receiver_name') ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-[#8A7D65] text-xs mb-1 block">Lời nhắn</label>
                <textarea value={editForm.message} onChange={e => setEditForm(f => ({ ...f, message: e.target.value }))} rows={3} className="w-full border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm focus:outline-none focus:border-[#D4AF37]/60 resize-none" />
              </div>
              {editingOrder.certificate_id && (
                <div className="md:col-span-2 flex gap-2 text-sm">
                  <span className="text-[#8A7D65]">Cert:</span>
                  <span className="text-[#C5A55A] font-mono">{editingOrder.certificate_id}</span>
                </div>
              )}
              {editingOrder.blockchain_hash && (
                <div className="md:col-span-2 text-xs">
                  <span className="text-[#8A7D65]">Hash:</span>
                  <span className="text-[#D4AF37] ml-1 font-mono break-all">{editingOrder.blockchain_hash}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={saveEditOrder} className="px-6 py-2 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] text-sm tracking-wider uppercase font-medium">
                Lưu thay đổi
              </button>
              <button onClick={() => setEditingOrder(null)} className="px-6 py-2 border border-[#D4AF37]/30 text-[#8A7D65] text-sm tracking-wider uppercase hover:text-[#F5E6C8] transition-colors">
                Hủy
              </button>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <>
            <div className="mb-4">
              <button
                onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', image_url: '', category: '', is_permanent_available: true }) }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] text-sm tracking-wider uppercase font-medium hover:shadow-[0_0_20px_rgba(212,175,55,0.2)]"
              >
                <Plus className="h-4 w-4" />
                Thêm sản phẩm
              </button>
            </div>

            {showProductForm && (
              <div className="mb-6 p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[#D4AF37] text-sm tracking-wider uppercase">
                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
                  </h3>
                  <button onClick={() => { setShowProductForm(false); setEditingProduct(null) }} className="text-[#8A7D65] hover:text-[#F5E6C8]">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input value={productForm.name} onChange={e => setProductForm(p => ({ ...p, name: e.target.value }))} placeholder="Tên sản phẩm" className="border border-[#D4AF37]/20 bg-black px-4 py-2.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 text-sm" />
                  <input value={productForm.price} onChange={e => setProductForm(p => ({ ...p, price: e.target.value }))} placeholder="Giá (VND)" type="number" className="border border-[#D4AF37]/20 bg-black px-4 py-2.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 text-sm" />
                  <input value={productForm.image_url} onChange={e => setProductForm(p => ({ ...p, image_url: e.target.value }))} placeholder="URL hình ảnh" className="border border-[#D4AF37]/20 bg-black px-4 py-2.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 text-sm" />
                  <input value={productForm.category} onChange={e => setProductForm(p => ({ ...p, category: e.target.value }))} placeholder="Danh mục" className="border border-[#D4AF37]/20 bg-black px-4 py-2.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 text-sm" />
                  <textarea value={productForm.description} onChange={e => setProductForm(p => ({ ...p, description: e.target.value }))} placeholder="Mô tả" rows={3} className="md:col-span-2 border border-[#D4AF37]/20 bg-black px-4 py-2.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 text-sm resize-none" />
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.is_permanent_available}
                      onChange={e => setProductForm(p => ({ ...p, is_permanent_available: e.target.checked }))}
                      className="h-4 w-4 accent-[#D4AF37]"
                    />
                    <span className="text-sm text-[#C5A55A]">Hỗ trợ chứng thư vĩnh viễn (blockchain)</span>
                  </label>
                </div>
                <button onClick={handleSaveProduct} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] text-sm tracking-wider uppercase font-medium">
                  {editingProduct ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            )}

            <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/10">
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Tên</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Giá</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Blockchain</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Mô tả</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#D4AF37]/10 hover:bg-[#0d0b09]/80">
                      <td className="px-4 py-3 text-[#F5E6C8] text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-[#D4AF37] text-sm">{product.price?.toLocaleString('vi-VN')} VND</td>
                      <td className="px-4 py-3 text-sm">
                        {product.is_permanent_available !== false ? (
                          <span className="text-green-400 text-xs">Có</span>
                        ) : (
                          <span className="text-[#8A7D65] text-xs">Không</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#8A7D65] text-sm max-w-xs truncate">{product.description || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => startEditProduct(product)} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => deleteProduct(product.id)} className="p-1.5 text-[#A52525] hover:bg-[#A52525]/10 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="p-8 text-center text-[#8A7D65]">Chưa có sản phẩm nào</div>
              )}
            </div>
          </>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-[#D4AF37] hover:text-[#F5E6C8] transition-colors text-sm tracking-wider uppercase">
            ← Quay lại trang chủ
          </Link>
        </div>
      </div>
    </main>
  )
}
