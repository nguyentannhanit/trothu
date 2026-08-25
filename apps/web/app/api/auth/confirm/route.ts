import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Đích của liên kết đăng nhập gửi qua email (magic link, xác nhận đăng ký).
 *
 * Vì sao cần route riêng ngoài /api/auth/callback:
 * luồng ngầm (implicit) trả token trong phần `#` của URL — máy chủ KHÔNG đọc được.
 * Route này nhận `token_hash` trên query rồi đổi lấy phiên ở phía máy chủ, nên
 * cookie được đặt đúng và trang trong app nhận ra người dùng ngay.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const code = url.searchParams.get("code");
  const ve = url.searchParams.get("next") ?? "/app";

  const sb = await supabaseServer();

  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(ve, url.origin));
    console.error("[auth/confirm] exchangeCodeForSession hỏng:", error.message);
  }

  if (token_hash && type) {
    const { error } = await sb.auth.verifyOtp({ type, token_hash });
    if (!error) return NextResponse.redirect(new URL(ve, url.origin));
    console.error("[auth/confirm] verifyOtp hỏng:", error.message);
  }

  return NextResponse.redirect(new URL("/dang-nhap?loi=lien-ket-het-han", url.origin));
}
