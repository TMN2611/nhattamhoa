export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { validateAdminRequest, hashPassword } from "@/lib/admin-utils";

export async function GET(req: Request) {
  try {
    const auth = validateAdminRequest(req);
    if (!auth.valid || auth.role !== "owner") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, username, email, display_name, role, is_active, created_at")
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

    const { username, password, email, display_name, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Thiếu tên đăng nhập hoặc mật khẩu" }, { status: 400 });
    }

    if (role && !["owner", "cashier"].includes(role)) {
      return NextResponse.json({ error: "Quyền không hợp lệ" }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    const { data, error } = await supabase
      .from("admin_users")
      .insert({
        username,
        email: email || null,
        password_hash: passwordHash,
        display_name: display_name || username,
        role: role || "cashier",
      })
      .select("id, username, email, display_name, role, is_active, created_at")
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

    const { id, is_active, password, email, display_name, role } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing user id" }, { status: 400 });

    const updates: any = {};
    if (typeof is_active === "boolean") updates.is_active = is_active;
    if (display_name) updates.display_name = display_name;
    if (email !== undefined) updates.email = email || null;
    if (role && ["owner", "cashier"].includes(role)) updates.role = role;
    if (password) {
      updates.password_hash = hashPassword(password);
    }

    const { data, error } = await supabase
      .from("admin_users")
      .update(updates)
      .eq("id", id)
      .select("id, username, email, display_name, role, is_active, created_at")
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, user: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
