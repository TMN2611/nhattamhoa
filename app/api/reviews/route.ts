export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateAdminRequest } from "@/lib/admin-utils";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, reviews: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Chỉ chủ cửa hàng mới có quyền tạo đánh giá" }, { status: 403 });
    }

    const body = await req.json();
    const { customer_name, content, rating, image_url, video_url, is_featured } = body;

    if (!customer_name || !content) {
      return NextResponse.json({ error: "Thiếu tên khách hàng hoặc nội dung" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        customer_name,
        content,
        rating: rating || 5,
        image_url: image_url || null,
        video_url: video_url || null,
        is_featured: is_featured || false,
        created_by: auth.userId || null,
      })
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, review: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const { error } = await supabase
      .from("reviews")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
