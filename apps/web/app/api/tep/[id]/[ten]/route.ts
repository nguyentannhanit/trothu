import { NextResponse } from "next/server";
import { currentUser, supabaseServer } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * Tải tệp kết quả. Trả về URL ký sẵn có hạn thay vì đẩy byte qua Vercel —
 * vừa rẻ vừa nhanh, và không đụng giới hạn kích thước phản hồi.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string; ten: string }> }) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ code: "CHUA_DANG_NHAP" }, { status: 401 });

  const { id, ten } = await params;
  const sb = await supabaseServer();

  // RLS đã chặn việc của người khác, nhưng vẫn kiểm lại cho chắc
  const { data: job } = await sb.from("jobs").select("user_id, output_files").eq("id", id).single();
  if (!job || job.user_id !== user.id) {
    return NextResponse.json({ code: "KHONG_THAY" }, { status: 404 });
  }

  const tep = (job.output_files ?? []).find((f: { name: string }) => f.name === decodeURIComponent(ten));
  if (!tep) return NextResponse.json({ code: "KHONG_THAY_TEP" }, { status: 404 });

  const { data, error } = await sb.storage.from("outputs").createSignedUrl(tep.path, 300, { download: tep.name });
  if (error || !data) {
    return NextResponse.json({ code: "KHONG_TAO_DUOC_LINK" }, { status: 500 });
  }

  return NextResponse.redirect(data.signedUrl);
}
