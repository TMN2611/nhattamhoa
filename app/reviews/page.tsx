"use client";

import { useEffect, useState } from "react";
import { Star, Play, X, ArrowLeft } from "lucide-react";
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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [videoModal, setVideoModal] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/reviews");
        const data = await res.json();
        if (data.success) setReviews(data.reviews || []);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 md:py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gold text-sm mb-8 hover:text-gold/80 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </Link>

        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">Nhất Tâm Hoa</p>
          <h1 className="text-3xl md:text-5xl font-light text-foreground font-display">
            Đánh giá từ khách hàng
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
            Những chia sẻ chân thành từ khách hàng đã tin tưởng Nhất Tâm Hoa
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent" />
          <Link
            href="/reviews/submit"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-[#B8860B] via-[var(--gold)] to-[#B8860B] text-primary-foreground text-sm uppercase tracking-wider font-medium hover:brightness-110 transition-all"
          >
            Gửi đánh giá của bạn
          </Link>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-secondary animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 border border-gold/10 bg-secondary/5">
            <p className="text-muted-foreground">Chưa có đánh giá nào</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gold/15 bg-card overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {(review.image_url || review.video_url) && (
                    <div className="md:w-72 flex-shrink-0 flex flex-col">
                      {review.image_url && (
                        <div className="aspect-[4/3] md:aspect-auto md:flex-1 overflow-hidden">
                          <img src={review.image_url} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      {review.video_url && (
                        <button
                          onClick={() => setVideoModal(review.video_url!)}
                          className={`w-full aspect-video overflow-hidden relative group ${review.image_url ? "border-t border-gold/10" : "md:aspect-auto md:flex-1"}`}
                        >
                          <video src={review.video_url} muted preload="metadata" playsInline className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-gold/90 flex items-center justify-center">
                              <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
                            </div>
                          </div>
                          <span className="absolute bottom-2 left-3 text-[10px] text-gold/80 uppercase tracking-wider">Video</span>
                        </button>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col justify-center flex-1">
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-gold fill-gold" : "text-gold/20"}`} />
                      ))}
                    </div>
                    <p className="text-foreground leading-relaxed mb-4 text-base">
                      &ldquo;{review.content}&rdquo;
                    </p>
                    <div className="border-t border-gold/10 pt-3">
                      <p className="font-medium text-foreground">{review.customer_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(review.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
    </main>
  );
}
