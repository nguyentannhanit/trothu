import type { Tool } from "./types";

const KY = { kind: "segmented" as const, name: "ky", label: "Kỳ", options: ["Tháng", "Quý", "Năm"], default: "Tháng" };

export const KE_TOAN_TOOLS: Tool[] = [
  {
    id: "acc.financial-report",
    slug: "bao-cao-tai-chinh",
    nganh: "ke-toan",
    ten: "Báo cáo tài chính",
    tomTat: "Thuyết minh biến động theo kỳ",
    moTa:
      "Đưa số liệu kỳ này và kỳ trước. Nhận về bản thuyết minh biến động: khoản nào tăng giảm bao nhiêu, vì sao, và điều gì cần giải trình với lãnh đạo.",
    ext: "docx",
    thoiGian: [4, 7],
    price_vnd: 14_000,
    costCapUmd: 336_000,
    model: "claude-haiku-4-5",
    freeEligible: false,
    accepts: [".xlsx", ".csv", ".pdf"],
    fields: [
      KY,
      { kind: "text", name: "don_vi", label: "Tên đơn vị", placeholder: "ví dụ: Công ty TNHH ABC" },
      { kind: "segmented", name: "muc_do", label: "Mức chi tiết", options: ["Tóm tắt", "Đầy đủ"], default: "Đầy đủ" },
    ],
    nhanDuoc: ["Bản thuyết minh .docx theo kỳ", "Bảng so sánh kỳ này với kỳ trước", "Ghi chú khoản cần giải trình"],
    hoi: [
      {
        q: "Có tự tính lại số liệu không?",
        a: "Không. Công cụ chỉ diễn giải số liệu bạn đưa vào. Số sai từ đầu vào thì báo cáo cũng sai — luôn đối chiếu lại trước khi nộp.",
      },
      {
        q: "Có đúng chuẩn mực kế toán Việt Nam không?",
        a: "Thể thức và cách diễn giải theo thông lệ VAS. Đây là bản nháp cho người có nghiệp vụ đọc lại, không thay thế kế toán trưởng.",
      },
    ],
  },
  {
    id: "acc.reconcile",
    slug: "doi-soat-sao-ke",
    nganh: "ke-toan",
    ten: "Đối soát sao kê",
    tomTat: "Khớp sao kê ngân hàng với sổ quỹ, chỉ ra khoản lệch",
    moTa:
      "Đưa file sao kê ngân hàng và sổ quỹ. Nhận về bảng đối soát: khoản nào đã khớp, khoản nào chỉ có một bên, khoản nào lệch số tiền — kèm gợi ý nguyên nhân.",
    ext: "xlsx",
    thoiGian: [2, 5],
    price_vnd: 12_000,
    costCapUmd: 288_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".xlsx", ".csv", ".pdf"],
    fields: [
      KY,
      { kind: "segmented", name: "chieu", label: "Ưu tiên đối chiếu", options: ["Theo số tiền", "Theo nội dung", "Cả hai"], default: "Cả hai" },
    ],
    nhanDuoc: ["File .xlsx nhiều sheet: đã khớp, chưa khớp, lệch", "Cột ghi chú nguyên nhân từng khoản lệch", "Tổng hợp số dư hai bên"],
    hoi: [
      {
        q: "Sao kê dạng PDF có đọc được không?",
        a: "Đọc được nếu là PDF có chữ thật. PDF là ảnh chụp thì kết quả kém — nên xuất sao kê dạng Excel hoặc CSV từ ngân hàng.",
      },
      {
        q: "Dữ liệu ngân hàng của tôi có an toàn không?",
        a: "File bị xoá sau [SỐ] ngày, không dùng để huấn luyện, không chia sẻ cho bên thứ ba. Xem Chính sách dữ liệu.",
      },
    ],
  },
  {
    id: "acc.payroll",
    slug: "bang-luong-thang",
    nganh: "ke-toan",
    ten: "Bảng lương tháng",
    tomTat: "Lương, BHXH, thuế TNCN từ bảng chấm công",
    moTa:
      "Đưa bảng chấm công và mức lương. Nhận về bảng lương đầy đủ: lương thực tế, phụ cấp, các khoản trích BHXH, thuế thu nhập cá nhân, thực lĩnh.",
    ext: "xlsx",
    thoiGian: [2, 4],
    price_vnd: 10_000,
    costCapUmd: 240_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".xlsx", ".csv"],
    fields: [
      { kind: "text", name: "thang", label: "Tháng", placeholder: "ví dụ: 08/2026" },
      { kind: "segmented", name: "bhxh", label: "Trích BHXH", options: ["Có", "Không"], default: "Có" },
      { kind: "segmented", name: "tncn", label: "Tính thuế TNCN", options: ["Có", "Không"], default: "Có" },
    ],
    nhanDuoc: ["File .xlsx có công thức, sửa được", "Cột BHXH, BHYT, BHTN tách bạch", "Bảng tính thuế TNCN theo biểu luỹ tiến"],
    hoi: [
      {
        q: "Tỉ lệ trích có cập nhật theo quy định mới không?",
        a: "Tỉ lệ lấy theo quy định hiện hành tại thời điểm chạy. Vẫn phải đối chiếu lại — quy định thay đổi thường xuyên và trách nhiệm cuối cùng là của kế toán.",
      },
      {
        q: "Có tính được lương theo sản phẩm không?",
        a: "Được, nếu bảng chấm công của bạn có cột sản lượng. Ghi rõ cách tính trong ô ghi chú khi tạo.",
      },
    ],
  },
];
