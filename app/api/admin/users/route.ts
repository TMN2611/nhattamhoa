export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateAdminRequest } from "@/lib/admin-utils";
import crypto from "crypto";

export async function GET(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, display_name, role, is_active, created_at")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, users: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Chỉ chủ cửa hàng mới có quyền tạo tài khoản" }, { status: 403 });
    }

    const { username, password, display_name, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Thiếu tên đăng nhập hoặc mật khẩu" }, { status: 400 });
    }

    if (role && !["owner", "cashier"].includes(role)) {
      return NextResponse.json({ error: "Quyền không hợp lệ" }, { status: 400 });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        password_hash: passwordHash,
        display_name: display_name || username,
        role: role || "cashier",
      })
      .select("id, username, display_name, role, is_active, created_at")
      .single();

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        return NextResponse.json({ error: "Tên đăng nhập đã tồn tại" }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, is_active, password, display_name, role } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const updates: any = {};
    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (display_name) updates.display_name = display_name;
    if (role && ["owner", "cashier"].includes(role)) updates.role = role;
    if (password) {
      updates.password_hash = crypto.createHash("sha256").update(password).digest("hex");
    }

    const { data, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id, username, display_name, role, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
