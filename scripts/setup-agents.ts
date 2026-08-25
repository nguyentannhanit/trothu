/**
 * Tạo môi trường và agent trên Anthropic — chạy MỘT LẦN, không gọi trong đường xử lý yêu cầu.
 *
 * Chạy:
 *   node --experimental-strip-types scripts/setup-agents.ts
 *
 * In ra các dòng AGENT_ID__* để chép vào .env.local và vào biến môi trường của Vercel.
 */

import Anthropic from "@anthropic-ai/sdk";
import { TOOLS } from "../apps/web/lib/tools/index.ts";

const BETA = "managed-agents-2026-04-01";

function batBuoc(ten: string): string {
  const v = process.env[ten];
  if (!v) {
    console.error(`\n✗ Thiếu ${ten}\n`);
    process.exit(1);
  }
  return v;
}

/** Hướng dẫn chung cho mọi agent — phần riêng của từng công cụ nằm trong prompt lúc chạy */
function heThong(tenCongCu: string, ext: string): string {
  return [
    `Bạn là trợ lý soạn thảo tài liệu chuyên nghiệp cho người đi làm Việt Nam.`,
    `Nhiệm vụ của phiên này: ${tenCongCu}.`,
    ``,
    `Nguyên tắc bắt buộc:`,
    `- Viết tiếng Việt chuẩn, đúng chính tả và dấu. Không trộn tiếng Anh trừ thuật ngữ bắt buộc.`,
    `- Bám sát nội dung nguồn người dùng đưa. Thiếu thông tin thì tự quyết định hợp lý rồi ghi chú ở cuối, KHÔNG bịa số liệu và KHÔNG bịa căn cứ pháp lý.`,
    `- Không hỏi lại người dùng. Phiên này chạy tự động, không có ai trả lời.`,
    `- Làm một mạch tới khi có file kết quả trong /mnt/session/outputs/ dạng .${ext}`,
    `- Kết quả là bản nháp chất lượng cao để người dùng đọc lại và chỉnh, không phải bản đã thẩm định.`,
  ].join("\n");
}

async function main() {
  const client = new Anthropic({ apiKey: batBuoc("ANTHROPIC_API_KEY") });
  const beta = client.beta as unknown as {
    environments: { create(b: Record<string, unknown>): Promise<{ id: string }> };
    agents: { create(b: Record<string, unknown>): Promise<{ id: string }> };
  };

  console.log("Tạo môi trường…");
  const env = await beta.environments.create({
    name: `trothu-${Date.now()}`,
    config: {
      type: "cloud",
      // allow_package_managers cho phép pip install requirements.txt của ppt-master
      networking: { type: "limited", allow_package_managers: true },
    },
    betas: [BETA],
  });
  console.log(`  ANTHROPIC_ENVIRONMENT_ID=${env.id}\n`);

  const skillId = process.env.PPT_MASTER_SKILL_ID;
  if (!skillId) {
    console.log("⚠ Chưa có PPT_MASTER_SKILL_ID — agent tạo bài giảng sẽ không có skill ppt-master.");
    console.log("  Tải skill lên trước bằng Skills API từ vendor/ppt-master/skills/ppt-master/\n");
  }

  const dong: string[] = [`ANTHROPIC_ENVIRONMENT_ID=${env.id}`];

  for (const t of TOOLS) {
    const canSkill = t.ext === "pptx" && skillId;
    const agent = await beta.agents.create({
      name: `trothu-${t.id}`,
      model: t.model,
      system: heThong(t.ten, t.ext),
      tools: [
        { type: "bash_20250124", name: "bash" },
        { type: "text_editor_20250728", name: "str_replace_based_edit_tool" },
      ],
      ...(canSkill ? { skills: [{ type: "custom", skill_id: skillId }] } : {}),
      betas: [BETA],
    });
    const key = `AGENT_ID__${t.id.replace(/[.-]/g, "_")}`;
    dong.push(`${key}=${agent.id}`);
    console.log(`  ✓ ${t.ten} → ${agent.id}`);
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log("Chép các dòng sau vào .env.local và vào Vercel:");
  console.log("═".repeat(60));
  dong.forEach((d) => console.log(d));
  console.log("");
}

main().catch((e) => {
  console.error("\n✗", e);
  process.exit(1);
});
