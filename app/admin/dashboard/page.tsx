"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Edit2,
  CheckCircle,
  Package,
  ShoppingBag,
  Plus,
  X,
  Shield,
  Ban,
  CreditCard,
  Loader2,
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
} from "lucide-react";
import {
  isAdminLoggedIn,
  setAdminSession,
  getAdminToken,
} from "@/lib/admin-utils";

interface Order {
  id: string;
  sender_name: string;
  receiver_name: string;
  phone: string;
  receiver_phone: string | null;
  receiver_address: string | null;
  message: string;
  ritual_type: string | null;
  offering: string | null;
  permanence_type: string | null;
  product_id: string | null;
  certificate_id: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
  quantity: number | null;
  product?: {
    name: string;
    price: number;
    product_type: string;
  } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  is_permanent_available: boolean;
  product_type: "gift" | "ritual";
}

interface Stats {
  total: number;
  pending: number;
  paid: number;
  completed: number;
  minting: number;
  minted: number;
  revoked: number;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "Chờ xử lý",
  paid: "Đã thanh toán",
  minting: "Đang đúc",
  minted: "Đã đúc",
  revoked: "Đã thu hồi",
  completed: "Hoàn thành",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-900/30 text-yellow-400 border-yellow-400/30",
  paid: "bg-blue-900/30 text-blue-400 border-blue-400/30",
  minting: "bg-purple-900/30 text-purple-400 border-purple-400/30",
  minted: "bg-green-900/30 text-green-400 border-green-400/30",
  revoked: "bg-red-900/30 text-red-400 border-red-400/30",
  completed: "bg-emerald-900/30 text-emerald-400 border-emerald-400/30",
};

function canEditOrder(order: Order): boolean {
  return order.status === "pending" || order.status === "paid";
}

function canDeleteOrder(order: Order): boolean {
  return order.status === "pending" && !order.certificate_id;
}

function canMintOrder(order: Order): boolean {
  return order.status === "pending" || order.status === "paid";
}

function isFieldLocked(order: Order, field: string): boolean {
  if (order.status === "paid" && field !== "message") return true;
  if (
    order.permanence_type === "permanent" &&
    (field === "sender_name" || field === "receiver_name")
  )
    return true;
  return false;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateISO(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "products">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [editForm, setEditForm] = useState({
    sender_name: "",
    receiver_name: "",
    message: "",
    status: "",
  });
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
    category: "",
    is_permanent_available: true,
    product_type: "gift" as "gift" | "ritual",
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [searchPhone, setSearchPhone] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gift" | "ritual">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push("/admin/login");
      return;
    }
    fetchData();
  }, [router]);

  const headers = () => ({
    Authorization: `Bearer ${getAdminToken()}`,
    "Content-Type": "application/json",
  });

  async function fetchData() {
    try {
      const token = getAdminToken();
      const authHeaders = { Authorization: `Bearer ${token}` };

      const [ordersRes, statsRes, productsRes] = await Promise.all([
        fetch("/api/orders", { headers: authHeaders }),
        fetch("/api/orders/stats", { headers: authHeaders }),
        fetch("/api/products"),
      ]);

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      const productsData = await productsRes.json();

      const allProducts = productsData.products || [];
      const productMap = new Map<string, Product>();
      allProducts.forEach((p: Product) => productMap.set(p.id, p));

      const enrichedOrders = (ordersData.orders || []).map((o: Order) => ({
        ...o,
        product: o.product_id && productMap.has(o.product_id)
          ? {
              name: productMap.get(o.product_id)!.name,
              price: productMap.get(o.product_id)!.price,
              product_type: productMap.get(o.product_id)!.product_type,
            }
          : null,
      }));

      setOrders(enrichedOrders);
      setStats(statsData.stats || null);
      setProducts(allProducts);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function apiCall(url: string, method: string, body?: any) {
    const res = await fetch(url, {
      method,
      headers: headers(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  }

  async function markPaid(orderId: string) {
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}`, "PUT", { status: "paid" });
    await fetchData();
    setActionLoading(null);
  }

  async function mintOrder(orderId: string) {
    if (!confirm("Xác nhận đúc chứng thư blockchain cho đơn hàng này?")) return;
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}/mint`, "POST");
    await fetchData();
    setActionLoading(null);
  }

  async function revokeOrder(orderId: string) {
    if (!confirm("Thu hồi chứng thư? Hành động này không thể hoàn tác."))
      return;
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}/revoke`, "POST");
    await fetchData();
    setActionLoading(null);
  }

  async function deleteOrder(orderId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return;
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}`, "DELETE");
    await fetchData();
    setActionLoading(null);
  }

  function startEditOrder(order: Order) {
    if (!canEditOrder(order)) return;
    setEditingOrder(order);
    setEditForm({
      sender_name: order.sender_name || "",
      receiver_name: order.receiver_name || "",
      message: order.message || "",
      status: order.status || "pending",
    });
  }

  async function saveEditOrder() {
    if (!editingOrder) return;
    const updates: any = {};
    if (!isFieldLocked(editingOrder, "sender_name"))
      updates.sender_name = editForm.sender_name;
    if (!isFieldLocked(editingOrder, "receiver_name"))
      updates.receiver_name = editForm.receiver_name;
    updates.message = editForm.message;

    setActionLoading(editingOrder.id);
    await apiCall(`/api/orders/${editingOrder.id}`, "PUT", updates);
    setEditingOrder(null);
    await fetchData();
    setActionLoading(null);
  }

  async function handleSaveProduct() {
    const body = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image_url: productForm.image_url,
      category: productForm.category,
      is_permanent_available: productForm.is_permanent_available,
      product_type: productForm.product_type,
    };

    setActionLoading("product-save");
    try {
      let data;
      if (editingProduct) {
        data = await apiCall(`/api/products/${editingProduct.id}`, "PUT", body);
      } else {
        data = await apiCall("/api/products", "POST", body);
      }

      if (data.success || !data.error) {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          image_url: "",
          category: "",
          is_permanent_available: true,
          product_type: "gift",
        });
        await fetchData();
      } else {
        alert("Lỗi: " + data.error);
      }
    } catch (err) {
      console.error("Error saving product:", err);
    } finally {
      setActionLoading(null);
    }
  }

  function startEditProduct(product: Product) {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || "",
      price: product.price?.toString() || "",
      image_url: product.image_url || "",
      category: product.category || "",
      is_permanent_available: product.is_permanent_available !== false,
      product_type: product.product_type || "gift",
    });
    setShowProductForm(true);
  }

  async function deleteProduct(productId: string) {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return;
    await apiCall(`/api/products/${productId}`, "DELETE");
    await fetchData();
  }

  function handleLogout() {
    setAdminSession(false);
    router.push("/admin/login");
  }

  const filteredOrders = useMemo(() => {
    let result = orders;

    if (searchPhone.trim()) {
      const normalized = searchPhone.replace(/[^0-9]/g, "");
      result = result.filter(
        (o) =>
          o.phone?.includes(normalized) ||
          o.receiver_phone?.includes(normalized)
      );
    }

    if (filterType !== "all") {
      result = result.filter((o) => {
        if (o.product?.product_type) {
          return o.product.product_type === filterType;
        }
        if (filterType === "ritual") {
          return o.ritual_type && o.ritual_type !== "Gift";
        }
        return o.ritual_type === "Gift" || !o.ritual_type;
      });
    }

    if (filterStatus !== "all") {
      result = result.filter((o) => o.status === filterStatus);
    }

    if (filterDate) {
      result = result.filter((o) => formatDateISO(o.created_at) === filterDate);
    }

    return result;
  }, [orders, searchPhone, filterType, filterStatus, filterDate]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-light font-display text-[#F5E6C8]">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 md:px-6 py-2 border border-[#D4AF37]/40 text-[#D4AF37] text-sm uppercase hover:bg-[#D4AF37]/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm uppercase transition-all ${tab === "orders" ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40" : "text-[#8A7D65] border border-[#D4AF37]/10"}`}
          >
            <ShoppingBag className="h-4 w-4" /> Đơn hàng
          </button>
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm uppercase transition-all ${tab === "products" ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40" : "text-[#8A7D65] border border-[#D4AF37]/10"}`}
          >
            <Package className="h-4 w-4" /> Sản phẩm
          </button>
        </div>

        {tab === "products" && (
          <>
            <div className="mb-4">
              <button
                onClick={() => {
                  setShowProductForm(true);
                  setEditingProduct(null);
                  setProductForm({
                    name: "",
                    description: "",
                    price: "",
                    image_url: "",
                    category: "",
                    is_permanent_available: true,
                    product_type: "gift",
                  });
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-black text-sm uppercase font-medium"
              >
                <Plus className="h-4 w-4" /> Thêm sản phẩm
              </button>
            </div>

            {showProductForm && (
              <div className="mb-6 p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
                <div className="flex justify-between items-center mb-4 text-[#D4AF37]">
                  <h3 className="text-sm uppercase tracking-widest">
                    {editingProduct ? "Cập nhật sản phẩm" : "Sản phẩm mới"}
                  </h3>
                  <button
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8A7D65] uppercase">
                      Tên sản phẩm
                    </label>
                    <input
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm((p) => ({ ...p, name: e.target.value }))
                      }
                      className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] focus:border-[#D4AF37]/60 text-sm outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8A7D65] uppercase">
                      Loại bộ sưu tập
                    </label>
                    <select
                      value={productForm.product_type}
                      onChange={(e) =>
                        setProductForm((p) => ({
                          ...p,
                          product_type: e.target.value as "gift" | "ritual",
                        }))
                      }
                      className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] focus:border-[#D4AF37]/60 text-sm outline-none cursor-pointer"
                    >
                      <option value="gift">🎁 Gift Collection</option>
                      <option value="ritual">🕯️ Ritual Collection</option>
                    </select>
                  </div>
                  <input
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((p) => ({ ...p, price: e.target.value }))
                    }
                    placeholder="Giá (VND)"
                    type="number"
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                  <input
                    value={productForm.category}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        category: e.target.value,
                      }))
                    }
                    placeholder="Danh mục"
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                  <input
                    value={productForm.image_url}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        image_url: e.target.value,
                      }))
                    }
                    placeholder="URL hình ảnh"
                    className="md:col-span-2 border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm((p) => ({
                        ...p,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả"
                    rows={3}
                    className="md:col-span-2 border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none resize-none"
                  />
                </div>
                <button
                  disabled={actionLoading === "product-save"}
                  onClick={handleSaveProduct}
                  className="mt-4 px-8 py-2.5 bg-[#D4AF37] text-black text-sm uppercase font-bold flex items-center gap-2"
                >
                  {actionLoading === "product-save" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                </button>
              </div>
            )}

            <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-4 text-left">Sản phẩm</th>
                    <th className="px-4 py-4 text-left">Loại</th>
                    <th className="px-4 py-4 text-left">Giá</th>
                    <th className="px-4 py-4 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-[#D4AF37]/10 hover:bg-[#1a1712] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#F5E6C8] text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 py-3">
                        {product.product_type === "ritual" ? (
                          <span className="text-[9px] px-2 py-0.5 border border-[#D4AF37] text-[#D4AF37] uppercase">
                            Ritual
                          </span>
                        ) : (
                          <span className="text-[9px] px-2 py-0.5 border border-[#8A7D65] text-[#8A7D65] uppercase">
                            Gift
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[#D4AF37] text-sm">
                        {product.price?.toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditProduct(product)}
                            className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "orders" && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-4">
                  <div className="text-[10px] text-[#8A7D65] uppercase tracking-wider mb-1">Tổng đơn hàng</div>
                  <div className="text-2xl font-light text-[#F5E6C8]">{stats.total}</div>
                </div>
                <div className="border border-yellow-500/20 bg-yellow-900/5 p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="h-3 w-3 text-yellow-400" />
                    <span className="text-[10px] text-yellow-400 uppercase tracking-wider">Đang xử lý</span>
                  </div>
                  <div className="text-2xl font-light text-yellow-400">{stats.pending}</div>
                </div>
                <div className="border border-blue-500/20 bg-blue-900/5 p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CreditCard className="h-3 w-3 text-blue-400" />
                    <span className="text-[10px] text-blue-400 uppercase tracking-wider">Đã thanh toán</span>
                  </div>
                  <div className="text-2xl font-light text-blue-400">{stats.paid}</div>
                </div>
                <div className="border border-emerald-500/20 bg-emerald-900/5 p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle className="h-3 w-3 text-emerald-400" />
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider">Hoàn tất</span>
                  </div>
                  <div className="text-2xl font-light text-emerald-400">{stats.completed}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Tìm theo SĐT..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 placeholder-[#8A7D65]/60"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả loại</option>
                  <option value="gift">🎁 Gift</option>
                  <option value="ritual">🕯️ Ritual</option>
                </select>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 cursor-pointer"
                />
                {filterDate && (
                  <button
                    onClick={() => setFilterDate("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3.5 w-3.5 text-[#8A7D65] hover:text-[#D4AF37]" />
                  </button>
                )}
              </div>
            </div>

            {(searchPhone || filterType !== "all" || filterStatus !== "all" || filterDate) && (
              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="text-[#8A7D65]">
                  Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
                </span>
                <button
                  onClick={() => {
                    setSearchPhone("");
                    setFilterType("all");
                    setFilterStatus("all");
                    setFilterDate("");
                  }}
                  className="text-[#D4AF37] hover:underline text-xs uppercase"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}

            {editingOrder && (
              <div className="mb-6 p-6 border border-[#D4AF37]/20 bg-[#0d0b09]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm uppercase tracking-widest text-[#D4AF37]">
                    Sửa đơn hàng
                  </h3>
                  <button onClick={() => setEditingOrder(null)}>
                    <X className="h-5 w-5 text-[#D4AF37]" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8A7D65] uppercase">Người gửi</label>
                    <input
                      value={editForm.sender_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, sender_name: e.target.value }))}
                      disabled={isFieldLocked(editingOrder, "sender_name")}
                      className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none disabled:opacity-40"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-[#8A7D65] uppercase">Người nhận</label>
                    <input
                      value={editForm.receiver_name}
                      onChange={(e) => setEditForm((f) => ({ ...f, receiver_name: e.target.value }))}
                      disabled={isFieldLocked(editingOrder, "receiver_name")}
                      className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none disabled:opacity-40"
                    />
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <label className="text-[10px] text-[#8A7D65] uppercase">Lời nhắn</label>
                    <textarea
                      value={editForm.message}
                      onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                      rows={3}
                      className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={saveEditOrder}
                  disabled={actionLoading === editingOrder.id}
                  className="mt-4 px-8 py-2.5 bg-[#D4AF37] text-black text-sm uppercase font-bold flex items-center gap-2"
                >
                  {actionLoading === editingOrder.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Lưu thay đổi
                </button>
              </div>
            )}

            <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-4 text-left">Ngày</th>
                    <th className="px-4 py-4 text-left">Khách hàng</th>
                    <th className="px-4 py-4 text-left">Sản phẩm</th>
                    <th className="px-4 py-4 text-left">Giá trị</th>
                    <th className="px-4 py-4 text-left">Loại</th>
                    <th className="px-4 py-4 text-left">Trạng thái</th>
                    <th className="px-4 py-4 text-left">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-[#8A7D65]">
                        Không tìm thấy đơn hàng nào
                      </td>
                    </tr>
                  )}
                  {filteredOrders.map((order) => {
                    const qty = order.quantity || 1;
                    const unitPrice = order.product?.price || 0;
                    const totalValue = unitPrice * qty;
                    const isExpanded = expandedOrder === order.id;

                    return (
                      <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#1a1712]/50 transition-colors group">
                        <td className="px-4 py-3 text-[#8A7D65] whitespace-nowrap">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-[#C5A55A] font-medium">
                            {order.sender_name} → {order.receiver_name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-[#8A7D65] mt-0.5">
                            <Phone className="h-3 w-3" />
                            {order.phone}
                          </div>
                          {isExpanded && (
                            <div className="mt-2 space-y-1 text-[11px] text-[#8A7D65] border-t border-[#D4AF37]/10 pt-2">
                              {order.receiver_phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-blue-400/60" />
                                  <span className="text-blue-400/80">SĐT người nhận:</span> {order.receiver_phone}
                                </div>
                              )}
                              {order.receiver_address && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3 text-green-400/60" />
                                  <span className="text-green-400/80">Địa chỉ:</span> {order.receiver_address}
                                </div>
                              )}
                              {order.message && (
                                <div className="mt-1 text-[#C5A55A]/70 italic">
                                  &ldquo;{order.message}&rdquo;
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.product ? (
                            <div>
                              <div className="text-[#F5E6C8] text-xs">{order.product.name}</div>
                              <div className="text-[10px] text-[#8A7D65]">SL: {qty}</div>
                            </div>
                          ) : (
                            <span className="text-[#8A7D65]/50 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {totalValue > 0 ? (
                            <span className="text-[#D4AF37] text-xs font-medium">
                              {totalValue.toLocaleString("vi-VN")}đ
                            </span>
                          ) : (
                            <span className="text-[#8A7D65]/50 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {order.product?.product_type === "ritual" ? (
                            <span className="text-[9px] px-2 py-0.5 border border-[#D4AF37]/40 text-[#D4AF37] uppercase">
                              Ritual
                            </span>
                          ) : order.product?.product_type === "gift" || order.ritual_type === "Gift" ? (
                            <span className="text-[9px] px-2 py-0.5 border border-[#8A7D65]/40 text-[#8A7D65] uppercase">
                              Gift
                            </span>
                          ) : order.ritual_type ? (
                            <span className="text-[9px] px-2 py-0.5 border border-[#D4AF37]/40 text-[#D4AF37] uppercase">
                              Ritual
                            </span>
                          ) : (
                            <span className="text-[#8A7D65]/50 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] uppercase border ${STATUS_COLORS[order.status] || "text-[#8A7D65]"}`}
                          >
                            {STATUS_LABELS[order.status] || order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 items-center">
                            <button
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              title="Xem chi tiết"
                              className="p-1.5 text-[#8A7D65] hover:text-[#F5E6C8] hover:bg-[#D4AF37]/10 transition-colors"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>
                            {order.status === "pending" && (
                              <button
                                onClick={() => markPaid(order.id)}
                                title="Đã thanh toán"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-blue-400 hover:bg-blue-400/10 transition-colors disabled:opacity-40"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                            {canMintOrder(order) && (
                              <button
                                onClick={() => mintOrder(order.id)}
                                title="Đúc Blockchain"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-40"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                            {canEditOrder(order) && (
                              <button
                                onClick={() => startEditOrder(order)}
                                title="Sửa"
                                className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                            )}
                            {canDeleteOrder(order) && (
                              <button
                                onClick={() => deleteOrder(order.id)}
                                title="Xóa"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-red-700 hover:bg-red-500/10 transition-colors disabled:opacity-40"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
