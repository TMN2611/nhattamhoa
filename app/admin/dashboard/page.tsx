'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAdminLoggedIn, setAdminSession, getAdminToken } from '@/lib/admin-utils'
import { Trash2, Edit2, CheckCircle, Package, ShoppingBag, Plus, X } from 'lucide-react'

interface Order {
  id: string
  sender_name: string
  receiver_name: string
  phone: string
  message: string
  ritual_type: string | null
  offering: string | null
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
}

interface Stats {
  total: number
  pending: number
  completed: number
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'orders' | 'products'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({ name: '', description: '', price: '', image_url: '', category: '' })

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

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      await fetch('/api/orders/record', {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ orderId, status }),
      })
      await fetchData()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return
    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: headers(),
      })
      await fetchData()
    } catch (err) {
      console.error('Error deleting order:', err)
    }
  }

  async function handleSaveProduct() {
    const body = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image_url: productForm.image_url,
      category: productForm.category,
    }

    try {
      if (editingProduct) {
        await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: headers(),
          body: JSON.stringify(body),
        })
      } else {
        await fetch('/api/products', {
          method: 'POST',
          headers: headers(),
          body: JSON.stringify(body),
        })
      }
      setShowProductForm(false)
      setEditingProduct(null)
      setProductForm({ name: '', description: '', price: '', image_url: '', category: '' })
      await fetchData()
    } catch (err) {
      console.error('Error saving product:', err)
    }
  }

  async function deleteProduct(productId: string) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: headers(),
      })
      await fetchData()
    } catch (err) {
      console.error('Error deleting product:', err)
    }
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product)
    setProductForm({
      name: product.name,
      description: product.description || '',
      price: product.price?.toString() || '',
      image_url: product.image_url || '',
      category: product.category || '',
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
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Nghi thức</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Ngày</th>
                  <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#0d0b09]/80">
                    <td className="px-4 py-3 text-[#C5A55A] text-sm">{order.sender_name}</td>
                    <td className="px-4 py-3 text-[#C5A55A] text-sm">{order.receiver_name}</td>
                    <td className="px-4 py-3 text-[#8A7D65] text-sm">{order.ritual_type || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 text-xs tracking-wide uppercase ${
                        order.status === 'pending' ? 'bg-[#C5A55A]/20 text-[#C5A55A]' : 'bg-green-900/30 text-green-500'
                      }`}>
                        {order.status === 'pending' ? 'Chờ' : 'Hoàn thành'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#8A7D65] text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.status === 'pending' && (
                          <button onClick={() => updateOrderStatus(order.id, 'completed')} className="p-1.5 text-green-500 hover:bg-green-900/20 transition-colors" title="Hoàn thành">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <button onClick={() => setEditingOrder(editingOrder?.id === order.id ? null : order)} className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors" title="Xem chi tiết">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => deleteOrder(order.id)} className="p-1.5 text-[#A52525] hover:bg-[#A52525]/10 transition-colors" title="Xóa">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
              <h3 className="text-[#D4AF37] text-sm tracking-wider uppercase">Chi tiết đơn hàng</h3>
              <button onClick={() => setEditingOrder(null)} className="text-[#8A7D65] hover:text-[#F5E6C8]">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div><span className="text-[#8A7D65]">SĐT:</span> <span className="text-[#C5A55A] ml-2">{editingOrder.phone}</span></div>
              <div><span className="text-[#8A7D65]">Cert ID:</span> <span className="text-[#C5A55A] ml-2 font-mono">{editingOrder.certificate_id}</span></div>
              <div><span className="text-[#8A7D65]">Vật chứng:</span> <span className="text-[#C5A55A] ml-2">{editingOrder.offering || '-'}</span></div>
              <div className="md:col-span-2"><span className="text-[#8A7D65]">Lời nhắn:</span> <span className="text-[#C5A55A] ml-2 italic">{editingOrder.message}</span></div>
              <div className="md:col-span-2"><span className="text-[#8A7D65]">Hash:</span> <span className="text-[#D4AF37] ml-2 font-mono text-xs break-all">{editingOrder.blockchain_hash}</span></div>
            </div>
          </div>
        )}

        {tab === 'products' && (
          <>
            <div className="mb-4">
              <button
                onClick={() => { setShowProductForm(true); setEditingProduct(null); setProductForm({ name: '', description: '', price: '', image_url: '', category: '' }) }}
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
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Danh mục</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Mô tả</th>
                    <th className="px-4 py-3 text-left text-[#D4AF37] text-xs font-medium tracking-wide">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b border-[#D4AF37]/10 hover:bg-[#0d0b09]/80">
                      <td className="px-4 py-3 text-[#F5E6C8] text-sm">{product.name}</td>
                      <td className="px-4 py-3 text-[#D4AF37] text-sm">{product.price?.toLocaleString('vi-VN')} VND</td>
                      <td className="px-4 py-3 text-[#8A7D65] text-sm">{product.category || '-'}</td>
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
