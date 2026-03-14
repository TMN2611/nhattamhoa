"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gift, Shield, Lock } from "lucide-react";
import { products as fallbackProducts, formatPrice } from "@/lib/products";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  description?: string;
  category?: string;
  product_type?: "gift" | "ritual";
}

export function ProductPageClient({ productId }: { productId: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        if (data.success && data.product) {
          setProduct(data.product);
        } else {
          const fallback = fallbackProducts.find((p) => p.id === productId);
          if (fallback) {
            setProduct({ ...fallback, image_url: fallback.image } as Product);
          }
        }
      } catch {
        const fallback = fallbackProducts.find((p) => p.id === productId);
        if (fallback) {
          setProduct({ ...fallback, image_url: fallback.image } as Product);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  function handleGiftCheckout() {
    if (!product) return;
    localStorage.setItem("ntt_selected_product", product.id);
    localStorage.setItem("ntt_flow", "gift");
    // Xóa sạch các dấu vết của nghi lễ nếu đang ở luồng tặng quà
    const ritualKeys = [
      "ntt_ritual_step",
      "ntt_ritual_type",
      "ntt_offering",
      "ntt_moment",
    ];
    ritualKeys.forEach((key) => localStorage.removeItem(key));
    router.push("/checkout?flow=gift");
  }

  function handleBeginRitual() {
    if (!product) return;
    localStorage.setItem("ntt_selected_product", product.id);
    localStorage.setItem("ntt_flow", "ritual");
    // Chuyển hướng thẳng tới trang bắt đầu nghi lễ (cam kết)
    router.push(`/nghi-thuc?product_id=${product.id}`);
  }

  if (loading)
    return (
      <main className="min-h-screen bg-[#0a0a08] pt-24 flex items-center justify-center">
        <div className="w-6 h-6 border border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </main>
    );

  if (!product) return null;

  // KIỂM TRA LOẠI SẢN PHẨM ĐỂ HIỂN THỊ UI TƯƠNG ỨNG
  const isRitualProduct =
    product.product_type === "ritual" ||
    product.category?.toLowerCase() === "ritual";

  return (
    <main className="min-h-screen bg-[#0a0a08] pt-24 px-6 pb-20">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] text-[#8A7D65] hover:text-[#D4AF37] transition-all mb-12 tracking-[0.3em] uppercase group"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Nhất Tâm Hoa Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Cột Hình Ảnh */}
          <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
            <Image
              src={
                product.image_url || product.image || "/images/product-1.jpg"
              }
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
            {isRitualProduct && (
              <div className="absolute top-0 left-0 w-full h-full border-[12px] border-[#D4AF37]/10 pointer-events-none" />
            )}
          </div>

          {/* Cột Thông Tin */}
          <div className="lg:sticky lg:top-24">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-8 bg-[#D4AF37]/50" />
                <p className="text-[10px] tracking-[0.4em] uppercase text-[#D4AF37]">
                  {isRitualProduct ? "Ritual Signature" : "Gift Collection"}
                </p>
              </div>
              <h1 className="text-4xl md:text-5xl font-light text-[#F5E6C8] font-display mb-4 tracking-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-[#C5A55A] font-light">
                {formatPrice(product.price)}
              </p>
            </div>

            <div className="prose prose-invert mb-12">
              <p className="text-[#8A7D65] font-light leading-relaxed text-sm tracking-wide">
                {product.description}
              </p>
            </div>

            {/* PHẦN ĐIỀU HƯỚNG NÚT BẤM RIÊNG BIỆT */}
            <div className="space-y-6">
              {isRitualProduct ? (
                /* GIAO DIỆN CHO SẢN PHẨM NGHI LỄ */
                <div className="space-y-4">
                  <div className="p-4 border border-[#D4AF37]/20 bg-[#D4AF37]/5 mb-6">
                    <div className="flex gap-3 items-start">
                      <Lock className="h-4 w-4 text-[#D4AF37] mt-1" />
                      <div>
                        <p className="text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider mb-1">
                          Đặc quyền cam kết
                        </p>
                        <p className="text-[#8A7D65] text-[10px] leading-relaxed">
                          Sản phẩm này đi kèm Chứng thư Blockchain và chỉ được
                          phép gửi tặng cho duy nhất một người trong đời.
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleBeginRitual}
                    className="w-full py-5 flex items-center justify-center gap-3 bg-[#D4AF37] text-black font-bold tracking-[0.3em] uppercase text-xs transition-all hover:bg-[#B8860B]"
                  >
                    <Shield className="h-4 w-4" />
                    Thực hiện nghi lễ cam kết
                  </button>
                </div>
              ) : (
                /* GIAO DIỆN CHO SẢN PHẨM QUÀ TẶNG THÔNG THƯỜNG */
                <div className="space-y-4">
                  <button
                    onClick={handleGiftCheckout}
                    className="w-full py-5 flex items-center justify-center gap-3 bg-white text-black font-bold tracking-[0.3em] uppercase text-xs transition-all hover:bg-[#F5E6C8]"
                  >
                    <Gift className="h-4 w-4" />
                    Đặt mua ngay
                  </button>
                  <p className="text-center text-[10px] text-[#555] tracking-widest uppercase">
                    Thanh toán nhanh — Giao hỏa tốc 2H
                  </p>
                </div>
              )}
            </div>

            {/* DỊCH VỤ ĐI KÈM */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-white/5 pt-8">
              <div className="space-y-1">
                <p className="text-[9px] uppercase text-[#555] tracking-widest">
                  Đóng gói
                </p>
                <p className="text-[10px] text-[#8A7D65]">
                  Hộp quà Luxury & Thiệp tay
                </p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-[9px] uppercase text-[#555] tracking-widest">
                  Bảo quản
                </p>
                <p className="text-[10px] text-[#8A7D65]">
                  Lưu giữ từ 3 - 5 năm
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
