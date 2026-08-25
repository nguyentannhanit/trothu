// Hợp đồng khai báo công cụ — thêm công cụ mới CHỈ được đụng thư mục này.
// Xem docs/adr/0003-web-architecture.md mục 8.

export type FileExt = "pptx" | "docx" | "xlsx" | "pdf";

/** Trường nhập liệu — sinh ra form ở trang công cụ, không phải viết tay từng màn */
export type Field =
  | { kind: "select"; name: string; label: string; options: string[]; default?: string; width?: 1 | 2 | 3 }
  | { kind: "stepper"; name: string; label: string; min: number; max: number; default: number; unit: string }
  | { kind: "segmented"; name: string; label: string; options: string[]; default: string }
  | { kind: "text"; name: string; label: string; placeholder?: string; multiline?: boolean }
  | { kind: "style"; name: string; label: string; default: string };

/** Tuỳ chọn cộng thêm tiền — hiện thành nút gạt, cộng ngay vào tổng */
export interface AddOn {
  name: string;
  label: string;
  hint: string;
  price_vnd: number;
  default: boolean;
}

export interface Nganh {
  id: string;
  slug: string;
  ten: string;
  tenNgan: string;
  moTa: string;
  /** đường nét biểu tượng, viewBox 0 0 24 24 */
  icon: string;
  mau: string;
}

export interface Tool {
  id: string;
  slug: string;
  nganh: string;
  ten: string;
  /** một dòng, hiện trên thẻ */
  tomTat: string;
  /** đoạn văn, hiện trên trang công cụ và dùng cho thẻ mô tả SEO */
  moTa: string;
  ext: FileExt;
  /** phút, [thấp, cao] */
  thoiGian: [number, number];
  price_vnd: number;
  /** trần chi phí micro-USD → budget của session Managed Agents */
  costCapUmd: number;
  model: "claude-haiku-4-5" | "claude-sonnet-5";
  /** true = cho dùng lượt miễn phí đầu tiên */
  freeEligible: boolean;
  /** nhận file tải lên không, và định dạng nào */
  accepts?: string[];
  fields: Field[];
  addOns?: AddOn[];
  /** liệt kê ở khối "Bạn sẽ nhận được" */
  nhanDuoc: string[];
  /** nội dung SEO của trang công cụ */
  hoi: { q: string; a: string }[];
}

export const EXT_STYLE: Record<FileExt, { fg: string; bg: string; nhan: string }> = {
  pptx: { fg: "text-pptx", bg: "bg-pptx-bg", nhan: "PPTX" },
  docx: { fg: "text-docx", bg: "bg-docx-bg", nhan: "DOCX" },
  xlsx: { fg: "text-xlsx", bg: "bg-xlsx-bg", nhan: "XLSX" },
  pdf: { fg: "text-danger", bg: "bg-danger-soft", nhan: "PDF" },
};
