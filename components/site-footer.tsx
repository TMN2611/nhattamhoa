export function SiteFooter() {
  return (
    <footer className="border-t border-border/30 bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-8 text-center">
          <div>
            <h3 className="text-2xl font-semibold tracking-wider text-foreground">
              Nhất Tâm Hoa
            </h3>
            <p className="mt-1 text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
              Eternal Roses
            </p>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Mỗi bông hồng là một lời hứa. Mỗi lời hứa là một đời.
            Nhất Tâm Hoa - dành cho những tình yêu vĩnh cửu.
          </p>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-gold transition-colors">Instagram</a>
            <a href="#" className="hover:text-gold transition-colors">Facebook</a>
            <a href="#" className="hover:text-gold transition-colors">Liên hệ</a>
          </div>
          <div className="w-16 h-px bg-border" />
          <p className="text-xs text-muted-foreground">
            {'2026 Nhất Tâm Hoa. Tất cả quyền được bảo lưu.'}
          </p>
        </div>
      </div>
    </footer>
  )
}
