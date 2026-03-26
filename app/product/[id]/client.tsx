"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Gift, Shield, Lock, ShoppingBag, Zap, CheckCircle } from "lucide-react";
import { products as fallbackProducts, formatPrice } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  description?: string;
  category?: string;
  product_type?: "gift" | "ritual";
  extra_images?: string[];
  description_images?: string[];
}

export function ProductPageClient({ productId }: { productId: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

  function setProductContext() {
    if (!product) return;
    localStorage.setItem("ntt_selected_product", product.id);
  }

  function handleBuyNow() {
    if (!product) return;
    setProductContext();
    const isRitual = product.product_type === "ritual" || product.category?.toLowerCase() === "ritual";
    if (isRitual) {
      localStorage.setItem("ntt_flow", "ritual");
      router.push(`/nghi-thuc?product_id=${product.id}`);
    } else {
      localStorage.setItem("ntt_flow", "gift");
      const ritualKeys = ["ntt_ritual_step", "ntt_ritual_type", "ntt_offering", "ntt_moment"];
      ritualKeys.forEach((key) => localStorage.removeItem(key));
      router.push("/checkout?flow=gift");
    }
  }

  function handleAddToCart() {
    if (!product) return;
    setProductContext();
    const isRitual = product.product_type === "ritual" || product.category?.toLowerCase() === "ritual";

    if (isRitual) {
      localStorage.setItem("ntt_flow", "ritual");
      router.push(`/nghi-thuc?product_id=${product.id}`);
    } else {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image_url || product.image || "/images/product-1.jpg",
        images: [product.image_url || product.image || "/images/product-1.jpg"],
        description: product.description || "",
        category: product.category || "gift",
        product_type: product.product_type || "gift",
      };
      addToCart(cartProduct as any, "");
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2500);
    }
  }

  if (loading)
    return (
      <main className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="w-6 h-6 border border-gold border-t-transparent rounded-full animate-spin" />
      </main>
    );

  if (!product) return null;

  const isRitualProduct =
    product.product_type === "ritual" ||
    product.category?.toLowerCase() === "ritual";

  const imageUrl = product.image_url || product.image || "/images/product-1.jpg";
  const allGalleryImages = [imageUrl, ...(product.extra_images || [])];
  const displayImage = selectedImage || imageUrl;

  return (
    <main className="min-h-screen bg-background pt-24 px-6 pb-32">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] text-muted-foreground hover:text-gold transition-all mb-12 tracking-[0.3em] uppercase group"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Nhất Tâm Hoa Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <Image
                src={displayImage}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-300"
                priority
              />
              {isRitualProduct && (
                <div className="absolute top-0 left-0 w-full h-full border-[12px] border-gold/10 pointer-events-none" />
              )}
              <div className="absolute top-4 left-4">
                <span className={`text-[9px] px-2.5 py-1 uppercase tracking-widest font-medium ${
                  isRitualProduct
                    ? "bg-gold text-primary-foreground"
                    : "bg-black/10 dark:bg-white/10 backdrop-blur-sm text-foreground border border-border"
                }`}>
                  {isRitualProduct ? "Ritual" : "Gift"}
                </span>
              </div>
            </div>

            {allGalleryImages.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {allGalleryImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(url)}
                    className={`relative w-16 h-16 overflow-hidden border-2 transition-all flex-shrink-0 ${
                      displayImage === url
                        ? "border-gold"
                        : "border-border hover:border-gold/40"
                    }`}
                  >
                    <Image
                      src={url}
                      alt={`Ảnh ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {product.description && (
              <div className="border border-border bg-card p-5">
                <p className="text-[10px] text-gold uppercase tracking-widest mb-2">Mô tả sản phẩm</p>
                <p className="text-muted-foreground font-light leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {product.description_images && product.description_images.length > 0 && (
              <div className="space-y-3">
                {product.description_images.map((url, idx) => (
                  <div key={idx} className="relative w-full overflow-hidden bg-secondary">
                    <Image
                      src={url}
                      alt={`Chi tiết ${idx + 1}`}
                      width={900}
                      height={600}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Đóng gói", value: "Hộp quà Luxury & Thiệp tay" },
                { label: "Bảo quản", value: "Lưu giữ từ 3 - 5 năm" },
                { label: "Giao hàng", value: "Hỏa tốc 2H nội thành" },
                { label: "Chứng nhận", value: isRitualProduct ? "Blockchain Polygon" : "Xác thực NTH" },
              ].map((item, i) => (
                <div key={i} className="border border-border bg-card p-4">
                  <p className="text-[9px] uppercase text-muted-foreground tracking-widest mb-1">{item.label}</p>
                  <p className="text-[11px] text-foreground/80">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pb-4 hidden lg:block">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="h-[1px] w-8 bg-gold/50" />
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold">
                  {isRitualProduct ? "Ritual Signature" : "Gift Collection"}
                </p>
              </div>
              <h1 className="text-3xl md:text-4xl font-light text-foreground font-display mb-4 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-2xl text-gold font-light">
                {formatPrice(product.price)}
              </p>
            </div>

            {isRitualProduct && (
              <div className="p-4 border border-gold/20 bg-gold/5 mb-6">
                <div className="flex gap-3 items-start">
                  <Lock className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gold text-[11px] font-bold uppercase tracking-wider mb-1">
                      Đặc quyền cam kết trọn đời
                    </p>
                    <p className="text-muted-foreground text-[10px] leading-relaxed">
                      Sản phẩm này đi kèm Chứng thư Blockchain và chỉ được
                      phép gửi tặng cho duy nhất một người trong đời.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {isRitualProduct ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 flex items-center justify-center gap-3 bg-gold text-primary-foreground font-bold tracking-[0.25em] uppercase text-xs transition-all hover:opacity-90"
                  >
                    <Shield className="h-4 w-4" />
                    Bắt đầu nghi lễ cam kết
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase pt-1">
                    Mỗi bông hoa — Một người — Trọn đời
                  </p>
                </>
              ) : (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 flex items-center justify-center gap-3 bg-gold text-primary-foreground font-bold tracking-[0.25em] uppercase text-xs transition-all hover:opacity-90"
                  >
                    <Zap className="h-4 w-4" />
                    Mua ngay
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className={`w-full py-4 flex items-center justify-center gap-3 font-medium tracking-[0.2em] uppercase text-xs transition-all border ${
                      addedToCart
                        ? "border-green-500/60 text-green-500 bg-green-500/10"
                        : "border-gold/40 text-gold hover:bg-gold/10 hover:border-gold/60"
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Đã thêm vào giỏ hàng
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="h-4 w-4" />
                        Thêm vào giỏ hàng
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground tracking-widest uppercase pt-1">
                    Giao hỏa tốc 2H nội thành
                  </p>
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-2.5">
              {[
                isRitualProduct
                  ? "Chứng thư vĩnh cửu trên Blockchain Polygon"
                  : "Đảm bảo chất lượng cao cấp",
                "Giao hàng an toàn — Đóng gói luxury",
                "Hỗ trợ 24/7 qua hotline & Zalo",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="h-1 w-1 rounded-full bg-gold/60 flex-shrink-0" />
                  <span className="text-[10px] text-muted-foreground tracking-wide">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:hidden">
            <h1 className="text-2xl font-light text-foreground font-display mb-2 tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xl text-gold font-light mb-4">
              {formatPrice(product.price)}
            </p>
            {isRitualProduct && (
              <div className="p-3 border border-gold/20 bg-gold/5 mb-4">
                <div className="flex gap-2 items-start">
                  <Lock className="h-3.5 w-3.5 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground text-[10px] leading-relaxed">
                    Chứng thư Blockchain — chỉ tặng cho duy nhất một người trong đời.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border px-4 py-3 lg:hidden">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {isRitualProduct ? (
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3.5 flex items-center justify-center gap-2 bg-gold text-primary-foreground font-bold tracking-[0.2em] uppercase text-xs transition-all hover:opacity-90"
            >
              <Shield className="h-4 w-4" />
              Bắt đầu nghi lễ
            </button>
          ) : (
            <>
              <button
                onClick={handleAddToCart}
                className={`py-3.5 px-5 flex items-center justify-center gap-2 border transition-all text-xs uppercase tracking-wider ${
                  addedToCart
                    ? "border-green-500/60 text-green-500"
                    : "border-gold/40 text-gold"
                }`}
              >
                {addedToCart ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <ShoppingBag className="h-4 w-4" />
                )}
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3.5 flex items-center justify-center gap-2 bg-gold text-primary-foreground font-bold tracking-[0.2em] uppercase text-xs transition-all hover:opacity-90"
              >
                <Zap className="h-4 w-4" />
                Mua ngay
              </button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
