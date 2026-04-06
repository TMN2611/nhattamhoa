"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { products as fallbackProducts, formatPrice } from "@/lib/products";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

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

interface ProductGridProps {
  flow?: "gift" | "ritual";
}

export function ProductGrid({ flow = "gift" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (data.success && data.products?.length > 0) {
          const filtered = data.products.filter((p: Product) => {
            const type = p.product_type || "gift";
            return type === flow;
          });
          setProducts(filtered);
        } else {
          const mockFiltered = fallbackProducts
            .map((p) => ({ ...p, image_url: p.image }))
            .filter((p) => (p as any).product_type === flow);
          setProducts(mockFiltered);
        }
      } catch {
        setProducts(
          fallbackProducts
            .map((p) => ({ ...p, image_url: p.image }))
            .filter((p) => ((p as any).product_type || "gift") === flow),
        );
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [flow]);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 280;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  function getProductHref(product: Product) {
    return `/product/${product.id}?flow=${flow}`;
  }

  const collectionLabel = flow === "ritual" ? "Ritual Collection" : "Gift Collection";

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      {products.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 bg-secondary/5">
          <p className="text-gold-dim font-light tracking-widest uppercase text-sm">
            Hiện chưa có tác phẩm nào trong bộ sưu tập{" "}
            {flow === "ritual" ? "Nghi Lễ" : "Quà Tặng"}
          </p>
        </div>
      ) : (
        <>
          <div className="md:hidden relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <button onClick={() => scroll("left")} className="p-1.5 border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => scroll("right")} className="p-1.5 border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <Link href={`/collection?flow=${flow}`} className="flex items-center gap-1.5 text-gold text-xs uppercase tracking-wider hover:text-gold/80 transition-colors">
                Xem tất cả <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={getProductHref(product)}
                  className="group block flex-shrink-0 w-[65vw] snap-start"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    <Image
                      src={product.image_url || product.image || "/images/product-1.jpg"}
                      alt={product.name}
                      fill
                      sizes="65vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className={`absolute top-0 right-3 px-2.5 py-0 text-[10px] tracking-[0.1em] uppercase font-medium shadow-sm ${flow === "ritual" ? "bg-[#D4AF37] text-[#0a0a08]" : "bg-black/60 text-white backdrop-blur-md border border-white/10"}`}>
                      {collectionLabel}
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="text-base font-medium text-foreground group-hover:text-gold transition-colors duration-300 truncate mr-2">{product.name}</h3>
                    <span className="text-sm text-gold-dim tracking-wide whitespace-nowrap">{formatPrice(product.price)}</span>
                  </div>
                  {product.category && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{product.category}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={getProductHref(product)}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    <Image
                      src={product.image_url || product.image || "/images/product-1.jpg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 1200px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className={`absolute top-0 right-3 px-2.5 py-0 text-[10px] tracking-[0.1em] uppercase font-medium shadow-sm ${flow === "ritual" ? "bg-[#D4AF37] text-[#0a0a08]" : "bg-black/60 text-white backdrop-blur-md border border-white/10"}`}>
                      {collectionLabel}
                    </div>
                  </div>
                  <div className="mt-4 flex items-baseline justify-between">
                    <h3 className="text-lg font-medium text-foreground group-hover:text-gold transition-colors duration-300">{product.name}</h3>
                    <span className="text-sm text-gold-dim tracking-wide">{formatPrice(product.price)}</span>
                  </div>
                  {product.category && (
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{product.category}</p>
                  )}
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href={`/collection?flow=${flow}`} className="inline-flex items-center gap-2 px-6 py-3 border border-gold/30 text-gold text-sm uppercase tracking-wider hover:bg-gold/10 transition-colors">
                Xem tất cả bộ sưu tập <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
