import Anthropic from "@anthropic-ai/sdk";
import type { JobHandle, JobInput, JobOutput, JobProgress, Runtime, RuntimeStage } from "./index.ts";

const BETA = "managed-agents-2026-04-01";
const FILES_BETA = "files-api-2025-04-14";

/**
 * Cài đặt bằng Claude Managed Agents — Anthropic giữ vòng lặp agent và container.
 *
 * Vì sao chọn cách này: hạ tầng của mình chỉ chạy những nhịp dưới 1 giây, nên
 * không đụng trần 800 giây của Vercel. Xem docs/adr/0003-web-architecture.md mục 1.
 */
export class ManagedAgentsRuntime implements Runtime {
  private client: Anthropic;
  private cfg: {
      apiKey: string;
      /** agent đã tạo sẵn cho từng công cụ — KHÔNG tạo agent trong đường xử lý yêu cầu */
      agentIdFor: (toolId: string) => string;
    environmentId: string;
  };

  constructor(cfg: {
    apiKey: string;
    agentIdFor: (toolId: string) => string;
    environmentId: string;
  }) {
    this.cfg = cfg;
    this.client = new Anthropic({ apiKey: cfg.apiKey });
  }

  async start(input: JobInput): Promise<JobHandle> {
    const beta = this.client.beta as unknown as ManagedAgentsBeta;

    // 1. Đưa file nguồn lên trước, để lỗi file lộ ra ngay lúc tạo phiên
    const resources: Resource[] = [];
    for (const f of input.files) {
      const up = await this.client.beta.files.upload({
        file: new File([new Uint8Array(f.bytes)], f.name),
        purpose: "agent",
        betas: [FILES_BETA],
      } as never);
      resources.push({
        type: "file",
        file_id: (up as { id: string }).id,
        mount_path: `/workspace/nguon/${f.name}`,
      });
    }

    // 2. Mở phiên. budget là dây bảo hiểm cuối cùng — nền tảng tự dừng khi vượt.
    const session = await beta.sessions.create({
      agent: this.cfg.agentIdFor(input.toolId),
      environment_id: this.cfg.environmentId,
      resources,
      budget: { type: "usd_micros", total: input.budgetUmd },
      initial_events: [{ type: "user.message", content: input.prompt }],
    });

    return { sessionId: session.id };
  }

  async poll(handle: JobHandle): Promise<JobProgress> {
    const beta = this.client.beta as unknown as ManagedAgentsBeta;
    const s = await beta.sessions.retrieve(handle.sessionId);

    const costUmd = s.usage?.cost_micros ?? null;

    if (s.status === "terminated" || s.status === "idle") {
      const loi = s.stop_reason && s.stop_reason !== "end_turn" ? s.stop_reason : null;
      return {
        status: loi === "budget_reached" ? "failed" : "done",
        stage: "done",
        stageDetail: null,
        progress: 100,
        costUmd,
        usage: s.usage ?? null,
        errorCode: loi ?? undefined,
        errorDetail: loi === "budget_reached" ? "Việc vượt trần chi phí cho phép" : undefined,
      };
    }

    const { stage, detail, percent } = await this.doanChang(handle.sessionId);
    return { status: "running", stage, stageDetail: detail, progress: percent, costUmd, usage: s.usage ?? null };
  }

  async collect(handle: JobHandle): Promise<JobOutput> {
    const beta = this.client.beta as unknown as ManagedAgentsBeta;

    // Có độ trễ 1–3 giây giữa lúc phiên nghỉ và lúc file hiện ra trong Files API
    let list: { id: string; filename: string; size_bytes: number }[] = [];
    for (let i = 0; i < 4 && list.length === 0; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 1500));
      const page = await this.client.beta.files.list({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scope_id: handle.sessionId,
        betas: [BETA, FILES_BETA],
      } as never);
      list = (page as unknown as { data: typeof list }).data ?? [];
    }

    const files: JobOutput["files"] = [];
    for (const f of list) {
      const resp = await this.client.beta.files.download(f.id, { betas: [FILES_BETA] } as never);
      const buf = new Uint8Array(await (resp as unknown as Response).arrayBuffer());
      files.push({ name: f.filename, bytes: buf });
    }

    const s = await beta.sessions.retrieve(handle.sessionId);
    return { files, costUmd: s.usage?.cost_micros ?? 0, usage: s.usage ?? null };
  }

  async cancel(handle: JobHandle): Promise<void> {
    const beta = this.client.beta as unknown as ManagedAgentsBeta;
    await beta.sessions.events.create(handle.sessionId, { type: "user.interrupt" });
  }

  /**
   * Đoán đang ở chặng nào từ các sự kiện gần nhất.
   * Cố ý thô: người dùng cần biết "đang vẽ trang 8/13", không cần phần trăm chính xác.
   */
  private async doanChang(sessionId: string): Promise<{ stage: RuntimeStage; detail: string | null; percent: number }> {
    const beta = this.client.beta as unknown as ManagedAgentsBeta;
    let text = "";
    try {
      const ev = await beta.sessions.events.list(sessionId, { limit: 30 });
      text = JSON.stringify(ev.data ?? []).toLowerCase();
    } catch {
      return { stage: "reading", detail: null, percent: 5 };
    }

    const trang = text.match(/(\d{1,2})\s*[/\\]\s*(\d{1,2})/);
    if (trang) {
      const [, a, b] = trang;
      const ti = Math.min(1, Number(a) / Math.max(1, Number(b)));
      return { stage: "drawing", detail: `trang ${a}/${b}`, percent: Math.round(25 + ti * 60) };
    }
    if (text.includes("svg_to_pptx") || text.includes("xuất") || text.includes("export")) {
      return { stage: "exporting", detail: null, percent: 92 };
    }
    if (text.includes("image_gen") || text.includes("image_search")) {
      return { stage: "resources", detail: "chuẩn bị hình", percent: 22 };
    }
    if (text.includes("design_spec") || text.includes("dàn bài")) {
      return { stage: "planning", detail: null, percent: 15 };
    }
    return { stage: "reading", detail: null, percent: 8 };
  }
}

/* Managed Agents còn ở giai đoạn beta nên SDK chưa gõ kiểu đầy đủ.
   Khai báo tối thiểu ở đây thay vì rải `any` khắp nơi. */
interface Resource {
  type: "file";
  file_id: string;
  mount_path: string;
}

interface SessionObj {
  id: string;
  status: "running" | "idle" | "rescheduling" | "terminated";
  stop_reason?: string | null;
  usage?: { cost_micros?: number } | null;
}

interface ManagedAgentsBeta {
  sessions: {
    create(body: Record<string, unknown>): Promise<SessionObj>;
    retrieve(id: string): Promise<SessionObj>;
    events: {
      create(id: string, body: Record<string, unknown>): Promise<unknown>;
      list(id: string, q: Record<string, unknown>): Promise<{ data: unknown[] }>;
    };
  };
}
