import { NextResponse } from "next/server";
import { currentUser, supabaseAdmin } from "@/lib/supabase/server";
import { hoanTien } from "@/lib/credits";

export const runtime = "nodejs";

/**
 * Huỷ việc đang xếp hàng hoặc đang chạy.
 * Chỉ người tạo việc mới được huỷ. Tiền giữ sẽ được hoàn lại.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ code: "CHUA_DANG_NHAP" }, { status: 401 });

  const { id } = await params;
  const sb = supabaseAdmin();

  const { data: job } = await sb.from("jobs").select("id, user_id, status").eq("id", id).single();
  if (!job || job.user_id !== user.id) {
    return NextResponse.json({ code: "KHONG_THAY", message: "Không tìm thấy việc này" }, { status: 404 });
  }

  if (job.status !== "queued" && job.status !== "running") {
    return NextResponse.json({ code: "KHONG_THE_HUY", message: "Việc này đã xong hoặc đã hỏng, không huỷ được" }, { status: 400 });
  }

  await sb
    .from("jobs")
    .update({
      status: "cancelled",
      error_code: "HUY_BOI_NGUOI_DUNG",
      error_detail: "Người dùng tự huỷ",
      finished_at: new Date().toISOString(),
    })
    .eq("id", id);

  await hoanTien(id, "huỷ bởi người dùng");

  return NextResponse.json({ ok: true });
}
