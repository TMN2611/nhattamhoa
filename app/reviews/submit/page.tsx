"use client";

import { useState, useRef, useEffect } from "react";
import { Star, Upload, X, Loader2, ArrowLeft, CheckCircle, Image as ImageIcon, Video } from "lucide-react";
import Link from "next/link";

function MediaUploader({
  label,
  accept,
  currentUrl,
  onUploaded,
  onClear,
  type,
}: {
  label: string;
  accept: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
  onClear: () => void;
  type: "image" | "video";
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [urlMode, setUrlMode] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === "video" ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File quá lớn. Tối đa ${type === "video" ? "50MB" : "5MB"}`);
      return;
    }

    setUploading(true);
    setProgress("Đang tải lên...");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload-public", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
        setProgress("");
      } else {
        alert("Lỗi tải lên: " + (data.error || "Không rõ"));
        setProgress("");
      }
    } catch {
      alert("Lỗi tải lên file");
      setProgress("");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleUrlSubmit() {
    if (urlInput.trim()) {
      onUploaded(urlInput.trim());
      setUrlInput("");
      setUrlMode(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-muted-foreground uppercase tracking-wider">{label}</label>

      {currentUrl ? (
        <div className="border border-gold/20 bg-secondary/30 p-3">
          <div className="flex items-start gap-3">
            {type === "image" ? (
              <div className="w-16 h-16 border border-gold/10 overflow-hidden flex-shrink-0">
                <img src={currentUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-24 h-16 border border-gold/10 overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center">
                <video src={currentUrl} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground truncate">{currentUrl}</p>
              <button onClick={onClear} className="mt-1 text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1">
                <X className="h-3 w-3" /> Xoá
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gold/20 bg-secondary/10 p-4 space-y-3">
          <div
            className="flex flex-col items-center justify-center cursor-pointer hover:bg-gold/5 transition-colors py-4 rounded"
            onClick={() => !uploading && fileRef.current?.click()}
          >
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-gold animate-spin mb-2" />
                <p className="text-xs text-gold">{progress}</p>
              </>
            ) : (
              <>
                {type === "image" ? (
                  <ImageIcon className="h-8 w-8 text-gold/40 mb-2" />
                ) : (
                  <Video className="h-8 w-8 text-gold/40 mb-2" />
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Nhấp để tải {type === "image" ? "ảnh" : "video"} từ máy
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {type === "image" ? "JPG, PNG, WebP — tối đa 5MB" : "MP4, WebM, MOV — tối đa 50MB"}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gold/10" />
            <span className="text-[10px] text-muted-foreground/60 uppercase">hoặc</span>
            <div className="flex-1 h-px bg-gold/10" />
          </div>

          {urlMode ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
                placeholder={`Dán URL ${type === "image" ? "ảnh" : "video"}...`}
                className="flex-1 px-3 py-2 border border-gold/20 bg-card text-foreground text-sm outline-none focus:border-gold/50 placeholder-[#8A7D65]/60"
                autoFocus
              />
              <button onClick={handleUrlSubmit} className="px-3 py-2 bg-gold/20 text-gold text-xs uppercase hover:bg-gold/30 transition-colors">
                OK
              </button>
              <button onClick={() => { setUrlMode(false); setUrlInput(""); }} className="px-2 py-2 text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => setUrlMode(true)} className="w-full text-center text-xs text-gold/60 hover:text-gold transition-colors py-1">
              Dán URL thay vì tải file
            </button>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

export default function SubmitReviewPage() {
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ntt_phone");
    if (saved) setPhone(saved);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!phone.trim() || !customerName.trim() || !content.trim()) {
      setError("Vui lòng điền đầy đủ số điện thoại, tên và nội dung đánh giá");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          customer_name: customerName.trim(),
          content: content.trim(),
          rating,
          image_url: imageUrl || undefined,
          video_url: videoUrl || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto border border-emerald-400/30 bg-emerald-900/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-light font-display text-foreground mb-2">
              Cảm ơn bạn!
            </h1>
            <p className="text-muted-foreground">
              Đánh giá của bạn đã được gửi thành công. Nhất Tâm Hoa trân trọng mọi chia sẻ từ khách hàng.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/reviews" className="px-6 py-3 border border-gold/30 text-gold text-sm uppercase tracking-wider hover:bg-gold/10 transition-colors text-center">
              Xem tất cả đánh giá
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-gold transition-colors">
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg px-4 py-12 md:py-20">
        <Link href="/reviews" className="inline-flex items-center gap-2 text-gold text-sm mb-8 hover:text-gold/80 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Đánh giá
        </Link>

        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.4em] uppercase text-gold mb-3">Nhất Tâm Hoa</p>
          <h1 className="text-3xl md:text-4xl font-light text-foreground font-display">
            Gửi đánh giá
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-muted-foreground leading-relaxed text-sm">
            Chia sẻ trải nghiệm của bạn với Nhất Tâm Hoa. Đánh giá chỉ dành cho khách hàng đã mua hàng.
          </p>
          <div className="mt-6 h-px w-24 mx-auto bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
              Số điện thoại đặt hàng *
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại đã dùng để đặt hàng"
              className="w-full px-4 py-3 border border-gold/20 bg-card text-foreground text-sm outline-none focus:border-gold/50 placeholder-[#8A7D65]/60"
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1">
              Dùng để xác minh bạn là khách hàng đã mua hàng
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
              Tên của bạn *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nhập tên hiển thị"
              className="w-full px-4 py-3 border border-gold/20 bg-card text-foreground text-sm outline-none focus:border-gold/50 placeholder-[#8A7D65]/60"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Đánh giá
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setRating(s)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`h-7 w-7 ${s <= rating ? "text-gold fill-gold" : "text-gold/20"}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1.5">
              Nội dung đánh giá *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm..."
              rows={4}
              className="w-full px-4 py-3 border border-gold/20 bg-card text-foreground text-sm outline-none focus:border-gold/50 placeholder-[#8A7D65]/60 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MediaUploader
              label="Hình ảnh (tuỳ chọn)"
              accept="image/*"
              currentUrl={imageUrl}
              onUploaded={setImageUrl}
              onClear={() => setImageUrl("")}
              type="image"
            />
            <MediaUploader
              label="Video (tuỳ chọn)"
              accept="video/*"
              currentUrl={videoUrl}
              onUploaded={setVideoUrl}
              onClear={() => setVideoUrl("")}
              type="video"
            />
          </div>

          {error && (
            <div className="border border-red-500/30 bg-red-900/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-[#B8860B] via-[var(--gold)] to-[#B8860B] text-primary-foreground text-sm uppercase font-medium tracking-wider flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
