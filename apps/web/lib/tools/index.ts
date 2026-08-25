import type { Nganh, Tool } from "./types";
import { GIAO_DUC_TOOLS } from "./giao-duc";
import { KE_TOAN_TOOLS } from "./ke-toan";
import { XAY_DUNG_TOOLS } from "./xay-dung";
import { BAN_HANG_TOOLS } from "./ban-hang";
import { NHAN_SU_TOOLS } from "./nhan-su";

export * from "./types";

// Thêm ngành mới: thêm một mục ở đây + một file công cụ. Không đụng chỗ nào khác.
export const NGANH: Nganh[] = [
  {
    id: "giao-duc",
    slug: "giao-duc",
    ten: "Giáo dục",
    tenNgan: "Giáo dục",
    moTa:
      "Cho giáo viên mọi cấp. Bám khung Chương trình giáo dục phổ thông 2018, xuất ra file trình chiếu và in được ngay.",
    icon: "M3 8l9-4 9 4-9 4-9-4zM7 11v5c0 1.1 2.2 2 5 2s5-.9 5-2v-5",
    mau: "#2F6B4F",
  },
  {
    id: "ke-toan",
    slug: "ke-toan",
    ten: "Kế toán / Tài chính",
    tenNgan: "Kế toán",
    moTa: "Việc lặp lại hằng tháng: đối soát, bảng lương, báo cáo. Vào bằng Excel, ra bằng Excel.",
    icon: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM9 7h6M9 11h2M13 11h2M9 15h2M13 15h2",
    mau: "#1F4E79",
  },
  {
    id: "xay-dung",
    slug: "xay-dung",
    ten: "Xây dựng / Kỹ thuật",
    tenNgan: "Xây dựng",
    moTa: "Hồ sơ công trường: biên bản, nhật ký, báo cáo gửi chủ đầu tư. Đúng mẫu, đúng trình tự.",
    icon: "M12 3l9 16H3l9-16zM12 10v4M12 17h.01",
    mau: "#B26A1F",
  },
  {
    id: "ban-hang",
    slug: "ban-hang",
    ten: "Bán hàng / Marketing",
    tenNgan: "Bán hàng",
    moTa: "Nội dung đăng đều đặn mà không cạn ý: kịch bản, bài viết, báo giá gửi khách.",
    icon: "M4 9h4l6-4v14l-6-4H4V9zM18 9a4 4 0 0 1 0 6",
    mau: "#8A3341",
  },
  {
    id: "nhan-su",
    slug: "nhan-su",
    ten: "Nhân sự / Hành chính",
    tenNgan: "Nhân sự",
    moTa: "Biểu mẫu chuẩn hoá cao — hợp đồng, quyết định, mô tả công việc. Đúng luật hiện hành.",
    icon: "M16 20v-2a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v2M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM19 8v6M22 11h-6",
    mau: "#4A4A6A",
  },
];

export const TOOLS: Tool[] = [
  ...GIAO_DUC_TOOLS,
  ...KE_TOAN_TOOLS,
  ...XAY_DUNG_TOOLS,
  ...BAN_HANG_TOOLS,
  ...NHAN_SU_TOOLS,
];

export function getNganh(slug: string): Nganh | undefined {
  return NGANH.find((n) => n.slug === slug);
}

export function getTool(nganhSlug: string, toolSlug: string): Tool | undefined {
  return TOOLS.find((t) => t.nganh === nganhSlug && t.slug === toolSlug);
}

export function getToolById(id: string): Tool | undefined {
  return TOOLS.find((t) => t.id === id);
}

export function toolsOf(nganhSlug: string): Tool[] {
  return TOOLS.filter((t) => t.nganh === nganhSlug);
}

export function toolHref(t: Tool): string {
  return `/${t.nganh}/${t.slug}`;
}

/** Giá rẻ nhất trong một ngành — dùng trên trang ngành */
export function reNhat(nganhSlug: string): number {
  return Math.min(...toolsOf(nganhSlug).map((t) => t.price_vnd));
}
