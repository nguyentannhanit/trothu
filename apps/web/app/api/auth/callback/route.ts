import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Đích quay về sau khi bấm liên kết trong email hoặc đăng nhập Google */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const ve = url.searchParams.get("next") ?? "/app";

  if (code) {
    const sb = await supabaseServer();
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(ve, url.origin));
  }

  return NextResponse.redirect(new URL("/dang-nhap?loi=1", url.origin));
}
