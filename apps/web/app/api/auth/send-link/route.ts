import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * API gửi liên kết đăng nhập / đăng ký.
 * Sử dụng supabaseAdmin (Service Role) để tự động tạo tài khoản mới nếu chưa có,
 * giúp người dùng đăng ký tự do mà không bị chặn bởi cài đặt "disable signup" của Supabase.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ message: "Địa chỉ email không hợp lệ" }, { status: 400 });
    }

    const origin = new URL(req.url).origin;
    const redirectTo = `${origin}/api/auth/confirm`;
    const sbAdmin = supabaseAdmin();

    // Tự động tạo user nếu chưa tồn tại trong Supabase
    const { error: createErr } = await sbAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
    });
    // Nếu user đã tồn tại thì bỏ qua lỗi trùng lặp, các lỗi khác vẫn ném ra
    if (createErr && !createErr.message.toLowerCase().includes("already") && !createErr.message.toLowerCase().includes("duplicate")) {
      console.error("[auth/send-link] createUser error:", createErr.message);
    }

    // Gửi Magic Link đăng nhập
    const { error } = await sbAdmin.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      console.error("[auth/send-link] error:", error.message);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/send-link] fatal:", err);
    return NextResponse.json({ message: "Có lỗi xảy ra, vui lòng thử lại" }, { status: 500 });
  }
}
