"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, Search } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const navLinks = [
  { href: "/ve-chung-toi", label: "Về chúng tôi" },
  { href: "/nghe-thuat-bao-ton", label: "Bảo tồn" },
  { href: "/ready", label: "Nghi lễ" },
  { href: "/lookup", label: "Tra cứu" },
];

export function SiteHeader() {
  const { itemCount } = useCart();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-[999] 
bg-black lg:bg-background/80 
backdrop-blur-0 lg:backdrop-blur-md 
border-b border-border/50"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="w-24">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-[#D4AF37]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <Link
          href="/"
          className="flex flex-col items-center"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="text-2xl md:text-3xl font-semibold tracking-wider text-foreground">
            Nhất Tâm Hoa
          </span>
          <span className="text-[10px] tracking-[0.3em] text-muted-foreground uppercase mt-0.5">
            Eternal Roses
          </span>
        </Link>

        <div className="flex items-center gap-5 w-24 justify-end">
          <div className="hidden lg:flex items-center gap-6 mr-4">
            {navLinks.slice(2).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${
                  pathname === link.href
                    ? "text-[#D4AF37]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/checkout"
            className="relative text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Giỏ hàng"
          >
            <ShoppingBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </nav>

      <div
        className={`lg:hidden fixed inset-0 top-[65px] z-40 transition-all duration-500 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-background/95 backdrop-blur-lg"
          onClick={() => setMobileMenuOpen(false)}
        />

        <div className="relative z-10 flex flex-col items-center justify-center gap-1 pt-12 px-6">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-4 text-lg tracking-[0.2em] uppercase font-display transition-all duration-500 ${
                pathname === link.href
                  ? "text-[#D4AF37]"
                  : "text-[#C5A55A] hover:text-[#F5E6C8]"
              }`}
              style={{
                transitionDelay: mobileMenuOpen ? `${i * 60}ms` : "0ms",
                opacity: mobileMenuOpen ? 1 : 0,
                transform: mobileMenuOpen
                  ? "translateY(0)"
                  : "translateY(12px)",
              }}
            >
              {link.label}
            </Link>
          ))}

          <div
            className="mt-6 h-px w-20"
            style={{
              background:
                "linear-gradient(90deg, transparent, #D4AF37, transparent)",
              opacity: mobileMenuOpen ? 1 : 0,
              transition: "opacity 600ms",
              transitionDelay: mobileMenuOpen ? "400ms" : "0ms",
            }}
          />

          <Link
            href="/checkout"
            onClick={() => setMobileMenuOpen(false)}
            className="mt-6 text-sm tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            style={{
              opacity: mobileMenuOpen ? 1 : 0,
              transition: "opacity 500ms",
              transitionDelay: mobileMenuOpen ? "450ms" : "0ms",
            }}
          >
            {"Giỏ hàng"}
          </Link>
        </div>
      </div>
    </header>
  );
}
