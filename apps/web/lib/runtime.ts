import { GeminiDocRuntime, ManagedAgentsRuntime, type Runtime } from "@trothu/runtime";
import { getToolById } from "./tools";

/**
 * Chỗ DUY NHẤT khởi tạo runtime.
 *
 * Đổi sang worker tự dựng (phương án dự phòng ở ADR-0003 mục 6): viết class mới
 * thoả interface Runtime rồi đổi đúng hàm này. Không đụng tới UI, không đụng tới
 * dispatcher hay poller.
 */
export function taoRuntime(): Runtime | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const environmentId = process.env.ANTHROPIC_ENVIRONMENT_ID;
  if (!apiKey || !environmentId) return null;

  return new ManagedAgentsRuntime({
    apiKey,
    environmentId,
    agentIdFor: (toolId) => {
      const tool = getToolById(toolId);
      if (!tool) throw new Error(`Không có công cụ ${toolId}`);
      // Mỗi công cụ một agent riêng, tạo sẵn bằng scripts/setup-agents.ts.
      // Biến môi trường đặt theo mẫu AGENT_ID__edu_lecture_pptx
      const key = `AGENT_ID__${toolId.replace(/[.-]/g, "_")}`;
      const id = process.env[key];
      if (!id) throw new Error(`Thiếu biến môi trường ${key} — chạy scripts/setup-agents.ts trước`);
      return id;
    },
  });
}

/**
 * Runtime cho công cụ sinh văn bản (.docx / .xlsx) — không cần sandbox.
 * Đổi nhà cung cấp chỉ sửa đúng hàm này.
 */
export function taoRuntimeVanBan(): GeminiDocRuntime | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new GeminiDocRuntime(key);
}
