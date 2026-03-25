"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
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
  ChevronUp,
  Eye,
  EyeOff,
  Upload,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  GalleryHorizontal,
  AlertTriangle,
  CheckCircle2,
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

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
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
  return order.status === "paid";
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

function getTodayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function formatDisplayDate(isoDate: string) {
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function ConfirmModal({
  open,
  title,
  message,
  confirmText,
  confirmVariant = "gold",
  onConfirm,
  onCancel,
  loading,
  children,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  confirmVariant?: "gold" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0d0b09] border border-[#D4AF37]/30 p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-display text-[#F5E6C8] mb-2">{title}</h3>
        <p className="text-sm text-[#8A7D65] mb-4 leading-relaxed">{message}</p>
        {children}
        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 border border-[#D4AF37]/20 text-[#8A7D65] text-sm uppercase hover:bg-[#D4AF37]/5 transition-colors disabled:opacity-40"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2 text-sm uppercase font-bold flex items-center gap-2 transition-colors disabled:opacity-60 ${
              confirmVariant === "danger"
                ? "bg-red-700 text-white hover:bg-red-600"
                : "bg-[#D4AF37] text-black hover:bg-[#C5A55A]"
            }`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-start gap-3 p-4 max-w-sm shadow-2xl border ${
        type === "success"
          ? "bg-green-900/90 border-green-500/40 text-green-300"
          : "bg-red-900/90 border-red-500/40 text-red-300"
      }`}
    >
      {type === "success" ? (
        <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
      ) : (
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
      )}
      <p className="text-sm leading-relaxed flex-1">{message}</p>
      <button onClick={onClose} className="opacity-60 hover:opacity-100">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function DateNavigator({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const today = getTodayISO();

  function shiftDay(delta: number) {
    const d = new Date(value);
    d.setDate(d.getDate() + delta);
    onChange(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }

  const isToday = value === today;

  return (
    <div className="flex items-center gap-1 border border-[#D4AF37]/20 bg-[#0d0b09] px-2 py-1">
      <button
        onClick={() => shiftDay(-1)}
        className="p-1.5 text-[#8A7D65] hover:text-[#D4AF37] transition-colors"
        title="Ngày trước"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => inputRef.current?.showPicker()}
        className="flex items-center gap-2 px-2 py-1 text-sm text-[#F5E6C8] hover:text-[#D4AF37] transition-colors min-w-[120px] justify-center"
      >
        <Calendar className="h-3.5 w-3.5 text-[#8A7D65]" />
        {isToday ? "Hôm nay" : formatDisplayDate(value)}
      </button>
      <input
        ref={inputRef}
        type="date"
        value={value}
        max={today}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        className="sr-only"
      />
      <button
        onClick={() => shiftDay(1)}
        disabled={isToday}
        className="p-1.5 text-[#8A7D65] hover:text-[#D4AF37] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
        title="Ngày sau"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {!isToday && (
        <button
          onClick={() => onChange(today)}
          className="text-[10px] px-2 py-1 text-[#D4AF37] border border-[#D4AF37]/20 hover:bg-[#D4AF37]/10 transition-colors uppercase"
        >
          Hôm nay
        </button>
      )}
    </div>
  );
}

function DualImageUploader({
  label,
  currentUrl,
  onUploaded,
}: {
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(currentUrl || "");
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUrlInput(currentUrl || "");
  }, [currentUrl]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
        setUrlInput(data.url);
      } else {
        alert("Lỗi upload: " + (data.error || "Không rõ"));
        setPreview(null);
      }
    } catch {
      alert("Lỗi upload ảnh");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleUrlCommit() {
    if (urlInput.trim()) {
      onUploaded(urlInput.trim());
      setPreview(null);
    }
  }

  const displayUrl = preview || currentUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] text-[#8A7D65] uppercase">{label}</label>
      <div className="flex gap-3 items-start">
        <div
          className="w-16 h-16 border border-[#D4AF37]/20 bg-black/50 flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer hover:border-[#D4AF37]/40 transition-colors"
          onClick={() => fileRef.current?.click()}
          title="Nhấp để tải ảnh lên"
        >
          {displayUrl ? (
            <img src={displayUrl} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="h-5 w-5 text-[#8A7D65]/40" />
          )}
        </div>
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex gap-1">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onBlur={handleUrlCommit}
              onKeyDown={(e) => e.key === "Enter" && handleUrlCommit()}
              placeholder="Dán URL ảnh..."
              className="flex-1 border border-[#D4AF37]/20 bg-black/60 px-2.5 py-1.5 text-[#F5E6C8] text-xs outline-none focus:border-[#D4AF37]/50 placeholder-[#555040]"
            />
            <button
              type="button"
              onClick={handleUrlCommit}
              className="px-2 border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
              title="Áp dụng URL"
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] uppercase hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-40 w-fit"
          >
            {uploading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Upload className="h-3 w-3" />
            )}
            {uploading ? "Đang tải..." : "Tải từ máy"}
          </button>
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

function MultiImageList({
  label,
  images,
  onChange,
}: {
  label: string;
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addUrl() {
    const url = urlInput.trim();
    if (url && !images.includes(url)) {
      onChange([...images, url]);
    }
    setUrlInput("");
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onChange([...images, data.url]);
      } else {
        alert("Lỗi upload: " + (data.error || "Không rõ"));
      }
    } catch {
      alert("Lỗi upload ảnh");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  }

  function moveDown(idx: number) {
    if (idx === images.length - 1) return;
    const next = [...images];
    [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] text-[#8A7D65] uppercase">{label}</label>
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-1">
          {images.map((url, idx) => (
            <div key={idx} className="relative group aspect-video bg-black/50 border border-[#D4AF37]/10 overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveUp(idx)} title="Lên" className="text-[#D4AF37] text-xs p-1 hover:bg-white/10">↑</button>
                  <button type="button" onClick={() => moveDown(idx)} title="Xuống" className="text-[#D4AF37] text-xs p-1 hover:bg-white/10">↓</button>
                </div>
                <button type="button" onClick={() => removeImage(idx)} className="text-red-400 text-[10px] uppercase">Xóa</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addUrl()}
          placeholder="Dán URL ảnh..."
          className="flex-1 border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm outline-none"
        />
        <button type="button" onClick={addUrl} className="px-3 py-2 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase hover:bg-[#D4AF37]/10">Thêm</button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 px-3 py-2 border border-[#D4AF37]/20 text-[#D4AF37] text-xs uppercase hover:bg-[#D4AF37]/10 disabled:opacity-40"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          {uploading ? "..." : "Tải"}
        </button>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"orders" | "products" | "banners">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
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
    extra_images: [] as string[],
    description_images: [] as string[],
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchPhone, setSearchPhone] = useState("");
  const [filterType, setFilterType] = useState<"all" | "gift" | "ritual">("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>(getTodayISO());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [payConfirmModal, setPayConfirmModal] = useState<{
    open: boolean;
    orderId: string;
    orderLabel: string;
  }>({ open: false, orderId: "", orderLabel: "" });

  const [mintConfirmModal, setMintConfirmModal] = useState<{
    open: boolean;
    orderId: string;
    orderLabel: string;
  }>({ open: false, orderId: "", orderLabel: "" });

  const [revokeConfirmModal, setRevokeConfirmModal] = useState<{
    open: boolean;
    orderId: string;
    orderLabel: string;
  }>({ open: false, orderId: "", orderLabel: "" });

  const [deleteOrderModal, setDeleteOrderModal] = useState<{
    open: boolean;
    orderId: string;
    orderLabel: string;
  }>({ open: false, orderId: "", orderLabel: "" });

  const [deleteProductModal, setDeleteProductModal] = useState<{
    open: boolean;
    productId: string;
    productName: string;
  }>({ open: false, productId: "", productName: "" });

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [bannerForm, setBannerForm] = useState({ image_url: "", title: "", link_url: "" });
  const [bannerUploading, setBannerUploading] = useState(false);
  const bannerFileRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

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

      const [ordersRes, statsRes, productsRes, bannersRes] = await Promise.all([
        fetch("/api/orders", { headers: authHeaders }),
        fetch("/api/orders/stats", { headers: authHeaders }),
        fetch("/api/products"),
        fetch("/api/banners"),
      ]);

      const ordersData = await ordersRes.json();
      const statsData = await statsRes.json();
      const productsData = await productsRes.json();
      const bannersData = await bannersRes.json();

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
      setBanners(bannersData.banners || []);
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

  function openPayConfirm(order: Order) {
    setPayConfirmModal({
      open: true,
      orderId: order.id,
      orderLabel: `${order.sender_name} → ${order.receiver_name}`,
    });
  }

  async function confirmMarkPaid() {
    const { orderId } = payConfirmModal;
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}`, "PUT", { status: "paid" });
    setPayConfirmModal({ open: false, orderId: "", orderLabel: "" });
    await fetchData();
    setActionLoading(null);
  }

  function openMintConfirm(order: Order) {
    setMintConfirmModal({
      open: true,
      orderId: order.id,
      orderLabel: `${order.sender_name} → ${order.receiver_name}`,
    });
  }

  async function confirmMint() {
    const { orderId } = mintConfirmModal;
    setMintConfirmModal((prev) => ({ ...prev, open: false }));
    setActionLoading(orderId);
    try {
      const data = await apiCall(`/api/orders/${orderId}/mint`, "POST");
      if (data.success) {
        showToast("Đúc Blockchain thành công! Chứng thư đã được ghi lên Polygon.", "success");
      } else if (data.error?.includes("Insufficient") || data.error?.includes("MATIC")) {
        showToast(
          `Không đủ MATIC trong ví. ${data.wallet ? `Ví: ${data.wallet.slice(0, 10)}...` : ""} Vui lòng nạp MATIC và thử lại.`,
          "error"
        );
      } else {
        showToast(`Đúc thất bại: ${data.error || "Lỗi không xác định"}. Đơn hàng đã được khôi phục.`, "error");
      }
    } catch (err) {
      showToast("Lỗi kết nối khi đúc Blockchain. Vui lòng thử lại.", "error");
    }
    await fetchData();
    setActionLoading(null);
  }

  function openRevokeConfirm(order: Order) {
    setRevokeConfirmModal({
      open: true,
      orderId: order.id,
      orderLabel: `${order.sender_name} → ${order.receiver_name}`,
    });
  }

  async function confirmRevoke() {
    const { orderId } = revokeConfirmModal;
    setRevokeConfirmModal((prev) => ({ ...prev, open: false }));
    setActionLoading(orderId);
    await apiCall(`/api/orders/${orderId}/revoke`, "POST");
    await fetchData();
    setActionLoading(null);
  }

  function openDeleteOrderModal(order: Order) {
    setDeleteOrderModal({
      open: true,
      orderId: order.id,
      orderLabel: `${order.sender_name} → ${order.receiver_name}`,
    });
  }

  async function confirmDeleteOrder() {
    const { orderId } = deleteOrderModal;
    setDeleteOrderModal((prev) => ({ ...prev, open: false }));
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
      extra_images: productForm.extra_images,
      description_images: productForm.description_images,
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
          extra_images: [],
          description_images: [],
        });
        await fetchData();
        showToast(editingProduct ? "Sản phẩm đã được cập nhật." : "Sản phẩm mới đã được tạo.", "success");
      } else {
        showToast("Lỗi: " + data.error, "error");
      }
    } catch (err) {
      console.error("Error saving product:", err);
      showToast("Lỗi không xác định khi lưu sản phẩm.", "error");
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
      extra_images: Array.isArray((product as any).extra_images) ? (product as any).extra_images : [],
      description_images: Array.isArray((product as any).description_images) ? (product as any).description_images : [],
    });
    setShowProductForm(true);
  }

  function openDeleteProductModal(product: Product) {
    setDeleteProductModal({
      open: true,
      productId: product.id,
      productName: product.name,
    });
  }

  async function confirmDeleteProduct() {
    const { productId } = deleteProductModal;
    setDeleteProductModal((prev) => ({ ...prev, open: false }));
    await apiCall(`/api/products/${productId}`, "DELETE");
    await fetchData();
  }

  async function handleBannerFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${getAdminToken()}` },
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setBannerForm((prev) => ({ ...prev, image_url: data.url }));
      } else {
        showToast("Lỗi upload ảnh banner: " + (data.error || "Không rõ"), "error");
      }
    } catch {
      showToast("Lỗi kết nối khi upload banner", "error");
    } finally {
      setBannerUploading(false);
    }
  }

  async function handleAddBanner() {
    if (!bannerForm.image_url) {
      showToast("Vui lòng nhập URL hoặc tải ảnh banner lên", "error");
      return;
    }
    setActionLoading("banner-add");
    try {
      const data = await apiCall("/api/banners", "POST", bannerForm);
      if (data.success) {
        setBannerForm({ image_url: "", title: "", link_url: "" });
        await fetchData();
        showToast("Banner đã được thêm thành công.", "success");
      } else {
        showToast("Lỗi thêm banner: " + data.error, "error");
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function toggleBannerActive(banner: Banner) {
    await apiCall(`/api/banners/${banner.id}`, "PUT", { is_active: !banner.is_active });
    await fetchData();
  }

  async function deleteBanner(bannerId: string) {
    await apiCall(`/api/banners/${bannerId}`, "DELETE");
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

    if (filterDate && !searchPhone.trim()) {
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

        <div className="flex gap-2 md:gap-4 mb-6 flex-wrap">
          <button
            onClick={() => setTab("orders")}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 text-sm uppercase transition-all ${tab === "orders" ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40" : "text-[#8A7D65] border border-[#D4AF37]/10"}`}
          >
            <ShoppingBag className="h-4 w-4" /> Đơn hàng
          </button>
          <button
            onClick={() => setTab("products")}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 text-sm uppercase transition-all ${tab === "products" ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40" : "text-[#8A7D65] border border-[#D4AF37]/10"}`}
          >
            <Package className="h-4 w-4" /> Sản phẩm
          </button>
          <button
            onClick={() => setTab("banners")}
            className={`flex items-center gap-2 px-4 md:px-5 py-2.5 text-sm uppercase transition-all ${tab === "banners" ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40" : "text-[#8A7D65] border border-[#D4AF37]/10"}`}
          >
            <GalleryHorizontal className="h-4 w-4" /> Banners
          </button>
        </div>

        {/* =========== PRODUCTS TAB =========== */}
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
                    extra_images: [],
                    description_images: [],
                  });
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-black text-sm uppercase font-medium"
              >
                <Plus className="h-4 w-4" /> Thêm sản phẩm
              </button>
            </div>

            <div className="border border-[#D4AF37]/20 bg-[#0d0b09] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase tracking-wider">
                    <th className="px-4 py-4 text-left">Ảnh</th>
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
                      <td className="px-4 py-3">
                        <div className="w-12 h-12 bg-black/50 border border-[#D4AF37]/10 overflow-hidden">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-[#8A7D65]/30" />
                            </div>
                          )}
                        </div>
                      </td>
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
                            title="Sửa sản phẩm"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openDeleteProductModal(product)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10"
                            title="Xóa sản phẩm"
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

        {/* =========== BANNERS TAB =========== */}
        {tab === "banners" && (
          <>
            <div className="mb-6 p-5 border border-[#D4AF37]/20 bg-[#0d0b09]">
              <h3 className="text-sm uppercase tracking-widest text-[#D4AF37] mb-4">
                Thêm Banner mới
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Tiêu đề (tùy chọn)</label>
                  <input
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Tên banner"
                    className="border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Link khi nhấn (tùy chọn)</label>
                  <input
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm((f) => ({ ...f, link_url: e.target.value }))}
                    placeholder="https://..."
                    className="border border-[#D4AF37]/20 bg-black px-3 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <DualImageUploader
                    label="Ảnh Banner"
                    currentUrl={bannerForm.image_url}
                    onUploaded={(url) => setBannerForm((f) => ({ ...f, image_url: url }))}
                  />
                </div>
              </div>
              <button
                onClick={handleAddBanner}
                disabled={actionLoading === "banner-add"}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-[#D4AF37] text-black text-sm uppercase font-bold disabled:opacity-50"
              >
                {actionLoading === "banner-add" && <Loader2 className="h-4 w-4 animate-spin" />}
                <Plus className="h-4 w-4" />
                Thêm Banner
              </button>
            </div>

            <div className="border border-[#D4AF37]/20 bg-[#0d0b09]">
              <div className="px-4 py-3 border-b border-[#D4AF37]/10">
                <h3 className="text-sm uppercase tracking-widest text-[#D4AF37]">
                  Banners hiện tại ({banners.length})
                </h3>
              </div>
              {banners.length === 0 ? (
                <div className="px-4 py-12 text-center text-[#8A7D65] text-sm">
                  Chưa có banner nào. Thêm banner mới ở trên.
                </div>
              ) : (
                <div className="divide-y divide-[#D4AF37]/10">
                  {banners.map((banner) => (
                    <div key={banner.id} className="flex items-center gap-4 px-4 py-3">
                      <div className="w-24 h-14 bg-black/50 border border-[#D4AF37]/10 overflow-hidden flex-shrink-0">
                        <img
                          src={banner.image_url}
                          alt={banner.title || "Banner"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F5E6C8] text-sm font-medium truncate">
                          {banner.title || "Banner không có tiêu đề"}
                        </p>
                        {banner.link_url && (
                          <p className="text-[#8A7D65] text-xs truncate">{banner.link_url}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleBannerActive(banner)}
                          title={banner.is_active ? "Đang hiển thị — nhấn để ẩn" : "Đang ẩn — nhấn để hiện"}
                          className={`text-sm transition-colors ${banner.is_active ? "text-green-400 hover:text-green-300" : "text-[#555] hover:text-[#888]"}`}
                        >
                          {banner.is_active ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteBanner(banner.id)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10"
                          title="Xóa banner"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* =========== ORDERS TAB =========== */}
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

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <input
                  type="text"
                  value={searchPhone}
                  onChange={(e) => setSearchPhone(e.target.value)}
                  placeholder="Tìm theo SĐT..."
                  className="w-full pl-10 pr-4 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 placeholder-[#8A7D65]/60"
                />
                {searchPhone && (
                  <button
                    onClick={() => setSearchPhone("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-3.5 w-3.5 text-[#8A7D65] hover:text-[#D4AF37]" />
                  </button>
                )}
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A7D65]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full md:w-auto pl-10 pr-8 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 cursor-pointer appearance-none"
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
                  className="w-full md:w-auto pl-10 pr-8 py-2.5 border border-[#D4AF37]/20 bg-[#0d0b09] text-[#F5E6C8] text-sm outline-none focus:border-[#D4AF37]/50 cursor-pointer appearance-none"
                >
                  <option value="all">Tất cả trạng thái</option>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <DateNavigator
                value={filterDate}
                onChange={setFilterDate}
              />
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-[#8A7D65]">
                {searchPhone.trim()
                  ? `Tìm thấy ${filteredOrders.length} đơn hàng`
                  : `${filteredOrders.length} đơn hàng ngày ${filterDate === getTodayISO() ? "hôm nay" : formatDisplayDate(filterDate)}`}
              </span>
              {(searchPhone || filterType !== "all" || filterStatus !== "all") && (
                <button
                  onClick={() => {
                    setSearchPhone("");
                    setFilterType("all");
                    setFilterStatus("all");
                  }}
                  className="text-[#D4AF37] hover:underline text-xs uppercase"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>

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
                        {searchPhone.trim()
                          ? "Không tìm thấy đơn hàng nào với SĐT này"
                          : `Không có đơn hàng nào ngày ${filterDate === getTodayISO() ? "hôm nay" : formatDisplayDate(filterDate)}`}
                      </td>
                    </tr>
                  )}
                  {filteredOrders.map((order) => {
                    const qty = order.quantity || 1;
                    const unitPrice = order.product?.price || 0;
                    const totalValue = unitPrice * qty;
                    const isExpanded = expandedOrder === order.id;
                    const mintable = canMintOrder(order);
                    const revocable = canRevokeOrder(order);

                    return (
                      <tr key={order.id} className="border-b border-[#D4AF37]/10 hover:bg-[#1a1712]/50 transition-colors">
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
                              {order.blockchain_hash && (
                                <div className="mt-1 text-[10px] font-mono text-[#D4AF37]/50 truncate max-w-[200px]">
                                  TX: {order.blockchain_hash}
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
                          <div className="flex gap-1 items-center flex-wrap">
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
                                onClick={() => openPayConfirm(order)}
                                title="Xác nhận thanh toán"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-blue-400 hover:bg-blue-400/10 transition-colors disabled:opacity-40"
                              >
                                <CreditCard className="h-4 w-4" />
                              </button>
                            )}
                            {mintable && (
                              <button
                                onClick={() => openMintConfirm(order)}
                                title="Đúc Blockchain (chỉ khi đã thanh toán)"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-green-400 hover:bg-green-400/10 transition-colors disabled:opacity-40"
                              >
                                {actionLoading === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Shield className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {revocable && (
                              <button
                                onClick={() => openRevokeConfirm(order)}
                                title="Thu hồi chứng thư"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-orange-400 hover:bg-orange-400/10 transition-colors disabled:opacity-40"
                              >
                                <Ban className="h-4 w-4" />
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
                                onClick={() => openDeleteOrderModal(order)}
                                title="Xóa"
                                disabled={actionLoading === order.id}
                                className="p-1.5 text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-40"
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

      {/* =========== FLOATING PRODUCT MODAL =========== */}
      {showProductForm && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowProductForm(false);
              setEditingProduct(null);
            }
          }}
        >
          <div className="bg-[#0d0b09] border border-[#D4AF37]/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#0d0b09] border-b border-[#D4AF37]/20 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-sm uppercase tracking-widest text-[#D4AF37]">
                {editingProduct ? "Cập nhật sản phẩm" : "Sản phẩm mới"}
              </h3>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
                className="text-[#8A7D65] hover:text-[#F5E6C8] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Tên sản phẩm *</label>
                  <input
                    value={productForm.name}
                    onChange={(e) => setProductForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Nhập tên sản phẩm"
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] focus:border-[#D4AF37]/60 text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Loại bộ sưu tập</label>
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
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Giá (VND) *</label>
                  <input
                    value={productForm.price}
                    onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="Ví dụ: 2500000"
                    type="number"
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Danh mục</label>
                  <input
                    value={productForm.category}
                    onChange={(e) => setProductForm((p) => ({ ...p, category: e.target.value }))}
                    placeholder="Ví dụ: Luxury, Premium"
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <DualImageUploader
                    label="Ảnh chính sản phẩm"
                    currentUrl={productForm.image_url}
                    onUploaded={(url) => setProductForm((p) => ({ ...p, image_url: url }))}
                  />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1">
                  <label className="text-[10px] text-[#8A7D65] uppercase">Mô tả sản phẩm</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Nhập mô tả chi tiết sản phẩm..."
                    rows={4}
                    className="border border-[#D4AF37]/20 bg-black px-4 py-2 text-[#F5E6C8] text-sm outline-none resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <MultiImageList
                    label="Ảnh phụ sản phẩm (gallery)"
                    images={productForm.extra_images}
                    onChange={(imgs) => setProductForm((p) => ({ ...p, extra_images: imgs }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <MultiImageList
                    label="Ảnh trong mô tả (hiển thị dưới trang sản phẩm)"
                    images={productForm.description_images}
                    onChange={(imgs) => setProductForm((p) => ({ ...p, description_images: imgs }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-5 flex items-center rounded-full transition-colors ${
                        productForm.is_permanent_available ? "bg-[#D4AF37]" : "bg-[#333]"
                      }`}
                      onClick={() =>
                        setProductForm((p) => ({
                          ...p,
                          is_permanent_available: !p.is_permanent_available,
                        }))
                      }
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full mx-0.5 transition-transform ${
                          productForm.is_permanent_available ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                    <span className="text-[#8A7D65] text-sm">Cho phép đặt vĩnh cửu</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-[#D4AF37]/10">
                <button
                  onClick={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-5 py-2.5 border border-[#D4AF37]/20 text-[#8A7D65] text-sm uppercase hover:bg-[#D4AF37]/5 transition-colors"
                >
                  Hủy
                </button>
                <button
                  disabled={actionLoading === "product-save"}
                  onClick={handleSaveProduct}
                  className="flex-1 py-2.5 bg-[#D4AF37] text-black text-sm uppercase font-bold flex items-center justify-center gap-2 hover:bg-[#C5A55A] transition-colors disabled:opacity-60"
                >
                  {actionLoading === "product-save" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========== CONFIRM MODALS =========== */}
      <ConfirmModal
        open={payConfirmModal.open}
        title="Xác nhận thanh toán"
        message={`Xác nhận đơn hàng "${payConfirmModal.orderLabel}" đã được thanh toán? Sau khi xác nhận, bạn có thể đúc chứng thư Blockchain.`}
        confirmText="Xác nhận thanh toán"
        onConfirm={confirmMarkPaid}
        onCancel={() => setPayConfirmModal({ open: false, orderId: "", orderLabel: "" })}
        loading={actionLoading === payConfirmModal.orderId}
      />

      <ConfirmModal
        open={mintConfirmModal.open}
        title="Đúc Blockchain"
        message={`Bạn có chắc chắn muốn đúc chứng thư này lên Blockchain không? Hành động này không thể hoàn tác.`}
        confirmText="Đúc Blockchain"
        onConfirm={confirmMint}
        onCancel={() => setMintConfirmModal({ open: false, orderId: "", orderLabel: "" })}
        loading={actionLoading === mintConfirmModal.orderId}
      >
        <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 p-3 mb-2">
          <p className="text-[11px] text-[#C5A55A] leading-relaxed">
            <strong className="text-[#D4AF37]">Đơn hàng:</strong> {mintConfirmModal.orderLabel}
          </p>
          <p className="text-[10px] text-[#8A7D65] mt-1">
            Giao dịch sẽ được ghi vĩnh viễn lên mạng Polygon. Đảm bảo ví blockchain có đủ MATIC.
          </p>
        </div>
      </ConfirmModal>

      <ConfirmModal
        open={revokeConfirmModal.open}
        title="Thu hồi chứng thư"
        message={`Thu hồi chứng thư của đơn hàng "${revokeConfirmModal.orderLabel}"? Hành động này không thể hoàn tác.`}
        confirmText="Thu hồi"
        confirmVariant="danger"
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeConfirmModal({ open: false, orderId: "", orderLabel: "" })}
        loading={actionLoading === revokeConfirmModal.orderId}
      />

      <ConfirmModal
        open={deleteOrderModal.open}
        title="Xóa đơn hàng"
        message={`Xóa đơn hàng "${deleteOrderModal.orderLabel}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        onConfirm={confirmDeleteOrder}
        onCancel={() => setDeleteOrderModal({ open: false, orderId: "", orderLabel: "" })}
        loading={actionLoading === deleteOrderModal.orderId}
      />

      <ConfirmModal
        open={deleteProductModal.open}
        title="Xóa sản phẩm"
        message={`Xóa sản phẩm "${deleteProductModal.productName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        confirmVariant="danger"
        onConfirm={confirmDeleteProduct}
        onCancel={() => setDeleteProductModal({ open: false, productId: "", productName: "" })}
      />

      {/* =========== TOAST NOTIFICATION =========== */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </main>
  );
}
