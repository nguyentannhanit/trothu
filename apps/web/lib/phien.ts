import { currentUser, supabaseServer } from "./supabase/server";
import { chuCaiDau } from "./format";
import type { Job } from "./supabase/types";

/** Đã cắm biến môi trường Supabase chưa — dùng để hiện lời nhắc thay vì trắng trang */
export function daCauHinh(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export interface Phien {
  userId: string;
  email: string;
  ten: string;
  chuCai: string;
  soDu: number;
  dangChay: number;
}

/**
 * Thông tin phiên cho khung app. Trả null khi chưa đăng nhập hoặc chưa cấu hình —
 * các màn tự xử lý trường hợp null thay vì ném lỗi, để dev chạy được ngay khi chưa có Supabase.
 */
export async function phienHienTai(): Promise<Phien | null> {
  if (!daCauHinh()) return null;
  try {
    const user = await currentUser();
    if (!user) return null;

    const sb = await supabaseServer();
    const [{ data: soDu }, { count }] = await Promise.all([
      sb.rpc("get_balance", { p_user: user.id }),
      sb.from("jobs").select("id", { count: "exact", head: true }).in("status", ["queued", "running"]),
    ]);

    const ten = (user.user_metadata?.full_name as string) || user.email || "Bạn";
    return {
      userId: user.id,
      email: user.email ?? "",
      ten,
      chuCai: chuCaiDau(ten),
      soDu: Number(soDu ?? 0),
      dangChay: count ?? 0,
    };
  } catch {
    return null;
  }
}

/** Danh sách việc của người đang đăng nhập. Mảng rỗng khi chưa cấu hình. */
export async function vieccuaToi(limit = 20): Promise<Job[]> {
  if (!daCauHinh()) return [];
  try {
    const sb = await supabaseServer();
    const { data } = await sb.from("jobs").select("*").order("created_at", { ascending: false }).limit(limit);
    return (data ?? []) as Job[];
  } catch {
    return [];
  }
}

export async function motViec(id: string): Promise<Job | null> {
  if (!daCauHinh()) return null;
  try {
    const sb = await supabaseServer();
    const { data } = await sb.from("jobs").select("*").eq("id", id).single();
    return (data ?? null) as Job | null;
  } catch {
    return null;
  }
}
