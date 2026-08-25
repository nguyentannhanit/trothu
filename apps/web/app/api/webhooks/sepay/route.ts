import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { congTienNap } from "@/lib/credits";

export const runtime = "nodejs";

/**
 * Webhook SePay — ngân hàng có biến động số dư thì bắn vào đây.
 *
 * Ba nguyên tắc, xem docs/adr/0005-payments-and-credits.md mục 3.1:
 *   1. Ghi thô TRƯỚC, khớp SAU — webhook không khớp được vẫn còn dấu vết để xử lý tay
 *   2. Mỗi giao dịch một ref duy nhất — bắn hai lần không cộng tiền hai lần
 *   3. Số tiền lệch thì cộng đúng số nhận được, không cộng theo gói
 */
export async function POST(req: Request) {
  const bimat = process.env.SEPAY_WEBHOOK_SECRET;
  if (bimat) {
    const h = req.headers.get("authorization");
    if (h !== `Apikey ${bimat}`) {
      return NextResponse.json({ code: "TU_CHOI" }, { status: 401 });
    }
  }

  const raw = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!raw) return NextResponse.json({ code: "DU_LIEU_SAI" }, { status: 400 });

  const ref = String(raw.referenceCode ?? raw.id ?? "");
  const soTien = Number(raw.transferAmount ?? 0);
  const noiDung = String(raw.content ?? raw.description ?? "");
  const chieu = String(raw.transferType ?? "in");

  if (!ref || soTien <= 0 || chieu !== "in") {
    return NextResponse.json({ bo_qua: "không phải giao dịch tiền vào" });
  }

  const sb = supabaseAdmin();

  // 1. Ghi thô. Trùng ref thì thôi, đã xử lý rồi.
  const { error: loiGhi } = await sb
    .from("bank_events")
    .insert({ provider: "sepay", ref, amount_vnd: soTien, content: noiDung, raw });
  if (loiGhi && String(loiGhi.message).includes("duplicate")) {
    return NextResponse.json({ bo_qua: "đã xử lý giao dịch này rồi" });
  }

  // 2. Tách mã giao dịch khỏi nội dung. Mã dạng TT + 6 ký tự, bỏ O/0 và I/1 cho dễ gõ.
  const ma = noiDung.toUpperCase().replace(/\s+/g, "").match(/TT[A-Z0-9]{4,8}/)?.[0];
  if (!ma) {
    return NextResponse.json({ can_xu_ly_tay: "không tìm thấy mã giao dịch trong nội dung" });
  }

  const { data: intent } = await sb
    .from("topup_intents")
    .select("*")
    .eq("memo_code", ma.replace(/^TT/, "TT "))
    .eq("status", "pending")
    .maybeSingle();

  const intent2 =
    intent ??
    (await sb.from("topup_intents").select("*").eq("memo_code", ma).eq("status", "pending").maybeSingle()).data;

  if (!intent2) {
    return NextResponse.json({ can_xu_ly_tay: `không khớp được mã ${ma}` });
  }

  // 3. Cộng đúng số nhận được. Tặng thêm tính theo tỉ lệ của gói đã chọn.
  const tiLeTang = intent2.amount_vnd > 0 ? intent2.bonus_vnd / intent2.amount_vnd : 0;
  await congTienNap({
    userId: intent2.user_id,
    amountVnd: soTien,
    bonusVnd: Math.round(soTien * tiLeTang),
    ref,
  });

  await sb.from("topup_intents").update({ status: "matched", matched_ref: ref }).eq("id", intent2.id);
  await sb.from("bank_events").update({ matched_intent: intent2.id }).eq("provider", "sepay").eq("ref", ref);

  return NextResponse.json({ ok: true, da_cong: soTien });
}
