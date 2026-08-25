import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { taoRuntime } from "@/lib/runtime";
import { chotViec, hoanTien } from "@/lib/credits";
import { kiemTraBiMat } from "../dispatch/route";

export const runtime = "nodejs";
export const maxDuration = 300;

const QUA_HAN_PHUT = 45;

/**
 * Dò trạng thái việc đang chạy, thu file khi xong, chốt hoặc hoàn tiền.
 *
 * Chạy mỗi phút. Mỗi việc chỉ tốn vài trăm mili giây trừ lúc tải file về.
 */
export async function GET(req: Request) {
  if (!kiemTraBiMat(req)) return NextResponse.json({ code: "TU_CHOI" }, { status: 401 });

  const sb = supabaseAdmin();
  const rt = taoRuntime();
  if (!rt) return NextResponse.json({ bo_qua: "chưa cấu hình ANTHROPIC_API_KEY" });

  const { data: dangChay } = await sb
    .from("jobs")
    .select("*")
    .eq("status", "running")
    .not("session_id", "is", null)
    .limit(20);

  const ketQua: { jobId: string; trangThai: string }[] = [];

  for (const job of dangChay ?? []) {
    try {
      // Quá hạn thì coi như hỏng — không để việc treo mãi và giữ tiền của người dùng
      const batDau = new Date(job.started_at ?? job.created_at).getTime();
      if (Date.now() - batDau > QUA_HAN_PHUT * 60_000) {
        await ghiHong(sb, job.id, "QUA_HAN", `Việc chạy quá ${QUA_HAN_PHUT} phút mà chưa xong`);
        ketQua.push({ jobId: job.id, trangThai: "qua_han" });
        continue;
      }

      const tt = await rt.poll({ sessionId: job.session_id! });

      if (tt.status === "running") {
        await sb
          .from("jobs")
          .update({ stage: tt.stage, stage_detail: tt.stageDetail, progress: tt.progress })
          .eq("id", job.id);
        ketQua.push({ jobId: job.id, trangThai: "dang_chay" });
        continue;
      }

      if (tt.status === "failed") {
        await ghiHong(sb, job.id, tt.errorCode ?? "LOI", tt.errorDetail ?? null);
        ketQua.push({ jobId: job.id, trangThai: "hong" });
        continue;
      }

      // Xong — thu file rồi mới chốt sổ
      const out = await rt.collect({ sessionId: job.session_id! });
      if (out.files.length === 0) {
        await ghiHong(sb, job.id, "KHONG_CO_TEP", "Việc chạy xong nhưng không sinh ra tệp nào");
        ketQua.push({ jobId: job.id, trangThai: "khong_co_tep" });
        continue;
      }

      const daLuu: { path: string; name: string; bytes: number }[] = [];
      for (const f of out.files) {
        const path = `${job.user_id}/${job.id}/${f.name}`;
        const { error } = await sb.storage.from("outputs").upload(path, f.bytes, { upsert: true });
        if (error) throw error;
        daLuu.push({ path, name: f.name, bytes: f.bytes.byteLength });
      }

      const hetHan = new Date();
      hetHan.setDate(hetHan.getDate() + Number(process.env.NGAY_GIU_KET_QUA ?? 90));

      await sb
        .from("jobs")
        .update({
          status: "done",
          stage: "done",
          stage_detail: null,
          progress: 100,
          output_files: daLuu,
          finished_at: new Date().toISOString(),
          expires_at: hetHan.toISOString(),
        })
        .eq("id", job.id);

      await chotViec(job.id, out.costUmd, out.usage);
      ketQua.push({ jobId: job.id, trangThai: "xong" });
    } catch (e) {
      console.error(`[poll] việc ${job.id} hỏng:`, e);
      ketQua.push({ jobId: job.id, trangThai: "loi_khi_do" });
    }
  }

  return NextResponse.json({ da_do: ketQua.length, ketQua });
}

/** Ghi hỏng và hoàn tiền — luôn đi cùng nhau, không bao giờ tách rời */
async function ghiHong(
  sb: ReturnType<typeof supabaseAdmin>,
  jobId: string,
  ma: string,
  chiTiet: string | null,
) {
  await sb
    .from("jobs")
    .update({ status: "failed", error_code: ma, error_detail: chiTiet, finished_at: new Date().toISOString() })
    .eq("id", jobId);
  await hoanTien(jobId, `tự động hoàn: ${ma}`);
}
