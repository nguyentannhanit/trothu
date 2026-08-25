"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Client phía trình duyệt — chỉ đọc được dữ liệu của chính người dùng nhờ RLS */
export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
}
