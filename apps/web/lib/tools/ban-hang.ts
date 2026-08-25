import type { Tool } from "./types";

export const BAN_HANG_TOOLS: Tool[] = [
  {
    id: "sal.quote",
    slug: "bao-gia-gui-khach",
    nganh: "ban-hang",
    ten: "Báo giá gửi khách",
    tomTat: "Có logo, điều khoản, hiệu lực",
    moTa:
      "Từ danh mục hàng hoá hoặc dịch vụ, dựng báo giá gọn gàng: bảng giá, chiết khấu, điều khoản thanh toán, thời hạn hiệu lực.",
    ext: "xlsx",
    thoiGian: [1, 3],
    price_vnd: 6_000,
    costCapUmd: 150_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".xlsx", ".csv", ".docx"],
    fields: [
      { kind: "text", name: "khach", label: "Gửi cho", placeholder: "ví dụ: Công ty CP Thương mại Z" },
      { kind: "text", name: "cong_ty", label: "Bên báo giá", placeholder: "tên công ty của bạn" },
      { kind: "stepper", name: "hieu_luc", label: "Hiệu lực", min: 7, max: 90, default: 30, unit: "ngày" },
    ],
    nhanDuoc: ["File .xlsx có công thức tính tổng", "Điều khoản thanh toán và giao hàng", "Chỗ điền logo và thông tin công ty"],
    hoi: [
      {
        q: "Có xuất được PDF không?",
        a: "File .xlsx mở bằng Excel rồi xuất PDF trong một bước. Trợ Thủ không xuất PDF trực tiếp để bạn còn sửa được trước khi gửi.",
      },
      {
        q: "Có nhớ bảng giá của tôi không?",
        a: "Chưa. Mỗi lần tạo phải tải danh mục lên. Tính năng lưu bảng giá đang trong kế hoạch.",
      },
    ],
  },
  {
    id: "sal.video-script",
    slug: "kich-ban-video-ngan",
    nganh: "ban-hang",
    ten: "Kịch bản video ngắn",
    tomTat: "Hook, phân cảnh, lời thoại cho TikTok / Reels",
    moTa:
      "Từ một chủ đề hoặc sản phẩm, dựng kịch bản video ngắn: câu mở đầu giữ chân người xem, phân cảnh theo giây, lời thoại và gợi ý hình ảnh.",
    ext: "docx",
    thoiGian: [1, 3],
    price_vnd: 5_000,
    costCapUmd: 120_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    fields: [
      { kind: "text", name: "chu_de", label: "Chủ đề hoặc sản phẩm", placeholder: "ví dụ: máy lọc nước gia đình" },
      { kind: "segmented", name: "do_dai", label: "Độ dài", options: ["15 giây", "30 giây", "60 giây"], default: "30 giây" },
      { kind: "segmented", name: "giong", label: "Giọng điệu", options: ["Thân thiện", "Chuyên gia", "Hài hước"], default: "Thân thiện" },
    ],
    nhanDuoc: ["Ba phương án câu mở đầu khác nhau", "Phân cảnh theo mốc giây", "Lời thoại và gợi ý hình ảnh từng cảnh"],
    hoi: [
      {
        q: "Có ba phương án câu mở đầu để làm gì?",
        a: "Câu mở đầu quyết định người xem có ở lại hay không. Có ba phương án để bạn thử và chọn cái hợp giọng mình.",
      },
    ],
  },
  {
    id: "sal.fanpage-post",
    slug: "bai-dang-fanpage",
    nganh: "ban-hang",
    ten: "Bài đăng Fanpage",
    tomTat: "Một chủ đề thành 5 bài khác góc nhìn",
    moTa:
      "Từ một chủ đề, viết năm bài đăng khác góc nhìn để đăng rải trong tuần mà không bị trùng lặp. Kèm gợi ý hình và thẻ.",
    ext: "docx",
    thoiGian: [1, 2],
    price_vnd: 5_000,
    costCapUmd: 120_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    fields: [
      { kind: "text", name: "chu_de", label: "Chủ đề", placeholder: "ví dụ: khuyến mãi đầu năm học" },
      { kind: "text", name: "doi_tuong", label: "Đối tượng", placeholder: "ví dụ: phụ huynh có con cấp 1" },
      { kind: "segmented", name: "do_dai", label: "Độ dài bài", options: ["Ngắn", "Vừa", "Dài"], default: "Vừa" },
    ],
    nhanDuoc: ["Năm bài đăng khác góc nhìn", "Gợi ý hình ảnh cho từng bài", "Gợi ý thẻ và câu kêu gọi hành động"],
    hoi: [
      {
        q: "Bài có bị trùng với người khác không?",
        a: "Nội dung sinh theo chủ đề và đối tượng bạn nhập, nên khác nhau giữa các lần. Nhưng vẫn nên đọc lại và thêm chi tiết riêng của cửa hàng mình.",
      },
    ],
  },
];
