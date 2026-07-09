export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/lib/admin-utils";
import { sendResetEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Vui lòng nhập tên đăng nhập" }, { status: 400 });
    }

    const { data: users, error: findError } = await supabase
      .from("admin_users")
      .select("id, username, email")
      .eq("username", username)
      .eq("is_active", true)
      .limit(1);

    if (findError) throw findError;

    const user = users && users[0];
    if (!user || !user.email) {
      // Don't reveal whether the user exists or not
      return NextResponse.json({ success: true, message: "Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi." });
    }

    const resetToken = hashPassword(`${user.id}:${Date.now()}:${Math.random()}`);
    const resetExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    const { error: updateError } = await supabase
      .from("admin_users")
      .update({ reset_token: resetToken, reset_expires: resetExpires })
      .eq("id", user.id);

    if (updateError) {
      console.error("Update reset token error:", updateError);
      throw updateError;
    }

    const host = req.headers.get("host") || "localhost:5000";
    const protocol = req.headers.get("x-forwarded-proto") || "https";
    const resetUrl = `${protocol}://${host}/admin/reset-password?token=${resetToken}`;

    try {
      await sendResetEmail(user.email, resetUrl, user.username);
    } catch (mailError: any) {
      console.error("Send reset email error:", mailError);
      return NextResponse.json({ error: "Không thể gửi email. Vui lòng kiểm tra cấu hình SMTP (SMTP_USER, SMTP_PASS)." }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Nếu tài khoản tồn tại, email đặt lại mật khẩu đã được gửi." });
  } catch (error: any) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
