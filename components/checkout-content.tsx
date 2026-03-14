"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Heart,
  Phone,
  PenLine,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Download,
  MapPin,
  Minus,
  Plus,
} from "lucide-react";
import { CommitmentCertificate } from "@/components/commitment-certificate";
import { products as fallbackProducts, formatPrice } from "@/lib/products";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  description?: string;
}

interface FormData {
  senderName: string;
  receiverName: string;
  phone: string;
  receiverPhone: string;
  receiverAddress: string;
  message: string;
}

interface FormErrors {
  senderName?: string;
  receiverName?: string;
  phone?: string;
  receiverPhone?: string;
  receiverAddress?: string;
}

// Hàm validate: Cả 2 luồng đều bắt buộc SĐT và Địa chỉ người nhận
function validateForm(data: FormData, flow: string): FormErrors {
  const errors: FormErrors = {};
  if (!data.senderName.trim()) errors.senderName = "Vui lòng nhập tên của bạn";
  if (!data.receiverName.trim())
    errors.receiverName = "Vui lòng nhập tên người nhận";

  if (!data.phone.trim()) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9]{9,11}$/.test(data.phone.replace(/\s/g, ""))) {
    errors.phone = "Số điện thoại không hợp lệ";
  }

  // Bắt buộc cho cả Gift và Ritual
  if (!data.receiverPhone.trim()) {
    errors.receiverPhone = "Vui lòng nhập SĐT người nhận";
  } else if (!/^[0-9]{9,11}$/.test(data.receiverPhone.replace(/\s/g, ""))) {
    errors.receiverPhone = "Số điện thoại không hợp lệ";
  }

  if (!data.receiverAddress.trim())
    errors.receiverAddress = "Vui lòng nhập địa chỉ giao hàng";

  return errors;
}

// Kiểm tra nút thanh toán có được sáng lên hay không
function isFormComplete(data: FormData, flow: string): boolean {
  return (
    data.senderName.trim().length > 0 &&
    data.receiverName.trim().length > 0 &&
    data.phone.trim().length > 0 &&
    data.receiverPhone.trim().length > 0 &&
    data.receiverAddress.trim().length > 0 &&
    data.message.trim().length > 0
  );
}

function FormInput({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-center gap-2 text-sm text-[#C5A55A] mb-2 tracking-wide"
      >
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full border border-[#D4AF37]/20 bg-[#0d0b09] px-4 py-3.5 text-[#F5E6C8] placeholder:text-[#555040] focus:outline-none focus:border-[#D4AF37]/60 transition-colors font-serif text-base ${disabled ? "opacity-60 cursor-not-allowed bg-[#1a1814]" : ""}`}
      />
      {hint && <p className="mt-1.5 text-xs text-[#D4AF37]/70">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-[#A52525]">{error}</p>}
    </div>
  );
}

function OrderSummary({
  product,
  quantity,
  onQuantityChange,
}: {
  product: Product | null;
  quantity: number;
  onQuantityChange: (q: number) => void;
}) {
  if (!product) return null;
  const totalPrice = product.price * quantity;

  return (
    <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-5">
      <p className="text-xs tracking-[0.3em] uppercase text-[#C5A55A] mb-4">
        Đơn hàng của bạn
      </p>
      <div className="flex gap-4">
        <div className="relative w-20 h-24 flex-shrink-0 overflow-hidden bg-[#1a1814]">
          <Image
            src={product.image_url || product.image || "/images/product-1.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-[#F5E6C8] truncate">
            {product.name}
          </h4>
          <p className="text-sm text-[#D4AF37] mt-1">
            {formatPrice(product.price)}
          </p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
        <span className="text-sm text-[#8A7D65]">Số lượng</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            className="h-8 w-8 border border-[#D4AF37]/20 text-[#C5A55A]"
          >
            -
          </button>
          <span className="text-base text-[#F5E6C8]">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="h-8 w-8 border border-[#D4AF37]/20 text-[#C5A55A]"
          >
            +
          </button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
        <span className="text-sm text-[#C5A55A]">Tổng cộng</span>
        <span className="text-lg text-[#D4AF37] font-display">
          {formatPrice(totalPrice)}
        </span>
      </div>
    </div>
  );
}

export function CheckoutContent() {
  const searchParams = useSearchParams();
  const [flow, setFlow] = useState("gift");
  const [formData, setFormData] = useState<FormData>({
    senderName: "",
    receiverName: "",
    phone: "",
    receiverPhone: "",
    receiverAddress: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [publicVow, setPublicVow] = useState(true);
  const [ritualType, setRitualType] = useState("");
  const [offering, setOffering] = useState("");
  const [moment, setMoment] = useState("");
  const [productId, setProductId] = useState("");
  const [permanenceType, setPermanenceType] = useState<
    "temporary" | "permanent"
  >("temporary");
  const [receiverLocked, setReceiverLocked] = useState(false);
  const [senderLocked, setSenderLocked] = useState(false);
  const [lastLookedUpPhone, setLastLookedUpPhone] = useState("");
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lookupLoading, setLookupLoading] = useState(false);

  useEffect(() => {
    const urlFlow = searchParams.get("flow");
    const storedFlow =
      typeof window !== "undefined" ? localStorage.getItem("ntt_flow") : null;
    setFlow(urlFlow || storedFlow || "gift");

    setRitualType(localStorage.getItem("ntt_ritual_type") || "");
    setOffering(localStorage.getItem("ntt_offering") || "");
    setMoment(localStorage.getItem("ntt_moment") || "");
    const storedProduct = localStorage.getItem("ntt_selected_product") || "";
    setProductId(storedProduct);
    if (storedProduct) loadProduct(storedProduct);
  }, [searchParams]);

  async function loadProduct(pid: string) {
    try {
      const res = await fetch(`/api/products/${pid}`);
      const data = await res.json();
      if (data.success && data.product) {
        setProduct(data.product);
      }
    } catch {
      const fallback = fallbackProducts.find((p) => p.id === pid);
      if (fallback) setProduct({ ...fallback, image_url: fallback.image });
    }
  }

  // Effect Auto-load thông tin từ số điện thoại
  useEffect(() => {
    const phone = formData.phone.replace(/\s/g, "");
    if (
      phone.length >= 9 &&
      phone.length <= 11 &&
      /^[0-9]+$/.test(phone) &&
      phone !== lastLookedUpPhone
    ) {
      const timeout = setTimeout(async () => {
        setLookupLoading(true);
        try {
          const res = await fetch(
            `/api/orders/lookup?phone=${encodeURIComponent(phone)}`,
          );
          const data = await res.json();
          setLastLookedUpPhone(phone);
          if (data.success && data.found) {
            setIsReturningCustomer(true);
            setFormData((prev) => ({
              ...prev,
              senderName: data.sender_name || prev.senderName,
              receiverName: data.receiver_name || prev.receiverName,
              receiverPhone: data.receiver_phone || prev.receiverPhone,
              receiverAddress: data.receiver_address || prev.receiverAddress,
            }));
            if (flow === "ritual") {
              if (data.sender_name) setSenderLocked(true);
              if (data.receiver_name) setReceiverLocked(true);
            }
          }
        } catch (e) {
        } finally {
          setLookupLoading(false);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [formData.phone, flow]);

  const updateField = useCallback(
    (field: keyof FormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field as keyof FormErrors];
          return next;
        });
      }
    },
    [errors],
  );

  async function handleSubmit() {
    const validationErrors = validateForm(formData, flow);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsFlipping(true);
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ritual_type: ritualType || (flow === "gift" ? "Gift" : null),
          offering,
          product_id: productId,
          public_vow: publicVow,
          permanence_type: permanenceType,
          quantity,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setOrderResult(data);
        setSubmitted(true);
      } else {
        alert("Lỗi: " + data.error);
        setIsFlipping(false);
      }
    } catch {
      setIsFlipping(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-10 py-8 animate-in fade-in">
        <ShieldCheck className="h-14 w-14 text-[#D4AF37]" />
        <h2 className="text-3xl font-display text-[#F5E6C8]">
          Đơn hàng đã được ghi nhận
        </h2>
        <CommitmentCertificate
          buyerName={formData.senderName}
          recipientName={formData.receiverName}
          animate={true}
        />
        <Link
          href="/"
          className="text-[#C5A55A] uppercase tracking-widest text-sm"
        >
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const canSubmit = isFormComplete(formData, flow);

  return (
    <div
      className={`transition-all duration-700 ${isFlipping ? "opacity-0" : "opacity-100"}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <CommitmentCertificate
            buyerName={formData.senderName || "Người gửi"}
            recipientName={formData.receiverName || "Người nhận"}
            animate={false}
          />
          <OrderSummary
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />
        </div>

        <div className="space-y-5">
          <h2 className="text-2xl font-display text-[#F5E6C8] uppercase tracking-widest">
            {flow === "gift" ? "Thông tin giao hàng" : "Hoàn tất nghi lễ"}
          </h2>

          <FormInput
            id="sender-name"
            label="Tên người gửi"
            icon={User}
            placeholder="Họ và tên..."
            value={formData.senderName}
            onChange={updateField("senderName")}
            error={errors.senderName}
            disabled={senderLocked}
          />
          <FormInput
            id="phone"
            label="Số điện thoại của bạn"
            icon={Phone}
            type="tel"
            placeholder="0xxx..."
            value={formData.phone}
            onChange={updateField("phone")}
            error={errors.phone}
            hint={lookupLoading ? "Đang tìm..." : ""}
          />
          <FormInput
            id="receiver-name"
            label="Tên người nhận"
            icon={Heart}
            placeholder="Tên người thương..."
            value={formData.receiverName}
            onChange={updateField("receiverName")}
            error={errors.receiverName}
            disabled={receiverLocked}
          />

          {/* SĐT và Địa chỉ người nhận - BẮT BUỘC & CÓ THỂ SỬA TRÊN CẢ 2 LUỒNG */}
          <FormInput
            id="receiver-phone"
            label="Số điện thoại người nhận"
            icon={Phone}
            type="tel"
            placeholder="Số điện thoại người nhận hoa..."
            value={formData.receiverPhone}
            onChange={updateField("receiverPhone")}
            error={errors.receiverPhone}
          />
          <FormInput
            id="receiver-address"
            label="Địa chỉ giao hàng"
            icon={MapPin}
            placeholder="Địa chỉ chi tiết..."
            value={formData.receiverAddress}
            onChange={updateField("receiverAddress")}
            error={errors.receiverAddress}
          />

          <div className="pt-4">
            <label className="text-sm text-[#C5A55A] flex items-center gap-2 mb-2">
              <PenLine className="h-4 w-4" /> Lời nhắn
            </label>
            <textarea
              className="w-full bg-[#0d0b09] border border-[#D4AF37]/20 p-4 text-[#F5E6C8] italic italic leading-8"
              rows={5}
              value={formData.message}
              onChange={(e) => updateField("message")(e.target.value)}
              placeholder="Gửi lời nguyện ước..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 uppercase tracking-[0.2em] transition-all ${canSubmit ? "bg-[#D4AF37] text-black" : "bg-[#1a1814] text-[#555040] border border-[#2a2520]"}`}
          >
            {flow === "gift" ? "Xác nhận đặt hàng" : "Xác nhận & Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
