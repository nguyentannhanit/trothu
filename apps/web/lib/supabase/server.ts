import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Client phía máy chủ, chạy dưới danh nghĩa người dùng đang đăng nhập (RLS có hiệu lực) */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        // Trong Server Component không ghi được cookie — bỏ qua, middleware lo việc làm mới phiên
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* gọi từ Server Component */
        }
      },
    },
  });
}

/**
 * Client dùng service role — BỎ QUA RLS.
 * Chỉ được gọi trong route handler và webhook chạy trên máy chủ.
 * Tuyệt đối không import vào bất kỳ file nào có "use client".
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Thiếu SUPABASE_SERVICE_ROLE_KEY");
  return createClient(URL, key, { auth: { persistSession: false } });
}

export async function currentUser() {
  const sb = await supabaseServer();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user;
}
