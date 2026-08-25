import { supabaseAdmin } from "./supabase/server";

/**
 * Sổ credit — mọi thay đổi số dư đi qua đây.
 * Nguyên tắc ở docs/adr/0005-payments-and-credits.md mục 2:
 * sổ chỉ ghi thêm, giữ tiền trước khi chạy, mỗi dòng có ref duy nhất.
 */

export async function soDu(userId: string): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("get_balance", { p_user: userId });
  if (error) throw error;
  return Number(data ?? 0);
}

/** Tạo việc và giữ tiền trong cùng một giao dịch. Ném INSUFFICIENT_CREDIT nếu không đủ. */
export async function taoViecVaGiuTien(args: {
  userId: string;
  toolId: string;
  input: Record<string, unknown>;
  inputFiles: unknown[];
  priceVnd: number;
}): Promise<string> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("create_job_with_hold", {
    p_user: args.userId,
    p_tool: args.toolId,
    p_input: args.input,
    p_input_files: args.inputFiles,
    p_price: args.priceVnd,
  });
  if (error) throw error;
  return data as string;
}

/** Việc chạy xong — chốt khoản giữ, ghi chi phí thật */
export async function chotViec(jobId: string, costUmd: number, usage: unknown) {
  const sb = supabaseAdmin();
  const { data: job } = await sb.from("jobs").select("user_id").eq("id", jobId).single();
  if (!job) throw new Error(`Không thấy việc ${jobId}`);

  await sb.from("credit_ledger").insert({
    user_id: job.user_id,
    kind: "commit",
    amount_vnd: 0,
    job_id: jobId,
    ref: `commit:${jobId}`,
    note: "chốt khoản đã giữ",
  });
  await sb.from("jobs").update({ cost_umd: costUmd, usage }).eq("id", jobId);
}

/** Việc hỏng — đảo khoản giữ. An toàn khi gọi lại nhiều lần nhờ ràng buộc unique(kind, ref). */
export async function hoanTien(jobId: string, lyDo: string) {
  const sb = supabaseAdmin();
  const { data: job } = await sb.from("jobs").select("user_id, price_vnd").eq("id", jobId).single();
  if (!job) throw new Error(`Không thấy việc ${jobId}`);

  const { error } = await sb.from("credit_ledger").insert({
    user_id: job.user_id,
    kind: "refund",
    amount_vnd: job.price_vnd,
    job_id: jobId,
    ref: `refund:${jobId}`,
    note: lyDo,
  });
  // Trùng ref nghĩa là đã hoàn rồi — không phải lỗi
  if (error && !String(error.message).includes("duplicate")) throw error;
}

/** Cộng tiền nạp. ref = mã giao dịch ngân hàng, chặn cộng hai lần. */
export async function congTienNap(args: {
  userId: string;
  amountVnd: number;
  bonusVnd: number;
  ref: string;
}) {
  const sb = supabaseAdmin();
  const rows: Record<string, unknown>[] = [
    { user_id: args.userId, kind: "topup", amount_vnd: args.amountVnd, ref: args.ref },
  ];
  if (args.bonusVnd > 0) {
    rows.push({
      user_id: args.userId,
      kind: "bonus",
      amount_vnd: args.bonusVnd,
      ref: `bonus:${args.ref}`,
      note: "tặng thêm theo gói nạp",
    });
  }
  const { error } = await sb.from("credit_ledger").insert(rows);
  if (error && !String(error.message).includes("duplicate")) throw error;
}
