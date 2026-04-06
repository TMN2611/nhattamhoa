"use client";

import { useEffect, useState, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, ArrowRight, Play, X } from "lucide-react";
import Link from "next/link";

interface Review {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  image_url?: string;
  video_url?: string;
  created_at: string;
}

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [videoModal, setVideoModal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reviews?featured=true");
        const data = await res.json();
        if (data.success && data.reviews?.length > 0) {
          setReviews(data.reviews);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    const amount = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-72 h-80 bg-secondary animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <>
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">
              Khách hàng nói gì
            </p>
            <h2 className="text-3xl md:text-4xl font-light text-foreground font-display">
              Đánh giá từ khách hàng
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex gap-2">
              <button onClick={() => scroll("left")} className="p-2 border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => scroll("right")} className="p-2 border border-gold/20 text-gold hover:bg-gold/10 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <Link href="/reviews" className="flex items-center gap-1.5 text-gold text-sm hover:text-gold/80 transition-colors ml-4">
              Xem tất cả <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {reviews.map((review) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-72 md:w-80 border border-gold/15 bg-card p-5 snap-start flex flex-col"
            >
              {review.image_url && (
                <div className="w-full aspect-square mb-2 overflow-hidden bg-secondary">
                  <img src={review.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {review.video_url && (
                <button
                  onClick={() => setVideoModal(review.video_url!)}
                  className="relative w-full aspect-video mb-4 overflow-hidden group"
                >
                  <video src={review.video_url} muted preload="metadata" playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-gold/90 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 left-2 text-[10px] text-gold/80 uppercase tracking-wider">Video</span>
                </button>
              )}

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? "text-gold fill-gold" : "text-gold/20"}`} />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-4">
                &ldquo;{review.content}&rdquo;
              </p>

              <div className="mt-4 pt-3 border-t border-gold/10">
                <p className="text-sm font-medium text-foreground">{review.customer_name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(review.created_at).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {videoModal && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4" onClick={() => setVideoModal(null)}>
          <div className="relative max-w-3xl w-full aspect-video" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setVideoModal(null)} className="absolute -top-10 right-0 text-white hover:text-gold transition-colors">
              <X className="h-6 w-6" />
            </button>
            {videoModal.startsWith("/uploads/") || videoModal.match(/\.(mp4|webm|mov)(\?|$)/i) ? (
              <video src={videoModal} controls autoPlay className="w-full h-full bg-black" />
            ) : (
              <iframe
                src={videoModal}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
