import Link from "next/link";

const footerLinks = {
  "Nghi thức": [
    { href: "/khoanh-khac", label: "Khoảnh Khắc Đã Chọn" },
  ],
  "Khám phá": [
    { href: "/ve-chung-toi", label: "Về Nhất Tâm Hoa" },
    { href: "/nghe-thuat-bao-ton", label: "Nghệ Thuật Bảo Tồn" },
    { href: "/hoi-dap", label: "Câu Hỏi Thường Gặp" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="group">
              <h3 className="text-2xl font-semibold tracking-wider text-foreground group-hover:text-gold transition-colors">
                Nhất Tâm Hoa
              </h3>
              <p className="mt-1 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                Eternal Roses
              </p>
            </Link>
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground text-center md:text-left">
              Mỗi bông hồng là một lời hứa. Mỗi lời hứa là một đời. Nhất Tâm Hoa
              - dành cho những tình yêu vĩnh cửu.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div
              key={category}
              className="flex flex-col items-center md:items-start"
            >
              <p className="text-xs tracking-[0.3em] uppercase mb-5 text-gold-dim">
                {category}
              </p>
              <div className="flex flex-col gap-3 items-center md:items-start">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-border/20 flex flex-col items-center gap-6">
          <div
            className="h-px w-16"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }}
          />
          <p className="text-xs text-muted-foreground">
            {"2026 Nhất Tâm Hoa. Tất cả quyền được bảo lưu."}
          </p>
        </div>
      </div>
    </footer>
  );
}
