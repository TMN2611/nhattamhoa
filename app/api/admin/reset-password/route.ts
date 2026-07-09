export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/admin-utils";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "Thiếu token hoặc mật khẩu mới" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu mới phải có ít nhất 6 ký tự" }, { status: 400 });
    }

    const { data: users, error: findError } = await supabase
      .from("admin_users")
      .select("id, username")
      .eq("reset_token", token)
      .gt("reset_expires", new Date().toISOString())
      .eq("is_active", true)
      .limit(1);

    if (findError) throw findError;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Token không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    const user = users[0];
    const passwordHash = hashPassword(password);

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_expires: null,
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại." });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
