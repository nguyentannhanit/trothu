import type { Tool } from "./types";

export const XAY_DUNG_TOOLS: Tool[] = [
  {
    id: "con.progress-report",
    slug: "bao-cao-tien-do-tuan",
    nganh: "xay-dung",
    ten: "Báo cáo tiến độ tuần",
    tomTat: "Gộp nhật ký công trường thành báo cáo gửi chủ đầu tư",
    moTa:
      "Đưa nhật ký thi công trong tuần, kèm ảnh hiện trường nếu có. Nhận về báo cáo tiến độ đúng thể thức gửi chủ đầu tư: khối lượng đã làm, so với kế hoạch, vướng mắc và đề xuất.",
    ext: "docx",
    thoiGian: [5, 9],
    price_vnd: 13_000,
    costCapUmd: 312_000,
    model: "claude-haiku-4-5",
    freeEligible: false,
    accepts: [".docx", ".xlsx", ".pdf", ".jpg", ".png"],
    fields: [
      { kind: "text", name: "cong_trinh", label: "Tên công trình", placeholder: "ví dụ: Nhà máy X — hạng mục nhà xưởng số 2" },
      { kind: "text", name: "tuan", label: "Tuần báo cáo", placeholder: "ví dụ: tuần 34, từ 17/08 đến 23/08/2026" },
      { kind: "segmented", name: "dinh_dang", label: "Định dạng", options: ["Văn bản", "Trình chiếu"], default: "Văn bản" },
    ],
    nhanDuoc: ["Báo cáo .docx đúng thể thức gửi chủ đầu tư", "Bảng khối lượng thực hiện so với kế hoạch", "Mục vướng mắc và kiến nghị"],
    hoi: [
      {
        q: "Có chèn được ảnh hiện trường không?",
        a: "Có. Tải ảnh lên cùng nhật ký, công cụ chèn vào đúng mục và đánh số thứ tự.",
      },
      {
        q: "Khối lượng có tự tính không?",
        a: "Chỉ tổng hợp lại từ số bạn đưa vào. Không tự đo, không tự suy ra khối lượng.",
      },
    ],
  },
  {
    id: "con.cost-explanation",
    slug: "thuyet-minh-du-toan",
    nganh: "xay-dung",
    ten: "Thuyết minh dự toán",
    tomTat: "Diễn giải khối lượng và đơn giá",
    moTa:
      "Đưa bảng dự toán. Nhận về bản thuyết minh: căn cứ lập, cách xác định khối lượng, cơ sở đơn giá, và giải trình các khoản chi phí lớn.",
    ext: "docx",
    thoiGian: [4, 8],
    price_vnd: 13_000,
    costCapUmd: 312_000,
    model: "claude-haiku-4-5",
    freeEligible: false,
    accepts: [".xlsx", ".pdf", ".docx"],
    fields: [
      { kind: "text", name: "cong_trinh", label: "Tên công trình", placeholder: "ví dụ: Cải tạo trụ sở UBND xã Y" },
      { kind: "text", name: "can_cu", label: "Căn cứ lập dự toán", placeholder: "ví dụ: đơn giá tỉnh, định mức 1329" },
    ],
    nhanDuoc: ["Thuyết minh .docx theo bố cục hồ sơ dự toán", "Giải trình các khoản chi phí lớn", "Mục căn cứ pháp lý điền sẵn"],
    hoi: [
      {
        q: "Có tự tra đơn giá không?",
        a: "Không. Công cụ chỉ diễn giải bảng dự toán bạn đưa vào. Đơn giá và định mức vẫn do bạn chịu trách nhiệm.",
      },
      {
        q: "Có đúng thể thức hồ sơ thẩm tra không?",
        a: "Bố cục theo thông lệ hồ sơ dự toán. Cơ quan thẩm tra mỗi nơi yêu cầu hơi khác, nên đọc lại và chỉnh cho hợp.",
      },
    ],
  },
  {
    id: "con.acceptance-record",
    slug: "bien-ban-nghiem-thu",
    nganh: "xay-dung",
    ten: "Biên bản nghiệm thu",
    tomTat: "Điền theo mẫu chuẩn, đúng trình tự hồ sơ",
    moTa:
      "Từ nhật ký thi công và ảnh hiện trường, điền vào mẫu biên bản nghiệm thu chuẩn: thành phần tham gia, nội dung nghiệm thu, kết luận và kiến nghị.",
    ext: "docx",
    thoiGian: [3, 6],
    price_vnd: 11_000,
    costCapUmd: 264_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".docx", ".pdf", ".jpg", ".png"],
    fields: [
      { kind: "text", name: "hang_muc", label: "Hạng mục nghiệm thu", placeholder: "ví dụ: cốt thép móng trục A-C" },
      { kind: "segmented", name: "loai", label: "Loại nghiệm thu", options: ["Công việc", "Giai đoạn", "Hoàn thành"], default: "Công việc" },
      { kind: "text", name: "thanh_phan", label: "Thành phần tham gia", placeholder: "ví dụ: chủ đầu tư, tư vấn giám sát, nhà thầu thi công", multiline: true },
    ],
    nhanDuoc: ["Biên bản .docx đúng mẫu, chừa sẵn chỗ ký", "Mục nội dung nghiệm thu điền theo hạng mục", "Phụ lục ảnh hiện trường nếu có tải lên"],
    hoi: [
      {
        q: "Mẫu theo văn bản nào?",
        a: "Bố cục theo mẫu biên bản nghiệm thu thông dụng hiện hành. Nếu đơn vị bạn có mẫu riêng, tải mẫu đó lên và công cụ điền theo.",
      },
      {
        q: "Có ký số được không?",
        a: "File .docx bình thường, bạn ký số bằng công cụ vẫn dùng. Trợ Thủ không xử lý chữ ký số.",
      },
    ],
  },
];
