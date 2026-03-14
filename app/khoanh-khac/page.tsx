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
    <main className="min-h-screen bg-black text-[#F5E6C8] selection:bg-[#D4AF37]/30">
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
          <p className="text-xs tracking-[0.4em] uppercase mb-6 text-[#C5A55A]">
            Khoảnh khắc đã chọn
          </p>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light leading-tight font-display text-balance text-[#F5E6C8]">
            Những Lời Thề Đã Được Trao
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg md:text-xl leading-relaxed text-[#8A7D65]">
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
            <div className="text-center py-20 text-[#555040] tracking-widest uppercase text-xs animate-pulse">
              Đang kết nối với dòng thời gian...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vows.map((item, i) => (
                <FadeInSection key={i} delay={i * 100}>
                  <div
                    className="group relative p-8 border border-[#D4AF37]/10 bg-[#0A0A08] transition-all duration-700 hover:border-[#D4AF37]/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)] h-full flex flex-col justify-between"
                    style={{
                      boxShadow: "inset 0 0 20px rgba(212,175,55,0.02)",
                    }}
                  >
                    <div>
                      {/* Top: names and date */}
                      <div className="relative flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-display font-medium text-[#F5E6C8]">
                            {item.sender_name}
                          </span>
                          <Heart
                            className="h-3.5 w-3.5 flex-shrink-0"
                            style={{
                              color: "#D4AF37",
                              fill: "#D4AF37",
                              opacity: 0.5,
                            }}
                          />
                          <span className="text-lg font-display font-medium text-[#F5E6C8]">
                            {item.receiver_name}
                          </span>
                        </div>
                        <span className="text-[10px] tracking-wider text-[#555040]">
                          {new Date(item.created_at).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>

                      {/* Vow Text */}
                      <p className="text-base leading-relaxed italic font-display text-[#8A7D65] group-hover:text-[#C5A55A] transition-colors duration-500">
                        &ldquo;{item.message}&rdquo;
                      </p>
                    </div>

                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors duration-500" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#D4AF37]/20 group-hover:border-[#D4AF37]/40 transition-colors duration-500" />
                  </div>
                </FadeInSection>
              ))}
            </div>
          )}

          {!loading && vows.length === 0 && (
            <div className="text-center py-20 text-[#8A7D65] italic">
              Chưa có lời thề nào được công khai. Hãy là người đầu tiên.
            </div>
          )}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="pb-32 px-6 text-center">
        <FadeInSection>
          <GoldDivider className="mb-16 opacity-30" />
          <p className="text-xl md:text-2xl font-display italic text-[#C5A55A] mb-12">
            "Mỗi lời thề là một quyết định không thể thay đổi."
          </p>
        </FadeInSection>
      </section>
    </main>
  );
}
