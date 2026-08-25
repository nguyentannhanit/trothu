/**
 * Lớp DUY NHẤT chạm tới AI.
 *
 * Web app không bao giờ gọi thẳng Anthropic SDK — mọi thứ đi qua đây.
 * Đổi nhà cung cấp hay đổi cách chạy agent chỉ được sửa trong thư mục này.
 * Xem docs/adr/0001-ai-runtime.md mục 5.3.
 */

export type RuntimeStage = "reading" | "planning" | "resources" | "drawing" | "exporting" | "done";

export interface JobInput {
  toolId: string;
  /** hướng dẫn cho agent, đã dựng sẵn từ định nghĩa công cụ + dữ liệu người dùng nhập */
  prompt: string;
  /** file người dùng tải lên, đã tải sẵn về dạng bytes */
  files: { name: string; bytes: Uint8Array }[];
  /** micro-USD — trần chi tiêu, nền tảng tự chặn */
  budgetUmd: number;
  model: string;
}

export interface JobHandle {
  /** mã phiên phía nhà cung cấp — lưu vào jobs.session_id để dò lại sau */
  sessionId: string;
}

export interface JobProgress {
  status: "running" | "idle" | "done" | "failed";
  stage: RuntimeStage | null;
  stageDetail: string | null;
  /** 0–100, ước lượng */
  progress: number;
  costUmd: number | null;
  usage: unknown;
  errorCode?: string;
  errorDetail?: string;
}

export interface JobOutput {
  files: { name: string; bytes: Uint8Array }[];
  costUmd: number;
  usage: unknown;
}

/** Hợp đồng mà mọi cách chạy phải thoả. Xem managed-agents.ts cho bản cài đặt hiện tại. */
export interface Runtime {
  start(input: JobInput): Promise<JobHandle>;
  poll(handle: JobHandle): Promise<JobProgress>;
  collect(handle: JobHandle): Promise<JobOutput>;
  cancel(handle: JobHandle): Promise<void>;
}

export { ManagedAgentsRuntime } from "./managed-agents.ts";
export { buildPrompt } from "./prompt.ts";
export { GeminiDocRuntime, type DirectInput } from "./gemini.ts";
export * from "./tai-lieu.ts";
