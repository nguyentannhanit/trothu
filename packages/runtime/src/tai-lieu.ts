/**
 * Mô hình tài liệu trung gian và bộ ghi ra .docx / .xlsx.
 *
 * Vì sao có lớp trung gian: LLM trả về JSON theo mô hình này, còn việc dàn trang
 * do mã tất định lo. Không để LLM tự sinh XML của Word — vừa đắt vừa dễ vỡ.
 *
 * Định dạng bám Nghị định 30/2020 về thể thức văn bản hành chính:
 * Times New Roman cỡ 13, lề trên 2cm, dưới 2cm, trái 3cm, phải 1.5cm.
 */

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import ExcelJS from "exceljs";

/* ── Mô hình ──────────────────────────────────────────────────────── */

export type Khoi =
  | { loai: "doan"; text: string; dam?: boolean; nghieng?: boolean; canGiua?: boolean }
  | { loai: "danh_sach"; muc: string[]; danhSo?: boolean }
  | { loai: "bang"; tieuDe: string[]; hang: string[][] }
  | { loai: "ngat_trang" };

export interface PhanTaiLieu {
  tieuDe?: string;
  khoi: Khoi[];
}

export interface TaiLieu {
  tieuDe: string;
  phuDe?: string;
  phan: PhanTaiLieu[];
  /** ghi chú của công cụ cho người dùng, in ở cuối */
  ghiChu?: string[];
}

export interface BangTinh {
  sheet: {
    ten: string;
    cot: string[];
    hang: (string | number)[][];
    ghiChu?: string;
  }[];
}

/* ── Ghi .docx ────────────────────────────────────────────────────── */

const FONT = "Times New Roman";
const CO = 26; // nửa-point → 13pt, chuẩn văn bản hành chính Việt Nam

function doan(text: string, o: { dam?: boolean; nghieng?: boolean; canGiua?: boolean; cach?: number } = {}) {
  return new Paragraph({
    alignment: o.canGiua ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    spacing: { after: o.cach ?? 120, line: 312 }, // giãn dòng 1.3
    children: [new TextRun({ text, bold: o.dam, italics: o.nghieng, font: FONT, size: CO })],
  });
}

function khoiRaDocx(k: Khoi): (Paragraph | Table)[] {
  switch (k.loai) {
    case "doan":
      return [doan(k.text, { dam: k.dam, nghieng: k.nghieng, canGiua: k.canGiua })];

    case "danh_sach":
      return k.muc.map(
        (m, i) =>
          new Paragraph({
            spacing: { after: 80, line: 312 },
            indent: { left: 420 },
            children: [
              new TextRun({ text: (k.danhSo ? `${i + 1}. ` : "– ") + m, font: FONT, size: CO }),
            ],
          }),
      );

    case "bang":
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: k.tieuDe.map(
                (t) =>
                  new TableCell({
                    children: [doan(t, { dam: true, canGiua: true, cach: 0 })],
                  }),
              ),
            }),
            ...k.hang.map(
              (h) =>
                new TableRow({
                  children: h.map((o) => new TableCell({ children: [doan(o, { cach: 0 })] })),
                }),
            ),
          ],
        }),
        doan("", { cach: 160 }),
      ];

    case "ngat_trang":
      return [new Paragraph({ pageBreakBefore: true, children: [] })];
  }
}

export async function ghiDocx(tl: TaiLieu): Promise<Uint8Array> {
  const con: (Paragraph | Table)[] = [];

  con.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: tl.phuDe ? 80 : 240 },
      children: [new TextRun({ text: tl.tieuDe.toUpperCase(), bold: true, font: FONT, size: 32 })],
    }),
  );
  if (tl.phuDe) con.push(doan(tl.phuDe, { canGiua: true, nghieng: true, cach: 240 }));

  for (const p of tl.phan) {
    if (p.tieuDe) {
      con.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 240, after: 120 },
          children: [new TextRun({ text: p.tieuDe, bold: true, font: FONT, size: 28 })],
        }),
      );
    }
    for (const k of p.khoi) con.push(...khoiRaDocx(k));
  }

  if (tl.ghiChu?.length) {
    con.push(doan("Ghi chú của Trợ Thủ", { dam: true, cach: 80 }));
    con.push(...tl.ghiChu.map((g) => doan("– " + g, { nghieng: true, cach: 60 })));
  }

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: CO } } } },
    sections: [
      {
        properties: {
          page: { margin: { top: 1134, bottom: 1134, left: 1701, right: 850 } }, // 2 / 2 / 3 / 1.5 cm
        },
        children: con,
      },
    ],
  });

  return new Uint8Array(await Packer.toBuffer(doc));
}

/* ── Ghi .xlsx ────────────────────────────────────────────────────── */

export async function ghiXlsx(bt: BangTinh): Promise<Uint8Array> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Trợ Thủ";
  wb.created = new Date();

  for (const s of bt.sheet) {
    const ws = wb.addWorksheet(s.ten.slice(0, 31) || "Sheet1");

    if (s.ghiChu) {
      const r = ws.addRow([s.ghiChu]);
      r.font = { name: FONT, size: 11, italic: true, color: { argb: "FF6B7280" } };
      ws.addRow([]);
    }

    const head = ws.addRow(s.cot);
    head.font = { name: FONT, size: 12, bold: true };
    head.eachCell((c) => {
      c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEDEEF0" } };
      c.border = { bottom: { style: "thin", color: { argb: "FFB0B4BA" } } };
      c.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    });

    for (const h of s.hang) {
      const r = ws.addRow(h);
      r.font = { name: FONT, size: 12 };
      r.alignment = { vertical: "top", wrapText: true };
    }

    // Bề rộng cột theo nội dung, chặn trên 46 để bảng không tràn ra ngoài trang in
    s.cot.forEach((c, i) => {
      const dai = Math.max(c.length, ...s.hang.map((h) => String(h[i] ?? "").length));
      ws.getColumn(i + 1).width = Math.min(46, Math.max(12, dai + 2));
    });
    ws.views = [{ state: "frozen", ySplit: s.ghiChu ? 3 : 1 }];
  }

  return new Uint8Array(await wb.xlsx.writeBuffer());
}
