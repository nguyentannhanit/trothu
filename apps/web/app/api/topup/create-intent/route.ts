import { NextResponse } from "next/server";
import { currentUser, supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Ký tự dùng cho mã giao dịch — bỏ O/0 và I/1 cho dễ gõ đúng.
 * Kết quả: TT XXXX (4–6 ký tự), ví dụ TT A3KN
 */
const KY_TU = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function taoMa(doDai = 4): string {
  let ma = "TT ";
  for (let i = 0; i < doDai; i++) {
    ma += KY_TU[Math.floor(Math.random() * KY_TU.length)];
  }
  return ma;
}

/**
 * Tạo intent nạp tiền — lưu vào DB trước khi hiện QR.
 * Webhook SePay sẽ khớp memo_code để tự cộng tiền.
 */
export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ code: "CHUA_DANG_NHAP" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as {
    amount_vnd?: number;
    bonus_vnd?: number;
    method?: "bank_qr" | "momo";
  } | null;

  if (!body || !body.amount_vnd || body.amount_vnd < 50_000) {
    return NextResponse.json({ message: "Số tiền tối thiểu 50.000₫" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const memoCode = taoMa(4);

  // Hết hạn sau 30 phút
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

  const { data, error } = await sb
    .from("topup_intents")
    .insert({
      user_id: user.id,
      amount_vnd: body.amount_vnd,
      bonus_vnd: body.bonus_vnd ?? 0,
      memo_code: memoCode,
      method: body.method ?? "bank_qr",
      status: "pending",
      expires_at: expiresAt,
    })
    .select("id, memo_code")
    .single();

  if (error) {
    console.error("[topup/create-intent] error:", error.message);
    return NextResponse.json({ message: "Không tạo được mã nạp tiền, thử lại" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    intentId: data.id,
    memoCode: data.memo_code,
  });
}
