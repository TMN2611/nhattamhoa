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
  Package,
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

interface CustomerData {
  sender_name: string;
  receiver_name: string;
  receiver_phone?: string;
  receiver_address?: string;
  last_ai_message?: string;
  total_orders: number;
  customer_id?: string;
}

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
  if (flow === "gift") {
    if (!data.receiverPhone.trim()) {
      errors.receiverPhone = "Vui lòng nhập SĐT người nhận";
    } else if (!/^[0-9]{9,11}$/.test(data.receiverPhone.replace(/\s/g, ""))) {
      errors.receiverPhone = "Số điện thoại không hợp lệ";
    }
    if (!data.receiverAddress.trim())
      errors.receiverAddress = "Vui lòng nhập địa chỉ giao hàng";
  }
  return errors;
}

function isFormComplete(data: FormData, flow: string): boolean {
  const base =
    data.senderName.trim().length > 0 &&
    data.receiverName.trim().length > 0 &&
    data.phone.trim().length > 0 &&
    data.message.trim().length > 0;
  if (flow === "gift") {
    return (
      base &&
      data.receiverPhone.trim().length > 0 &&
      data.receiverAddress.trim().length > 0
    );
  }
  return base;
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

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;

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
            {formatPrice(unitPrice)}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#D4AF37]/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#8A7D65]">Số lượng</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
              className="h-8 w-8 flex items-center justify-center border border-[#D4AF37]/20 text-[#C5A55A] hover:border-[#D4AF37]/50 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-base text-[#F5E6C8] font-medium w-8 text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onQuantityChange(quantity + 1)}
              className="h-8 w-8 flex items-center justify-center border border-[#D4AF37]/20 text-[#C5A55A] hover:border-[#D4AF37]/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#D4AF37]/10 flex items-center justify-between">
        <span className="text-sm text-[#C5A55A] tracking-wider">Tổng cộng</span>
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

  useEffect(() => {
    const urlFlow = searchParams.get("flow");
    const storedFlow =
      typeof window !== "undefined" ? localStorage.getItem("ntt_flow") : null;
    setFlow(urlFlow || storedFlow || "gift");
  }, [searchParams]);

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
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    certificate_id: string;
    blockchain_hash: string;
  } | null>(null);
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
    setRitualType(localStorage.getItem("ntt_ritual_type") || "");
    setOffering(localStorage.getItem("ntt_offering") || "");
    setMoment(localStorage.getItem("ntt_moment") || "");
    const storedProduct = localStorage.getItem("ntt_selected_product") || "";
    setProductId(storedProduct);
    const storedPermanence = localStorage.getItem("ntt_permanence_type");
    if (storedPermanence === "permanent" || storedPermanence === "temporary") {
      setPermanenceType(storedPermanence);
    }

    const savedPhone = localStorage.getItem("ntt_phone");
    if (savedPhone) {
      setFormData((prev) => ({ ...prev, phone: savedPhone }));
    }

    if (storedProduct) {
      loadProduct(storedProduct);
    }
  }, []);

  async function loadProduct(pid: string) {
    try {
      const res = await fetch(`/api/products/${pid}`);
      const data = await res.json();
      if (data.success && data.product) {
        setProduct(data.product);
        return;
      }
    } catch {}
    const fallback = fallbackProducts.find((p) => p.id === pid);
    if (fallback) {
      setProduct({ ...fallback, image_url: fallback.image });
    }
  }

  useEffect(() => {
    const phone = formData.phone.replace(/\s/g, "");
    if (phone !== lastLookedUpPhone) {
      if (receiverLocked || senderLocked) {
        setReceiverLocked(false);
        setSenderLocked(false);
        setIsReturningCustomer(false);
      }
    }
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

            if (flow === "ritual") {
              if (data.sender_name) {
                setFormData((prev) => ({
                  ...prev,
                  senderName: data.sender_name,
                }));
                setSenderLocked(true);
              }
              if (data.receiver_name) {
                setFormData((prev) => ({
                  ...prev,
                  receiverName: data.receiver_name,
                }));
                setReceiverLocked(true);
              }
            } else {
              if (data.sender_name) {
                setFormData((prev) => ({
                  ...prev,
                  senderName: data.sender_name,
                }));
              }
              if (data.receiver_name) {
                setFormData((prev) => ({
                  ...prev,
                  receiverName: data.receiver_name,
                }));
              }
            }

            if (data.receiver_phone) {
              setFormData((prev) => ({
                ...prev,
                receiverPhone: data.receiver_phone,
              }));
            }
            if (data.receiver_address) {
              setFormData((prev) => ({
                ...prev,
                receiverAddress: data.receiver_address,
              }));
            }

            localStorage.setItem("ntt_phone", phone);
          } else {
            setIsReturningCustomer(false);
          }
        } catch {
        } finally {
          setLookupLoading(false);
        }
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [
    formData.phone,
    lastLookedUpPhone,
    receiverLocked,
    senderLocked,
    flow,
    formData.message,
  ]);

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

  async function handleAISuggest() {
    setGeneratingMessage(true);
    try {
      const res = await fetch("/api/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiver_name: formData.receiverName || "người thương",
          sender_name: formData.senderName || "người gửi",
          ritual_type: ritualType,
          moment: moment,
        }),
      });
      const data = await res.json();
      if (data.success && data.message) {
        setFormData((prev) => ({ ...prev, message: data.message }));
      }
    } catch (err) {
      console.error("AI suggest error:", err);
    } finally {
      setGeneratingMessage(false);
    }
  }

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
          sender_name: formData.senderName,
          receiver_name: formData.receiverName,
          phone: formData.phone,
          message: formData.message,
          ritual_type: ritualType || (flow === "gift" ? "Gift" : null),
          offering: offering || null,
          product_id: productId || undefined,
          public_vow: publicVow,
          permanence_type: permanenceType,
          receiver_phone: formData.receiverPhone || null,
          receiver_address: formData.receiverAddress || null,
          quantity: quantity,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderResult({
          orderId: data.orderId,
          certificate_id: data.order?.certificate_id || null,
          blockchain_hash: data.order?.blockchain_hash || null,
        });
        localStorage.setItem("ntt_returning_user", "true");
        localStorage.setItem("ntt_phone", formData.phone.replace(/\s/g, ""));
        localStorage.removeItem("ntt_ritual_step");
        localStorage.removeItem("ntt_moment");
        localStorage.removeItem("ntt_ritual_type");
        localStorage.removeItem("ntt_offering");
        localStorage.removeItem("ntt_flow");
        setTimeout(() => setSubmitted(true), 700);
      } else {
        console.error("Order failed:", data.error, data.details);
        setIsFlipping(false);
        alert("Lỗi tạo đơn hàng: " + (data.error || "Vui lòng thử lại"));
      }
    } catch (err) {
      console.error("Failed to create order", err);
      setIsFlipping(false);
      alert("Không thể kết nối. Vui lòng thử lại.");
    }
  }

  function handleDownloadPDF() {
    if (!orderResult) return;
    window.open(`/api/certificate/${orderResult.certificate_id}/pdf`, "_blank");
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-10 py-8 animate-in fade-in duration-700">
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/30">
            <ShieldCheck className="h-7 w-7 text-[#D4AF37]" />
          </div>
          <p className="text-xs tracking-[0.4em] uppercase text-[#D4AF37]">
            {flow === "gift" ? "Đặt hàng thành công" : "Nghi lễ đã hoàn tất"}
          </p>
          <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
            {flow === "gift"
              ? "Đơn hàng đã được ghi nhận"
              : "Lời nguyện của bạn đã được ghi nhận"}
          </h2>
          <p className="text-sm text-[#8A7D65] mt-3">
            Chứng thư sẽ được gửi đến email của bạn.
          </p>
        </div>

        <CommitmentCertificate
          buyerName={formData.senderName}
          recipientName={formData.receiverName}
          blockchainData={
            orderResult?.certificate_id
              ? {
                  orderId: orderResult.certificate_id,
                  txHash: orderResult.blockchain_hash,
                }
              : null
          }
          animate={true}
        />

        {orderResult && (
          <div className="space-y-4 w-full max-w-md">
            {orderResult.certificate_id ? (
              <>
                <div className="p-4 bg-[#0d0b09] border border-[#D4AF37]/20 text-center">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-2">
                    Mã chứng thư
                  </p>
                  <p className="text-lg text-[#F5E6C8] font-mono">
                    {orderResult.certificate_id}
                  </p>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] font-medium tracking-wider uppercase text-xs transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate PDF
                </button>
              </>
            ) : (
              <div className="p-4 bg-[#0d0b09] border border-[#D4AF37]/20 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#D4AF37] mb-2">
                  Mã đơn hàng
                </p>
                <p className="text-sm text-[#F5E6C8] font-mono mb-3">
                  {orderResult.orderId}
                </p>
                <p className="text-xs text-[#8A7D65]">
                  Chứng thư sẽ được tạo sau khi đơn hàng được xác nhận thanh
                  toán.
                </p>
              </div>
            )}
          </div>
        )}

        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-[#C5A55A] hover:text-[#D4AF37] transition-colors tracking-wider uppercase"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  const canSubmit = isFormComplete(formData, flow);

  return (
    <div
      className={`perspective-container transition-all duration-700 ${isFlipping ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
        <div className="order-2 lg:order-1 space-y-8">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A] mb-6 text-center lg:text-left">
              Xem trước chứng thư
            </p>
            <CommitmentCertificate
              buyerName={formData.senderName || "Sender's Name"}
              recipientName={formData.receiverName || "Receiver's Name"}
              animate={false}
            />
          </div>

          <OrderSummary
            product={product}
            quantity={quantity}
            onQuantityChange={setQuantity}
          />
        </div>

        <div className="order-1 lg:order-2">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-xs tracking-[0.35em] uppercase text-[#C5A55A]">
                {flow === "gift" ? "Đặt hàng quà tặng" : "Thông tin nghi lễ"}
              </p>
              <span
                className={`px-2.5 py-0.5 text-[10px] tracking-wider uppercase border ${
                  flow === "gift"
                    ? "border-[#C5A55A]/30 text-[#C5A55A] bg-[#C5A55A]/5"
                    : "border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5"
                }`}
              >
                {flow === "gift" ? "Quà tặng" : "Nghi lễ"}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-light text-[#F5E6C8] font-display">
              {flow === "gift" ? "Thông tin giao hàng" : "Hoàn tất nghi lễ hoa"}
            </h2>

            {isReturningCustomer && (
              <div className="mt-3 px-3 py-2 border border-[#D4AF37]/20 bg-[#D4AF37]/5">
                <p className="text-xs text-[#D4AF37]">
                  Chào mừng bạn quay lại! Thông tin đã được điền tự động.
                  {flow === "ritual" &&
                    " Tên người gửi và người nhận đã được khóa theo nghi lễ."}
                </p>
              </div>
            )}

            {flow === "ritual" &&
              (ritualType || offering || permanenceType) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {ritualType && (
                    <span className="px-3 py-1 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] tracking-wider">
                      {ritualType}
                    </span>
                  )}
                  {offering && (
                    <span className="px-3 py-1 text-xs bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#C5A55A] tracking-wider">
                      {offering}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-xs border tracking-wider ${
                      permanenceType === "permanent"
                        ? "bg-[#D4AF37]/20 border-[#D4AF37]/40 text-[#D4AF37]"
                        : "bg-[#D4AF37]/10 border-[#D4AF37]/20 text-[#8A7D65]"
                    }`}
                  >
                    {permanenceType === "permanent"
                      ? "Thiên Niên"
                      : "Duyên Khởi"}
                  </span>
                </div>
              )}
          </div>

          <div className="space-y-5">
            <FormInput
              id="sender-name"
              label="Tên người gửi"
              icon={User}
              placeholder="Nhập họ và tên của bạn..."
              value={formData.senderName}
              onChange={updateField("senderName")}
              error={errors.senderName}
              disabled={flow === "ritual" && senderLocked}
              hint={
                flow === "ritual" && senderLocked
                  ? "Tên người gửi được khóa theo nghi lễ trước đó"
                  : undefined
              }
            />
            <FormInput
              id="phone"
              label="Số điện thoại của bạn"
              icon={Phone}
              type="tel"
              placeholder="0xxx xxx xxx"
              value={formData.phone}
              onChange={updateField("phone")}
              error={errors.phone}
              hint={lookupLoading ? "Đang tìm thông tin..." : undefined}
            />
            <FormInput
              id="receiver-name"
              label="Tên người nhận"
              icon={Heart}
              placeholder="Nhập tên người bạn yêu thương..."
              value={formData.receiverName}
              onChange={updateField("receiverName")}
              error={errors.receiverName}
              disabled={flow === "ritual" && receiverLocked}
              hint={
                flow === "ritual" && receiverLocked
                  ? "Tên người nhận được khóa theo nghi lễ trước đó"
                  : undefined
              }
            />

            {flow === "gift" && (
              <>
                <FormInput
                  id="receiver-phone"
                  label="SĐT người nhận"
                  icon={Phone}
                  type="tel"
                  placeholder="Số điện thoại người nhận hàng..."
                  value={formData.receiverPhone}
                  onChange={updateField("receiverPhone")}
                  error={errors.receiverPhone}
                />
                <FormInput
                  id="receiver-address"
                  label="Địa chỉ giao hàng"
                  icon={MapPin}
                  placeholder="Nhập địa chỉ giao hàng đầy đủ..."
                  value={formData.receiverAddress}
                  onChange={updateField("receiverAddress")}
                  error={errors.receiverAddress}
                />
              </>
            )}

            {flow === "ritual" && (
              <>
                <FormInput
                  id="receiver-phone"
                  label="SĐT người nhận (tuỳ chọn)"
                  icon={Phone}
                  type="tel"
                  placeholder="Số điện thoại người nhận..."
                  value={formData.receiverPhone}
                  onChange={updateField("receiverPhone")}
                  error={errors.receiverPhone}
                />
                <FormInput
                  id="receiver-address"
                  label="Địa chỉ giao hàng (tuỳ chọn)"
                  icon={MapPin}
                  placeholder="Nhập địa chỉ giao hàng..."
                  value={formData.receiverAddress}
                  onChange={updateField("receiverAddress")}
                  error={errors.receiverAddress}
                />
              </>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="message"
                  className="flex items-center gap-2 text-sm text-[#C5A55A] tracking-wide"
                >
                  <PenLine className="h-4 w-4" />
                  Lời nhắn
                </label>
                <button
                  onClick={handleAISuggest}
                  disabled={generatingMessage}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="h-3 w-3" />
                  {generatingMessage ? "Đang viết..." : "AI Suggest Message"}
                </button>
              </div>
              <div className="border border-[#D4AF37]/20 bg-[#0d0b09] p-1">
                <div className="letter-paper">
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => updateField("message")(e.target.value)}
                    placeholder="Gửi người tôi yêu thương nhất..."
                    rows={5}
                    className="w-full bg-transparent px-3 py-2 text-[#F5E6C8] placeholder:text-[#555040] resize-none focus:outline-none italic leading-8 font-serif text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <label className="mt-6 flex items-center gap-3 cursor-pointer group">
            <div
              className={`h-5 w-5 flex-shrink-0 border transition-all duration-300 flex items-center justify-center ${
                publicVow
                  ? "border-[#D4AF37] bg-[#D4AF37]"
                  : "border-[#D4AF37]/40 group-hover:border-[#D4AF37]/60"
              }`}
            >
              {publicVow && (
                <svg
                  className="h-3 w-3 text-[#0a0a08]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            <input
              type="checkbox"
              checked={publicVow}
              onChange={(e) => setPublicVow(e.target.checked)}
              className="sr-only"
            />
            <span className="text-sm text-[#C5A55A]/80">
              Cho phép hiển thị lời thề trên trang &ldquo;Những Lời Thề&rdquo;
            </span>
          </label>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`mt-6 w-full py-4 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-500 cursor-pointer ${
              canSubmit
                ? "bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
                : "bg-[#1a1814] text-[#555040] cursor-not-allowed border border-[#2a2520]"
            }`}
          >
            {flow === "gift" ? "Xác nhận đặt hàng" : "Xác nhận & Thanh toán"}
          </button>

          {!canSubmit && (
            <p className="mt-3 text-center text-sm text-[#6B5F4A]">
              Vui lòng điền đầy đủ tất cả các trường để tiếp tục
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
