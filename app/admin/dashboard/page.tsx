"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isAdminLoggedIn,
  setAdminSession,
  getAdminToken,
} from "@/lib/admin-utils";
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
} from "lucide-react";

interface Order {
  id: string;
  sender_name: string;
  receiver_name: string;
  phone: string;
  message: string;
  ritual_type: string | null;
  offering: string | null;
  permanence_type: string | null;
  product_id: string | null;
  certificate_id: string;
  blockchain_hash: string;
  status: string;
  created_at: string;
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
  completed: number;
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
  pending: "bg-yellow-900/30 text-yellow-400",
  paid: "bg-blue-900/30 text-blue-400",
  minting: "bg-purple-900/30 text-purple-400",
  minted: "bg-green-900/30 text-green-400",
  revoked: "bg-red-900/30 text-red-400",
  completed: "bg-green-900/30 text-green-500",
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

function canRevokeOrder(order: Order): boolean {
  return order.status === "minted";
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

      setOrders(ordersData.orders || []);
      setStats(statsData.stats || null);
      setProducts(productsData.products || []);
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

  // Quản lý Đơn hàng
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

  // Quản lý Sản phẩm
  async function handleSaveProduct() {
    const body = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      image_url: productForm.image_url,
      category: productForm.category,
      is_permanent_available: productForm.is_permanent_available,
      product_type: productForm.product_type, // Đã kiểm tra: Trường này sẽ được gửi đi
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
      product_type: product.product_type || "gift", // Quan trọng: Gán giá trị cũ vào form để sửa
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#D4AF37] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-light font-display text-[#F5E6C8]">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-[#D4AF37]/40 text-[#D4AF37] text-sm uppercase hover:bg-[#D4AF37]/10 transition-colors"
          >
            Đăng xuất
          </button>
        </div>

        {/* Tab Switcher */}
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

        {/* --- PHẦN QUẢN LÝ SẢN PHẨM --- */}
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

                  {/* TRƯỜNG LOẠI SẢN PHẨM (ĐÃ FIX LỖI SỬA) */}
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
                      <option value="gift">
                        🎁 Gift Collection (Phổ thông)
                      </option>
                      <option value="ritual">
                        🕯️ Ritual Collection (Cam kết)
                      </option>
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

        {/* --- PHẦN QUẢN LÝ ĐƠN HÀNG --- */}
        {tab === "orders" && (
          <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase">
                  <th className="px-4 py-4 text-left">Khách hàng</th>
                  <th className="px-4 py-4 text-left">Trạng thái</th>
                  <th className="px-4 py-4 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#D4AF37]/10">
                    <td className="px-4 py-3">
                      <div className="text-[#C5A55A]">
                        {order.sender_name} → {order.receiver_name}
                      </div>
                      <div className="text-[10px] text-[#8A7D65]">
                        {new Date(order.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase ${STATUS_COLORS[order.status]}`}
                      >
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.status === "pending" && (
                          <button
                            onClick={() => markPaid(order.id)}
                            title="Đã thanh toán"
                          >
                            <CreditCard className="h-4 w-4 text-blue-400" />
                          </button>
                        )}
                        {canMintOrder(order) && (
                          <button
                            onClick={() => mintOrder(order.id)}
                            title="Đúc Blockchain"
                          >
                            <Shield className="h-4 w-4 text-green-400" />
                          </button>
                        )}
                        {canEditOrder(order) && (
                          <button
                            onClick={() => startEditOrder(order)}
                            title="Sửa"
                          >
                            <Edit2 className="h-4 w-4 text-[#D4AF37]" />
                          </button>
                        )}
                        {canDeleteOrder(order) && (
                          <button
                            onClick={() => deleteOrder(order.id)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-red-700" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
