"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Shield } from "lucide-react";
import { FadeInSection, GoldDivider, PageHero } from "@/components/shared-ui";

const commitments = [
  {
    id: "permanent",
    label: "Tôi hiểu rằng lựa chọn này mang ý nghĩa vĩnh viễn",
    description: "Lời thề Nhất Tâm không thể rút lại hay thay đổi.",
  },
  {
    id: "not-gift",
    label: "Tôi hiểu rằng đây không chỉ là một món quà",
    description: "Đây là biểu tượng của sự cam kết trọn đời.",
  },
  {
    id: "voluntary",
    label: "Tôi tự nguyện đưa ra quyết định này",
    description: "Không ai ép buộc. Đây là sự lựa chọn từ trái tim.",
  },
];

function RitualPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const allChecked = commitments.every((c) => checked[c.id]);

  useEffect(() => {
    const productIdFromUrl = searchParams.get('product_id');
    if (productIdFromUrl) {
      localStorage.setItem('ntt_selected_product', productIdFromUrl);
    }
  }, [searchParams]);

  function toggleCommitment(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <>
      <PageHero
        pretitle="Nghi thức thiêng liêng"
        title="Nghi Thức Lựa Chọn"
        subtitle="Trước khi tiếp tục, bạn cần hiểu rằng đây không phải một giao dịch thông thường. Đây là một nghi thức cam kết."
      />

      <section className="px-6 pb-12">
        <FadeInSection>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground">
              {"Trong một thế giới mà lời hứa trở nên nhẹ bẫng, "}
              {"Nhất Tâm Hoa yêu cầu bạn dừng lại một nhịp. "}
              {"Hãy tự hỏi mình: người này có xứng đáng với lời thề trọn đời không?"}
            </p>
            <p className="mt-6 text-lg md:text-xl italic font-display text-gold">
              {'"Nếu câu trả lời là có — hãy tiếp tục."'}
            </p>
          </div>
        </FadeInSection>
      </section>

      <section className="px-6 pb-20 md:pb-28">
        <div className="mx-auto max-w-xl flex flex-col gap-5">
          {commitments.map((item, i) => (
            <FadeInSection key={item.id} delay={i * 150}>
              <button
                onClick={() => toggleCommitment(item.id)}
                className={`w-full text-left p-6 border transition-all duration-500 cursor-pointer group ${
                  checked[item.id]
                    ? "border-gold/40 bg-gold/[0.04]"
                    : "border-border bg-card/60 hover:border-gold/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center border transition-all duration-300 ${
                      checked[item.id]
                        ? "bg-gold border-gold"
                        : "border-muted-foreground/50 group-hover:border-gold-dim"
                    }`}
                  >
                    {checked[item.id] && (
                      <Check className="h-4 w-4 text-[#0a0a08]" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-base md:text-lg font-display transition-colors duration-300 ${
                        checked[item.id] ? "text-foreground" : "text-gold"
                      }`}
                    >
                      {item.label}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            </FadeInSection>
          ))}
        </div>

        <FadeInSection delay={500}>
          <div className="mx-auto max-w-xl mt-10">
            <GoldDivider className="mb-10" />

            <button
              onClick={() => router.push("/chon-vat-chung")}
              disabled={!allChecked}
              className={`w-full py-5 flex items-center justify-center gap-3 text-sm tracking-[0.25em] uppercase font-medium transition-all duration-700 cursor-pointer ${
                allChecked
                  ? "bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] text-[#0a0a08] shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                  : "bg-secondary text-muted-foreground/50 cursor-not-allowed border border-border"
              }`}
            >
              <Shield className="h-4 w-4" />
              {"Tiếp tục nghi thức"}
            </button>

            {!allChecked && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                {"Vui lòng xác nhận tất cả cam kết để tiếp tục"}
              </p>
            )}
          </div>
        </FadeInSection>
      </section>
    </>
  );
}

export default function RitualPage() {
  return (
    <Suspense>
      <RitualPageContent />
    </Suspense>
  );
}
