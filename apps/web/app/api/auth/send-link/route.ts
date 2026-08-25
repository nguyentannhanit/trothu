import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Rate limit đơn giản — tối đa 3 lần gửi link cho mỗi email trong 5 phút.
 * Dùng admin client nên Supabase không tự giới hạn → phải tự chặn.
 */
const guiGanDay = new Map<string, number[]>();
const TOI_DA = 3;
const KHOANG_MS = 5 * 60 * 1000;

function kiemTraGioiHan(email: string): boolean {
  const now = Date.now();
  const ds = (guiGanDay.get(email) ?? []).filter((t) => now - t < KHOANG_MS);
  if (ds.length >= TOI_DA) return false;
  ds.push(now);
  guiGanDay.set(email, ds);
  return true;
}

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

    const emailLower = email.toLowerCase().trim();

    if (!kiemTraGioiHan(emailLower)) {
      return NextResponse.json(
        { message: "Bạn đã gửi quá nhiều lần. Vui lòng chờ 5 phút rồi thử lại." },
        { status: 429 },
      );
    }

    const origin = new URL(req.url).origin;
    const redirectTo = `${origin}/api/auth/confirm`;
    const sbAdmin = supabaseAdmin();

    // Tự động tạo user nếu chưa tồn tại trong Supabase
    const { error: createErr } = await sbAdmin.auth.admin.createUser({
      email: emailLower,
      email_confirm: true,
    });
    // Nếu user đã tồn tại thì bỏ qua lỗi trùng lặp, các lỗi khác vẫn log
    if (createErr && !createErr.message.toLowerCase().includes("already") && !createErr.message.toLowerCase().includes("duplicate")) {
      console.error("[auth/send-link] createUser error:", createErr.message);
    }

    // Gửi Magic Link đăng nhập
    const { error } = await sbAdmin.auth.signInWithOtp({
      email: emailLower,
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

