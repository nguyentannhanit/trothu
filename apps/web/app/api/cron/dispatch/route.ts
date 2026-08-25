import { NextResponse } from "next/server";
import { getToolById, type Tool } from "@/lib/tools";
import { supabaseAdmin } from "@/lib/supabase/server";
import { taoRuntime, taoRuntimeVanBan } from "@/lib/runtime";
import { chotViec, hoanTien } from "@/lib/credits";
import { buildPrompt } from "@trothu/runtime";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Phát việc từ hàng đợi.
 *
 * Hai đường khác nhau, chọn theo định dạng đầu ra:
 *
 *   .docx / .xlsx  → gọi model một lần rồi ghi file ngay tại đây (10–60 giây).
 *                    Không cần sandbox, không cần vòng lặp agent. 14/17 công cụ đi đường này.
 *
 *   .pptx          → mở phiên Managed Agents rồi để poller dò. Cần ppt-master
 *                    nên bắt buộc phải có môi trường chạy được Python.
 */
export async function GET(req: Request) {
  if (!kiemTraBiMat(req)) return NextResponse.json({ code: "TU_CHOI" }, { status: 401 });

  const sb = supabaseAdmin();

  const { data: msgs, error: loiDoc } = await sb.rpc("job_dequeue", { p_n: 3, p_vt: 300 });
  if (loiDoc) {
    console.error("[dispatch] không đọc được hàng đợi:", loiDoc.message);
    return NextResponse.json({ code: "HANG_DOI_HONG", message: loiDoc.message }, { status: 500 });
  }

  const ketQua: { jobId: string; ket: string; loi?: string }[] = [];

  for (const m of (msgs ?? []) as { msg_id: number; job_id: string }[]) {
    const jobId = m.job_id;
    try {
      const { data: job } = await sb.from("jobs").select("*").eq("id", jobId).single();
      if (!job || job.status !== "queued") {
        await ack(sb, m.msg_id);
        continue;
      }

      const tool = getToolById(job.tool_id);
      if (!tool) throw new Error(`Không có công cụ ${job.tool_id}`);

      const ket =
        tool.ext === "pptx" ? await phatChoAgent(sb, job, tool) : await chayVanBan(sb, job, tool);

      await ack(sb, m.msg_id);
      ketQua.push({ jobId, ket });
    } catch (e) {
      const loi = e instanceof Error ? e.message : String(e);
      console.error(`[dispatch] việc ${jobId} hỏng:`, loi);
      await ghiHong(sb, jobId, "PHAT_VIEC_HONG", loi);
      await ack(sb, m.msg_id);
      ketQua.push({ jobId, ket: "hong", loi });
    }
  }

  return NextResponse.json({ da_xu_ly: ketQua.length, ketQua });
}

/* ── Đường 1: sinh văn bản, xong ngay tại đây ─────────────────────── */

async function chayVanBan(
  sb: ReturnType<typeof supabaseAdmin>,
  job: JobRow,
  tool: Tool,
): Promise<string> {
  const rt = taoRuntimeVanBan();
  if (!rt) throw new Error("Chưa cấu hình GEMINI_API_KEY");

  await sb.from("jobs").update({ status: "running", started_at: new Date().toISOString(), stage: "planning", progress: 20 }).eq("id", job.id);

  const out = await rt.run({
    toolId: tool.id,
    ext: tool.ext as "docx" | "xlsx",
    tenTep: tenTep(tool, job),
    prompt: dungLoiNhac(tool, job),
  });

  const daLuu: { path: string; name: string; bytes: number }[] = [];
  for (const f of out.files) {
    const path = `${job.user_id}/${job.id}/${f.name}`;
    const { error } = await sb.storage
      .from("outputs")
      .upload(path, f.bytes, { upsert: true, contentType: kieuMime(tool.ext) });
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
  return "xong";
}

/* ── Đường 2: mở phiên agent, poller lo phần còn lại ──────────────── */

async function phatChoAgent(
  sb: ReturnType<typeof supabaseAdmin>,
  job: JobRow,
  tool: Tool,
): Promise<string> {
  const rt = taoRuntime();
  if (!rt) throw new Error("Chưa cấu hình ANTHROPIC_API_KEY — công cụ ra .pptx cần ppt-master");

  const files: { name: string; bytes: Uint8Array }[] = [];
  for (const f of job.input_files ?? []) {
    const { data } = await sb.storage.from(f.bucket).download(f.path);
    if (data) files.push({ name: f.name, bytes: new Uint8Array(await data.arrayBuffer()) });
  }

  const handle = await rt.start({
    toolId: tool.id,
    prompt: dungLoiNhac(tool, job, files.map((f) => f.name)),
    files,
    budgetUmd: tool.costCapUmd,
    model: tool.model,
  });

  await sb
    .from("jobs")
    .update({ status: "running", session_id: handle.sessionId, started_at: new Date().toISOString(), stage: "reading", progress: 5 })
    .eq("id", job.id);

  return "da_mo_phien";
}

/* ── Dùng chung ───────────────────────────────────────────────────── */

interface JobRow {
  id: string;
  user_id: string;
  tool_id: string;
  input: Record<string, unknown>;
  input_files: { bucket: string; path: string; name: string }[] | null;
}

function dungLoiNhac(tool: Tool, job: JobRow, tenFile: string[] = []): string {
  const addOns: string[] = (job.input.__addOns as string[]) ?? [];
  return buildPrompt({
    tenCongCu: tool.ten,
    skill: tool.ext === "pptx" ? "ppt-master" : undefined,
    truong: tool.fields
      .map((f) => ({ label: f.label, value: String(job.input[f.name] ?? "") }))
      .filter((t) => t.value),
    tuyChon: (tool.addOns ?? []).filter((a) => addOns.includes(a.name)).map((a) => a.label),
    files: tenFile,
    ext: tool.ext,
  });
}

/** Tên file kết quả — ghép từ vài trường người dùng nhập cho dễ tìm lại */
function tenTep(tool: Tool, job: JobRow): string {
  const phan = [tool.slug];
  for (const k of ["mon", "lop", "vi_tri", "hang_muc", "thang", "chu_de"]) {
    const v = job.input[k];
    if (v) phan.push(khongDau(String(v)));
  }
  return phan.join("-").slice(0, 70);
}

function khongDau(s: string): string {
  // Loc theo ma ky tu, khong dung dai ky tu trong bieu thuc chinh quy:
  // dai dau to hop U+0300-U+036F viet trong regex de hong khi file di qua
  // cong cu chuan hoa Unicode, va khi hong thi no im lang khong bo dau.
  let out = "";
  for (const ch of s.normalize("NFD")) {
    const c = ch.codePointAt(0) ?? 0;
    if (c >= 0x0300 && c <= 0x036f) continue; // dau thanh, dau mu, dau moc
    if (c === 0x0111 || c === 0x0110) { out += "d"; continue; } // chu d co gach
    out += ch;
  }
  return out
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function kieuMime(ext: string): string {
  if (ext === "docx") return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  if (ext === "xlsx") return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  if (ext === "pptx") return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  return "application/octet-stream";
}

async function ack(sb: ReturnType<typeof supabaseAdmin>, msgId: number) {
  const { error } = await sb.rpc("job_ack", { p_msg_id: msgId });
  if (error) console.error("[dispatch] không xoá được tin nhắn", msgId, error.message);
}

/** Ghi hỏng và hoàn tiền — luôn đi cùng nhau */
async function ghiHong(sb: ReturnType<typeof supabaseAdmin>, jobId: string, ma: string, chiTiet: string) {
  await sb
    .from("jobs")
    .update({ status: "failed", error_code: ma, error_detail: chiTiet.slice(0, 500), finished_at: new Date().toISOString() })
    .eq("id", jobId);
  await hoanTien(jobId, `tự động hoàn: ${ma}`);
}

export function kiemTraBiMat(req: Request): boolean {
  const bimat = process.env.CRON_SECRET;
  if (!bimat) return process.env.NODE_ENV !== "production";
  return req.headers.get("authorization") === `Bearer ${bimat}`;
}
