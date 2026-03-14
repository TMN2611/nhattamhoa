export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  description: string;
  category: string; // Để linh hoạt với dữ liệu "Lồng Kính", "Hộp Quà" từ DB
  tagline?: string;
  is_ritual?: boolean;
  product_type: string; // Bắt buộc phải có nếu interface yêu cầu
}

export const products: Product[] = [
  {
    id: "hoa-vinh-cuu-do",
    name: "Hồng Đỏ Vĩnh Cửu",
    price: 2500000,
    image: "/images/product-1.jpg",
    images: ["/images/product-1.jpg", "/images/rose-detail.jpg"],
    description:
      "Một bông hồng đỏ thắm được bảo tồn vĩnh viễn trong hộp nhung đen sang trọng.",
    category: "ritual",
    tagline: "Lưu giữ tinh giản",
    is_ritual: true,
    product_type: "ritual", // Bổ sung trường này
  },
  {
    id: "hoa-dome-hong",
    name: "Hồng Hồng Trong Lồng Kính",
    price: 3200000,
    image: "/images/product-2.jpg",
    images: ["/images/product-2.jpg", "/images/rose-detail.jpg"],
    description: "Bông hồng hồng pastel được bảo tồn trong lồng kính pha lê.",
    category: "ritual",
    tagline: "Lưu giữ vĩnh cửu",
    is_ritual: true,
    product_type: "ritual", // Bổ sung trường này
  },
  {
    id: "hop-hong-trang",
    name: "Hộp Hồng Trắng Tinh Khôi",
    price: 4800000,
    image: "/images/product-3.jpg",
    images: ["/images/product-3.jpg", "/images/rose-detail.jpg"],
    description: "Bộ sưu tập hồng trắng bất tử trong hộp quà đen matte.",
    category: "gift",
    product_type: "gift", // Bổ sung trường này
  },
  {
    id: "hoa-trai-tim",
    name: "Hồng Nhung Trái Tim",
    price: 3500000,
    image: "/images/product-4.jpg",
    images: ["/images/product-4.jpg", "/images/rose-detail.jpg"],
    description: "Hồng nhung burgundy trong hộp trái tim nhung đen.",
    category: "ritual",
    tagline: "Lưu giữ cổ điển",
    is_ritual: true,
    product_type: "ritual", // Bổ sung trường này
  },
  {
    id: "bo-suu-tap-hoang-gia",
    name: "Bộ Sưu Tập Hoàng Gia",
    price: 8500000,
    image: "/images/product-5.jpg",
    images: ["/images/product-5.jpg", "/images/rose-detail.jpg"],
    description: "Bộ sưu tập hồng vàng và đỏ phối hợp trong hộp vuông luxury.",
    category: "gift",
    product_type: "gift", // Bổ sung trường này
  },
];

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(price);
}

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}
