import type { Tool } from "./types";

export const NHAN_SU_TOOLS: Tool[] = [
  {
    id: "hr.labor-contract",
    slug: "hop-dong-lao-dong",
    nganh: "nhan-su",
    ten: "Hợp đồng lao động",
    tomTat: "Theo Bộ luật Lao động 2019",
    moTa:
      "Hợp đồng lao động đúng thể thức theo Bộ luật Lao động 2019: thông tin hai bên, công việc, thời hạn, lương và phụ cấp, thời giờ làm việc, bảo hiểm, điều khoản chấm dứt.",
    ext: "docx",
    thoiGian: [2, 4],
    price_vnd: 8_000,
    costCapUmd: 192_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    fields: [
      { kind: "text", name: "cong_ty", label: "Bên sử dụng lao động", placeholder: "tên công ty" },
      { kind: "text", name: "vi_tri", label: "Vị trí công việc", placeholder: "ví dụ: Nhân viên kinh doanh" },
      {
        kind: "segmented",
        name: "loai",
        label: "Loại hợp đồng",
        options: ["Xác định thời hạn", "Không xác định thời hạn", "Thử việc"],
        default: "Xác định thời hạn",
      },
      { kind: "text", name: "luong", label: "Mức lương", placeholder: "ví dụ: 12.000.000 đ/tháng" },
    ],
    nhanDuoc: [
      "Hợp đồng .docx đủ điều khoản bắt buộc",
      "Chừa sẵn chỗ điền thông tin cá nhân người lao động",
      "Phụ lục mô tả công việc",
    ],
    hoi: [
      {
        q: "Có thay thế được luật sư không?",
        a: "Không. Đây là bản nháp đúng thể thức, đủ điều khoản bắt buộc. Hợp đồng có điều khoản đặc thù thì nên nhờ luật sư đọc lại.",
      },
      {
        q: "Có cập nhật theo luật mới không?",
        a: "Thể thức theo Bộ luật Lao động 2019 và các văn bản hướng dẫn hiện hành. Luật thay đổi thì mẫu cũng được cập nhật theo.",
      },
    ],
  },
  {
    id: "hr.job-description",
    slug: "mo-ta-cong-viec",
    nganh: "nhan-su",
    ten: "Mô tả công việc",
    tomTat: "Yêu cầu, quyền lợi, khung năng lực",
    moTa:
      "Bản mô tả công việc để đăng tuyển: trách nhiệm chính, yêu cầu bắt buộc và ưu tiên, quyền lợi, và khung năng lực để phỏng vấn.",
    ext: "docx",
    thoiGian: [1, 2],
    price_vnd: 5_000,
    costCapUmd: 120_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    fields: [
      { kind: "text", name: "vi_tri", label: "Vị trí tuyển", placeholder: "ví dụ: Kế toán tổng hợp" },
      {
        kind: "segmented",
        name: "cap_do",
        label: "Cấp độ",
        options: ["Mới ra trường", "1–3 năm", "3–5 năm", "Quản lý"],
        default: "1–3 năm",
      },
      { kind: "text", name: "cong_ty", label: "Công ty", placeholder: "tên và lĩnh vực hoạt động" },
    ],
    nhanDuoc: [
      "Bản mô tả .docx sẵn để đăng tuyển",
      "Tách rõ yêu cầu bắt buộc và ưu tiên",
      "Khung năng lực kèm câu hỏi phỏng vấn gợi ý",
    ],
    hoi: [
      {
        q: "Có gợi ý mức lương không?",
        a: "Không tự đưa ra mức lương — thông tin đó phụ thuộc thị trường và ngân sách của bạn. Có chừa chỗ để bạn điền.",
      },
    ],
  },
];
