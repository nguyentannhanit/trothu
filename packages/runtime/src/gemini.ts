import { GoogleGenAI } from "@google/genai";
import { ghiDocx, ghiXlsx, type BangTinh, type Khoi, type TaiLieu } from "./tai-lieu.ts";
import type { JobOutput } from "./index.ts";

/**
 * Chạy công cụ sinh văn bản bằng Gemini — KHÔNG cần sandbox, KHÔNG cần vòng lặp agent.
 *
 * 14 trong 17 công cụ chỉ ra .docx / .xlsx, tức là văn bản có cấu trúc. Với chúng,
 * một lần gọi model rồi ghi file bằng thư viện là đủ. Chỉ 3 công cụ ra .pptx mới
 * cần ppt-master và môi trường chạy Python — xem docs/adr/0001-ai-runtime.md.
 */

export interface DirectInput {
  toolId: string;
  prompt: string;
  ext: "docx" | "xlsx";
  model?: string;
  /** tên file kết quả, không kèm đuôi */
  tenTep: string;
}

const MODEL_MAC_DINH = "gemini-3.7-flash";

/* Giá tra ngày 2026-08-24 cho dòng Flash. Tầng miễn phí thì bằng 0 —
   đặt qua biến môi trường khi lên gói trả phí. */
const GIA_VAO_UMD = Number(process.env.GEMINI_GIA_VAO_UMD ?? 0); // micro-USD / 1 triệu token vào
const GIA_RA_UMD = Number(process.env.GEMINI_GIA_RA_UMD ?? 0);

/* ── Lược đồ đầu ra ────────────────────────────────────────────────
   Gemini không nhận kiểu hợp (union), nên gộp mọi loại khối vào một đối tượng
   với các trường tuỳ chọn, phân biệt bằng `loai`. Bảng dùng dạng {o:[...]}
   thay cho mảng lồng mảng cho chắc ăn. */
const LUOC_DO_TAI_LIEU = {
  type: "OBJECT",
  properties: {
    tieuDe: { type: "STRING", description: "Tiêu đề tài liệu, viết tiếng Việt có dấu" },
    phuDe: { type: "STRING" },
    phan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          tieuDe: { type: "STRING" },
          khoi: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                loai: { type: "STRING", enum: ["doan", "danh_sach", "bang", "ngat_trang"] },
                text: { type: "STRING", description: "dùng khi loai=doan" },
                dam: { type: "BOOLEAN" },
                muc: { type: "ARRAY", items: { type: "STRING" }, description: "dùng khi loai=danh_sach" },
                danhSo: { type: "BOOLEAN" },
                tieuDeCot: { type: "ARRAY", items: { type: "STRING" }, description: "dùng khi loai=bang" },
                hang: {
                  type: "ARRAY",
                  description: "dùng khi loai=bang",
                  items: { type: "OBJECT", properties: { o: { type: "ARRAY", items: { type: "STRING" } } }, required: ["o"] },
                },
              },
              required: ["loai"],
            },
          },
        },
        required: ["khoi"],
      },
    },
    ghiChu: { type: "ARRAY", items: { type: "STRING" }, description: "điều người dùng cần tự kiểm lại" },
  },
  required: ["tieuDe", "phan"],
} as const;

const LUOC_DO_BANG_TINH = {
  type: "OBJECT",
  properties: {
    sheet: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          ten: { type: "STRING" },
          ghiChu: { type: "STRING" },
          cot: { type: "ARRAY", items: { type: "STRING" } },
          hang: {
            type: "ARRAY",
            items: { type: "OBJECT", properties: { o: { type: "ARRAY", items: { type: "STRING" } } }, required: ["o"] },
          },
        },
        required: ["ten", "cot", "hang"],
      },
    },
  },
  required: ["sheet"],
} as const;

const HE_THONG = [
  "Bạn soạn tài liệu hành chính và chuyên môn cho người đi làm Việt Nam.",
  "",
  "Bắt buộc:",
  "- Viết tiếng Việt có dấu, đúng chính tả, dùng từ ngữ nghiệp vụ chuẩn của ngành.",
  "- Bám sát yêu cầu và nội dung nguồn. KHÔNG bịa số liệu, KHÔNG bịa căn cứ pháp lý,",
  "  KHÔNG bịa tên người hay tên đơn vị. Thiếu thông tin thì để trong ngoặc vuông",
  "  như [TÊN ĐƠN VỊ] để người dùng tự điền, và ghi vào mục ghiChu.",
  "- Nội dung đủ chi tiết để dùng được ngay, không viết chung chung.",
  "- Trả về đúng lược đồ JSON được yêu cầu, không thêm chữ nào ngoài JSON.",
].join("\n");

export class GeminiDocRuntime {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async run(input: DirectInput): Promise<JobOutput> {
    const model = input.model || MODEL_MAC_DINH;
    const laBang = input.ext === "xlsx";

    const res = await this.ai.models.generateContent({
      model,
      contents: input.prompt,
      config: {
        systemInstruction: HE_THONG,
        responseMimeType: "application/json",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: (laBang ? LUOC_DO_BANG_TINH : LUOC_DO_TAI_LIEU) as any,
        temperature: 0.4,
      },
    });

    const raw = res.text;
    if (!raw) throw new Error("Model không trả về nội dung nào");

    let bytes: Uint8Array;
    if (laBang) {
      bytes = await ghiXlsx(doiSangBangTinh(JSON.parse(raw)));
    } else {
      bytes = await ghiDocx(doiSangTaiLieu(JSON.parse(raw)));
    }

    const u = res.usageMetadata;
    const vao = u?.promptTokenCount ?? 0;
    const ra = (u?.candidatesTokenCount ?? 0) + (u?.thoughtsTokenCount ?? 0);
    const costUmd = Math.round((vao * GIA_VAO_UMD + ra * GIA_RA_UMD) / 1_000_000);

    return {
      files: [{ name: `${input.tenTep}.${input.ext}`, bytes }],
      costUmd,
      usage: { model, tokenVao: vao, tokenRa: ra },
    };
  }
}

/* ── Đổi JSON thô sang mô hình tài liệu ───────────────────────────── */

interface KhoiTho {
  loai: string;
  text?: string;
  dam?: boolean;
  muc?: string[];
  danhSo?: boolean;
  tieuDeCot?: string[];
  hang?: { o: string[] }[];
}

function doiSangTaiLieu(j: {
  tieuDe: string;
  phuDe?: string;
  phan: { tieuDe?: string; khoi: KhoiTho[] }[];
  ghiChu?: string[];
}): TaiLieu {
  return {
    tieuDe: j.tieuDe,
    phuDe: j.phuDe,
    ghiChu: j.ghiChu,
    phan: (j.phan ?? []).map((p) => ({
      tieuDe: p.tieuDe,
      khoi: (p.khoi ?? []).flatMap((k): Khoi[] => {
        switch (k.loai) {
          case "doan":
            return k.text ? [{ loai: "doan", text: k.text, dam: k.dam }] : [];
          case "danh_sach":
            return k.muc?.length ? [{ loai: "danh_sach", muc: k.muc, danhSo: k.danhSo }] : [];
          case "bang":
            return k.tieuDeCot?.length
              ? [{ loai: "bang", tieuDe: k.tieuDeCot, hang: (k.hang ?? []).map((h) => h.o) }]
              : [];
          case "ngat_trang":
            return [{ loai: "ngat_trang" }];
          default:
            return [];
        }
      }),
    })),
  };
}

function doiSangBangTinh(j: {
  sheet: { ten: string; cot: string[]; hang: { o: string[] }[]; ghiChu?: string }[];
}): BangTinh {
  return {
    sheet: (j.sheet ?? []).map((s) => ({
      ten: s.ten,
      cot: s.cot ?? [],
      ghiChu: s.ghiChu,
      hang: (s.hang ?? []).map((h) => h.o.map((x) => (x !== "" && !isNaN(Number(x)) ? Number(x) : x))),
    })),
  };
}
