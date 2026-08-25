/**
 * M1 — PoC dòng chảy lõi. Chạy bằng CLI, chưa có web.
 *
 * Mục đích: chứng minh ppt-master chạy được trong sandbox của Anthropic,
 * ra file .pptx mở được, VÀ ĐO CHI PHÍ THẬT. Xem docs/plan.md mốc M1.
 *
 * Chạy:
 *   node --experimental-strip-types scripts/m1-poc.ts --input duong/dan/giao-an.docx
 *   node --experimental-strip-types scripts/m1-poc.ts --topic "Lão Hạc" --model claude-sonnet-5 --lan 5
 *
 * Cần: ANTHROPIC_API_KEY, ANTHROPIC_ENVIRONMENT_ID, AGENT_ID__edu_lecture_pptx
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import { ManagedAgentsRuntime, buildPrompt } from "../packages/runtime/src/index.ts";

interface ThamSo {
  input?: string;
  topic?: string;
  model: string;
  soTrang: number;
  lan: number;
  out: string;
}

function docThamSo(): ThamSo {
  const a = process.argv.slice(2);
  const lay = (ten: string) => {
    const i = a.indexOf(`--${ten}`);
    return i >= 0 ? a[i + 1] : undefined;
  };
  return {
    input: lay("input"),
    topic: lay("topic"),
    model: lay("model") ?? "claude-haiku-4-5",
    soTrang: Number(lay("so-trang") ?? 13),
    lan: Number(lay("lan") ?? 1),
    out: lay("out") ?? "./m1-ket-qua",
  };
}

function batBuoc(ten: string): string {
  const v = process.env[ten];
  if (!v) {
    console.error(`\n✗ Thiếu biến môi trường ${ten}`);
    console.error("  Chép .env.example thành .env rồi điền, hoặc export trực tiếp.\n");
    process.exit(1);
  }
  return v;
}

const USD_VND = 26_000;
const dinhDangTien = (umd: number) =>
  `${(umd / 1_000_000).toFixed(4)} USD ≈ ${Math.round((umd * USD_VND) / 1_000_000).toLocaleString("vi-VN")}₫`;

async function motLan(rt: ManagedAgentsRuntime, ts: ThamSo, lanThu: number) {
  const nhan = `Lần ${lanThu}/${ts.lan}`;
  const batDau = Date.now();

  const files: { name: string; bytes: Uint8Array }[] = [];
  if (ts.input) {
    if (!existsSync(ts.input)) throw new Error(`Không thấy file ${ts.input}`);
    files.push({ name: basename(ts.input), bytes: new Uint8Array(readFileSync(ts.input)) });
  }

  const prompt = buildPrompt({
    tenCongCu: "Tạo bài giảng PowerPoint",
    skill: "ppt-master",
    truong: [
      { label: "Cấp học", value: "THCS" },
      { label: "Lớp", value: "Lớp 8" },
      { label: "Môn", value: "Ngữ văn" },
      { label: "Số trang", value: `${ts.soTrang} trang` },
      { label: "Tên bài", value: ts.topic ?? "" },
    ],
    tuyChon: [],
    files: files.map((f) => f.name),
    ext: "pptx",
  });

  console.log(`\n${nhan} — mở phiên (${ts.model})…`);
  const handle = await rt.start({
    toolId: "edu.lecture-pptx",
    prompt,
    files,
    budgetUmd: 1_200_000,
    model: ts.model,
  });
  console.log(`${nhan} — session ${handle.sessionId}`);
  console.log(`${nhan} — theo dõi: https://platform.claude.com/workspaces/default/sessions/${handle.sessionId}`);

  let changCuoi = "";
  for (;;) {
    await new Promise((r) => setTimeout(r, 15_000));
    const tt = await rt.poll(handle);
    const mo = `${tt.stage ?? "?"}${tt.stageDetail ? ` · ${tt.stageDetail}` : ""}`;
    if (mo !== changCuoi) {
      const phut = ((Date.now() - batDau) / 60_000).toFixed(1);
      console.log(`${nhan} — [${phut} phút] ${tt.progress}% · ${mo}`);
      changCuoi = mo;
    }
    if (tt.status === "failed") throw new Error(`${tt.errorCode}: ${tt.errorDetail}`);
    if (tt.status !== "running") break;
  }

  const out = await rt.collect(handle);
  const giay = Math.round((Date.now() - batDau) / 1000);

  mkdirSync(ts.out, { recursive: true });
  const daLuu: string[] = [];
  for (const f of out.files) {
    const p = join(ts.out, `lan${lanThu}_${f.name}`);
    writeFileSync(p, out.files.length ? Buffer.from(f.bytes) : Buffer.alloc(0));
    daLuu.push(p);
  }

  console.log(`${nhan} — xong sau ${Math.floor(giay / 60)}p${giay % 60}s`);
  console.log(`${nhan} — chi phí: ${dinhDangTien(out.costUmd)}`);
  daLuu.forEach((p) => console.log(`${nhan} — đã lưu ${p}`));

  return { giay, costUmd: out.costUmd, soTep: out.files.length, usage: out.usage };
}

async function main() {
  const ts = docThamSo();
  if (!ts.input && !ts.topic) {
    console.error("\nCần --input <file> hoặc --topic \"tên bài\"\n");
    process.exit(1);
  }

  const rt = new ManagedAgentsRuntime({
    apiKey: batBuoc("ANTHROPIC_API_KEY"),
    environmentId: batBuoc("ANTHROPIC_ENVIRONMENT_ID"),
    agentIdFor: () => batBuoc("AGENT_ID__edu_lecture_pptx"),
  });

  console.log("═".repeat(64));
  console.log("M1 — PoC tạo bài giảng qua Claude Managed Agents");
  console.log(`Model ${ts.model} · ${ts.soTrang} trang · chạy ${ts.lan} lần`);
  console.log("═".repeat(64));

  const ketQua: Awaited<ReturnType<typeof motLan>>[] = [];
  for (let i = 1; i <= ts.lan; i++) {
    try {
      ketQua.push(await motLan(rt, ts, i));
    } catch (e) {
      console.error(`\n✗ Lần ${i} hỏng:`, e instanceof Error ? e.message : e);
    }
  }

  if (ketQua.length === 0) {
    console.error("\nKhông lần nào chạy xong. Xem lỗi ở trên.\n");
    process.exit(1);
  }

  const trungVi = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    return s[Math.floor(s.length / 2)];
  };
  const cost = trungVi(ketQua.map((k) => k.costUmd));
  const giay = trungVi(ketQua.map((k) => k.giay));

  console.log(`\n${"═".repeat(64)}`);
  console.log("KẾT QUẢ — chép số này vào docs/adr/0004-pricing-and-unit-economics.md");
  console.log("═".repeat(64));
  console.log(`Chạy xong        ${ketQua.length}/${ts.lan} lần`);
  console.log(`Thời gian (TV)   ${Math.floor(giay / 60)} phút ${giay % 60} giây`);
  console.log(`Chi phí (TV)     ${dinhDangTien(cost)}`);
  console.log(`Giá bán hiện tại 45.000₫  →  biên ${Math.round((1 - (cost * USD_VND) / 1_000_000 / 45_000) * 100)}%`);
  console.log(`\nƯớc lượng trong ADR-0004 là 20.000₫ cho Haiku 4.5.`);
  console.log(`Lệch quá 50% thì phải sửa lại bảng giá.\n`);

  writeFileSync(
    join(ts.out, "m1-ket-qua.json"),
    JSON.stringify({ thamSo: ts, ketQua, trungVi: { costUmd: cost, giay } }, null, 2),
  );
}

main().catch((e) => {
  console.error("\n✗", e);
  process.exit(1);
});
