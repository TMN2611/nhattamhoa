export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const submitLimitMap = new Map<string, { count: number; resetAt: number }>();
const SUBMIT_WINDOW = 5 * 60 * 1000;
const SUBMIT_MAX = 3;

function checkSubmitLimit(phone: string): boolean {
  const now = Date.now();
  const entry = submitLimitMap.get(phone);
  if (!entry || now > entry.resetAt) {
    submitLimitMap.set(phone, { count: 1, resetAt: now + SUBMIT_WINDOW });
    return true;
  }
  if (entry.count >= SUBMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitizeMediaUrl(url: string | undefined | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/uploads/")) return trimmed;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return trimmed;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, customer_name, content, rating, image_url, video_url } = body;

    if (!phone || !customer_name || !content) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ số điện thoại, tên và nội dung đánh giá" }, { status: 400 });
    }

    if (typeof content === "string" && content.length > 2000) {
      return NextResponse.json({ error: "Nội dung đánh giá tối đa 2000 ký tự" }, { status: 400 });
    }
    if (typeof customer_name === "string" && customer_name.length > 100) {
      return NextResponse.json({ error: "Tên quá dài" }, { status: 400 });
    }

    const normalizedPhone = phone.replace(/\D/g, "");
    if (normalizedPhone.length < 9 || normalizedPhone.length > 15) {
      return NextResponse.json({ error: "Số điện thoại không hợp lệ" }, { status: 400 });
    }

    if (!checkSubmitLimit(normalizedPhone)) {
      return NextResponse.json({ error: "Bạn đã gửi quá nhiều đánh giá. Vui lòng thử lại sau 5 phút." }, { status: 429 });
    }

    const phoneVariants = [
      normalizedPhone,
      `0${normalizedPhone}`,
      normalizedPhone.startsWith("0") ? normalizedPhone.slice(1) : null,
      normalizedPhone.startsWith("84") ? `0${normalizedPhone.slice(2)}` : null,
      normalizedPhone.startsWith("84") ? normalizedPhone.slice(2) : null,
    ].filter(Boolean);

    const orFilter = phoneVariants.map((p) => `phone.eq.${p}`).join(",");

    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("id")
      .or(orFilter)
      .limit(1);

    if (orderError) throw orderError;

    if (!orders || orders.length === 0) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng nào với số điện thoại này. Chỉ khách hàng đã mua hàng mới có thể gửi đánh giá." }, { status: 403 });
    }

    const r = Math.min(5, Math.max(1, Math.round(rating || 5)));

    const safeImageUrl = sanitizeMediaUrl(image_url);
    const safeVideoUrl = sanitizeMediaUrl(video_url);

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        customer_name: customer_name.trim().slice(0, 100),
        content: content.trim().slice(0, 2000),
        rating: r,
        image_url: safeImageUrl,
        video_url: safeVideoUrl,
        is_featured: false,
        is_active: true,
        created_by: null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
