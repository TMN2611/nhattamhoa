"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products as fallbackProducts, formatPrice } from "@/lib/products";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  description?: string;
  category?: string;
  product_type?: "gift" | "ritual"; // Thêm trường này vào interface
}

interface ProductGridProps {
  flow?: "gift" | "ritual";
}

export function ProductGrid({ flow = "gift" }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();

        if (data.success && data.products?.length > 0) {
          // Lọc sản phẩm theo flow ngay khi load
          const filtered = data.products.filter((p: Product) => {
            // Nếu sản phẩm không có product_type, mặc định coi là gift
            const type = p.product_type || "gift";
            return type === flow;
          });
          setProducts(filtered);
        } else {
          // Xử lý dữ liệu mẫu nếu không có data từ server
          const mockFiltered = fallbackProducts
            .map((p) => ({ ...p, image_url: p.image }))
            .filter((p) => (p as any).product_type === flow);
          setProducts(mockFiltered);
        }
      } catch {
        setProducts(
          fallbackProducts.map((p) => ({ ...p, image_url: p.image })),
        );
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [flow]); // Re-run khi flow thay đổi

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="aspect-[4/5] bg-[#1a1814] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  function getProductHref(product: Product) {
    return `/product/${product.id}?flow=${flow}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24 md:pb-32">
      {/* Thông báo nếu không có sản phẩm trong bộ sưu tập này */}
      {products.length === 0 ? (
        <div className="text-center py-20 border border-gold/10 bg-secondary/5">
          <p className="text-gold-dim font-light tracking-widest uppercase text-sm">
            Hiện chưa có tác phẩm nào trong bộ sưu tập{" "}
            {flow === "ritual" ? "Nghi Lễ" : "Quà Tặng"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <Link
              key={product.id}
              href={getProductHref(product)}
              className="group block"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                <Image
                  src={
                    product.image_url ||
                    product.image ||
                    "/images/product-1.jpg"
                  }
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Overlay tinh tế */}
                <div className="absolute inset-0 bg-background/0 group-hover:bg-black/20 transition-colors duration-500" />

                {/* Badge phân loại */}
                <div
                  className={`absolute top-3 right-3 px-2.5 py-1 text-[10px] tracking-[0.2em] uppercase font-medium shadow-sm ${
                    flow === "ritual"
                      ? "bg-[#D4AF37] text-[#0a0a08]"
                      : "bg-black/60 text-white backdrop-blur-md border border-white/10"
                  }`}
                >
                  {flow === "ritual" ? "Ritual Collection" : "Gift Collection"}
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="text-lg font-medium text-foreground group-hover:text-gold transition-colors duration-300">
                  {product.name}
                </h3>
                <span className="text-sm text-gold-dim tracking-wide">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Mô tả ngắn (optional) */}
              {product.category && (
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                  {product.category}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
