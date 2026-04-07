"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { FadeInSection, GoldDivider } from "@/components/shared-ui";

// Định nghĩa interface để đồng bộ với API
interface Vow {
  sender_name: string;
  receiver_name: string;
  message: string;
  created_at: string;
  public_vow?: boolean;
}

export default function ChosenMomentsPage() {
  const router = useRouter();
  const [vows, setVows] = useState<Vow[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Logic lấy dữ liệu từ Database (giống LiveVowFeed)
  useEffect(() => {
    async function loadVows() {
      try {
        const res = await fetch("/api/vows");
        const json = await res.json();
        if (json.success && json.vows && json.vows.length > 0) {
          setVows(json.vows);
        }
      } catch (error) {
        console.error("Không thể tải lời thề:", error);
      } finally {
        setLoading(false);
      }
    }
    loadVows();
  }, []);

  return (
    <main className="min-h-screen bg-black text-foreground selection:bg-[#D4AF37]/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 text-center px-6 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.05) 0%, transparent 70%)",
          }}
        />
        <FadeInSection>
          <p className="text-xs tracking-[0.4em] uppercase mb-6 text-gold">
            Khoảnh khắc đã chọn
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance text-foreground">
            Những Lời Thề Đã Được Trao
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-muted-foreground">
            Không phải ai cũng chọn. Nhưng những người đã chọn — họ không bao
            giờ quay lại.
          </p>
          <GoldDivider className="mt-12 opacity-50" />
        </FadeInSection>
      </section>

      {/* Commitment Grid */}
      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            // Hiệu ứng Loading đơn giản
            <div className="text-center py-20 text-muted-foreground/50 tracking-widest uppercase text-xs animate-pulse">
              Đang kết nối với dòng thời gian...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
              {vows.map((item, i) => (
                <FadeInSection key={i} delay={i * 100}>
                  <div
                    className="group relative p-6 md:p-8 border border-gold/10 bg-[#0A0A08] transition-all duration-700 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] h-full flex flex-col justify-between"
                    style={{
                      boxShadow: "inset 0 0 20px rgba(212,175,55,0.02)",
                    }}
                  >
                    <div>
                      <div className="relative mb-4 md:mb-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base md:text-lg font-display font-medium text-foreground">
                            {item.sender_name}
                          </span>
                          <Heart
                            className="h-3 w-3 md:h-3.5 md:w-3.5 flex-shrink-0"
                            style={{
                              color: "#D4AF37",
                              fill: "#D4AF37",
                              opacity: 0.5,
                            }}
                          />
                          <span className="text-base md:text-lg font-display font-medium text-foreground">
                            {item.receiver_name}
                          </span>
                        </div>
                        <span className="text-[10px] tracking-wider text-muted-foreground/50 mt-1 block">
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>

                      <p className="text-sm md:text-base leading-relaxed italic font-display text-muted-foreground group-hover:text-gold transition-colors duration-500">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </div>

                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-gold/20 group-hover:border-gold/40 transition-colors duration-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-gold/20 group-hover:border-gold/40 transition-colors duration-500" />
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}

          {!loading && vows.length === 0 && (
            <div className="text-center py-20 text-muted-foreground italic">
              Chưa có lời thề nào được công khai. Hãy là người đầu tiên.
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-32 px-6 text-center">
        <FadeInSection>
          <GoldDivider className="mb-16 opacity-30" />
          <p className="text-xl md:text-2xl font-display italic text-gold mb-12">
            "Mỗi lời thề là một quyết định không thể thay đổi."
          </p>
        </FadeInSection>
      </section>
    </main>
  );
}
