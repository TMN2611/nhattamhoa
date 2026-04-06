"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/products";
import { Suspense } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  category?: string;
  product_type?: "gift" | "ritual";
}

function CollectionContent() {
  const searchParams = useSearchParams();
  const flow = (searchParams.get("flow") as "gift" | "ritual") || "gift";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && data.products?.length > 0) {
          setProducts(data.products.filter((p: Product) => (p.product_type || "gift") === flow));
        }
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, [flow]);

  const title = flow === "ritual" ? "Bộ sưu tập nghi lễ cam kết" : "Bộ sưu tập quà tặng";
  const subtitle = flow === "ritual"
    ? "Nơi những lời thề được ghi nhận — và những cam kết được tôn vinh."
    : "Những đóa hồng vĩnh cửu — món quà mang theo lời hứa không phai.";
  const collectionLabel = flow === "ritual" ? "Ritual Collection" : "Gift Collection";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gold text-sm mb-8 hover:text-gold/80 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>

        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">{collectionLabel}</p>
          <h1 className="text-3xl md:text-5xl font-light text-foreground font-display">{title}</h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">{subtitle}</p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <div className="flex justify-center gap-4 mb-10">
          <Link
            href="/collection?flow=gift"
            className={`px-5 py-2.5 text-sm uppercase tracking-wider transition-all ${flow === "gift" ? "bg-gold/20 text-gold border border-gold/40" : "text-muted-foreground border border-gold/10 hover:border-gold/30"}`}
          >
            Gift Collection
          </Link>
          <Link
            href="/collection?flow=ritual"
            className={`px-5 py-2.5 text-sm uppercase tracking-wider transition-all ${flow === "ritual" ? "bg-gold/20 text-gold border border-gold/40" : "text-muted-foreground border border-gold/10 hover:border-gold/30"}`}
          >
            Ritual Collection
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-secondary animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 border border-gold/10 bg-secondary/5">
            <p className="text-muted-foreground">Hiện chưa có tác phẩm nào trong bộ sưu tập này</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}?flow=${flow}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                  <Image
                    src={product.image_url || product.image || "/images/product-1.jpg"}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
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
        )}
      </div>
    </main>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold animate-spin" /></div>}>
      <CollectionContent />
    </Suspense>
  );
}
