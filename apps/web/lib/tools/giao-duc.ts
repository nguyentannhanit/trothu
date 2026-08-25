import type { Tool } from "./types";

// Giá lấy từ docs/adr/0004-pricing-and-unit-economics.md mục 3.
// costCapUmd = giá vốn ước tính × 1,5 (đệm cho lần chạy khó), đơn vị micro-USD.

const CAP_HOC = ["Tiểu học", "THCS", "THPT"];
const LOP = ["Lớp 1", "Lớp 2", "Lớp 3", "Lớp 4", "Lớp 5", "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"];
const MON = [
  "Toán", "Ngữ văn", "Tiếng Việt", "Tiếng Anh", "Khoa học tự nhiên", "Vật lí", "Hoá học", "Sinh học",
  "Lịch sử và Địa lí", "Lịch sử", "Địa lí", "Tin học", "Công nghệ", "GDCD", "Đạo đức",
  "Tự nhiên và Xã hội", "Âm nhạc", "Mĩ thuật",
];
const BO_SACH = ["Kết nối tri thức", "Chân trời sáng tạo", "Cánh Diều", "Không theo bộ nào"];

const truongLop = [
  { kind: "select" as const, name: "cap_hoc", label: "Cấp học", options: CAP_HOC, default: "THCS", width: 1 as const },
  { kind: "select" as const, name: "lop", label: "Lớp", options: LOP, default: "Lớp 8", width: 1 as const },
  { kind: "select" as const, name: "mon", label: "Môn", options: MON, default: "Ngữ văn", width: 1 as const },
];

export const GIAO_DUC_TOOLS: Tool[] = [
  {
    id: "edu.lecture-pptx",
    slug: "tao-bai-giang-powerpoint",
    nganh: "giao-duc",
    ten: "Tạo bài giảng PowerPoint",
    tomTat: "Từ giáo án hoặc chủ đề → deck 10–15 trang sửa được trong PowerPoint",
    moTa:
      "Đưa giáo án Word có sẵn, hoặc chỉ gõ tên bài. Nhận về file .pptx 10–15 trang có hình minh hoạ, bảng, sơ đồ và ghi chú cho giáo viên ở phần Speaker Notes. Mỗi dòng chữ, mỗi hình khối là một đối tượng PowerPoint thật — bấm vào là sửa được.",
    ext: "pptx",
    thoiGian: [10, 20],
    price_vnd: 45_000,
    costCapUmd: 1_200_000,
    model: "claude-haiku-4-5",
    freeEligible: false,
    accepts: [".docx", ".pdf", ".md", ".txt", ".pptx"],
    fields: [
      ...truongLop,
      { kind: "select", name: "bo_sach", label: "Bộ sách", options: BO_SACH, default: "Kết nối tri thức", width: 1 },
      { kind: "stepper", name: "so_trang", label: "Số trang", min: 6, max: 25, default: 13, unit: "trang" },
      { kind: "segmented", name: "thoi_luong", label: "Thời lượng tiết học", options: ["45 phút", "90 phút"], default: "45 phút" },
      { kind: "style", name: "kieu", label: "Kiểu trình bày", default: "Sáng, gọn" },
    ],
    addOns: [
      {
        name: "hinh_rieng",
        label: "Vẽ hình minh hoạ riêng cho bài này",
        hint: "Tắt đi thì dùng ảnh có sẵn từ thư viện miễn phí — vẫn đẹp, nhưng không riêng cho bài của bạn.",
        price_vnd: 8_000,
        default: true,
      },
    ],
    nhanDuoc: [
      "File .pptx mở bằng PowerPoint 2016 trở lên",
      "Chữ, hình, bảng, biểu đồ là đối tượng thật — bấm vào sửa được từng cái",
      "Ghi chú cho giáo viên ở phần Speaker Notes từng trang",
      "Hình minh hoạ theo đúng nội dung bài (nếu bật tuỳ chọn)",
    ],
    hoi: [
      {
        q: "Bài giảng có sửa được trong PowerPoint không?",
        a: "Được, và đây là điểm khác biệt chính. Mỗi dòng chữ, mỗi hình khối trong file là một đối tượng PowerPoint thật — bấm vào là sửa được, đổi màu được, kéo đi chỗ khác được. Không phải ảnh chụp ghép lại.",
      },
      {
        q: "Có bám theo sách giáo khoa đang dùng không?",
        a: "Cô chọn bộ sách khi tạo bài. Nếu tải giáo án của cô lên thì công cụ bám theo đúng nội dung trong đó, không tự bịa thêm phần ngoài bài.",
      },
      {
        q: "Máy tính ở trường cấu hình yếu có chạy được không?",
        a: "Được. Toàn bộ phần nặng chạy trên máy chủ, máy của cô chỉ mở trình duyệt. Bấm tạo xong có thể tắt máy, lúc quay lại file đã sẵn ở đó.",
      },
      {
        q: "Một bài giảng mất bao lâu?",
        a: "Khoảng 10 đến 20 phút cho bài 13 trang. Có hiển thị đang làm tới bước nào và còn bao lâu. Nếu đông người dùng cùng lúc thì phải xếp hàng, trang sẽ nói rõ trước bao nhiêu việc.",
      },
      {
        q: "Nếu bài giảng ra không dùng được thì sao?",
        a: "Báo lỗi trong 24 giờ là hoàn lại đầy đủ vào tài khoản, không cần giải thích. Cô cũng có thể yêu cầu vẽ lại riêng một trang mà không mất thêm tiền.",
      },
    ],
  },

  {
    id: "edu.lecture-from-template",
    slug: "bai-giang-tu-mau-co-san",
    nganh: "giao-duc",
    ten: "Bài giảng từ mẫu có sẵn",
    tomTat: "Điền nội dung vào mẫu dựng sẵn — rẻ hơn vì không vẽ lại bố cục",
    moTa:
      "Chọn một mẫu bài giảng đã dựng sẵn của Trợ Lý AI rồi điền nội dung bài của cô vào. Rẻ hơn ba lần so với vẽ mới hoàn toàn, vì bỏ được khâu tốn kém nhất là dựng bố cục từng trang. Đổi lại, bố cục bị ràng theo mẫu đã chọn.",
    ext: "pptx",
    thoiGian: [4, 7],
    price_vnd: 15_000,
    costCapUmd: 360_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".docx", ".pdf", ".md", ".txt"],
    fields: [
      ...truongLop,
      { kind: "select", name: "mau", label: "Mẫu bài giảng", options: ["Chuẩn 5 hoạt động", "Kể chuyện", "Nhiều hình", "Bảng biểu"], default: "Chuẩn 5 hoạt động", width: 2 },
      { kind: "stepper", name: "so_trang", label: "Số trang", min: 6, max: 18, default: 11, unit: "trang" },
    ],
    nhanDuoc: [
      "File .pptx theo mẫu đã chọn, sửa được trong PowerPoint",
      "Nội dung bám đúng bài của cô",
      "Rẻ hơn ba lần so với vẽ mới hoàn toàn",
    ],
    hoi: [
      {
        q: "Khác gì với Tạo bài giảng PowerPoint?",
        a: "Công cụ này điền nội dung vào bố cục có sẵn, nên rẻ và nhanh hơn nhiều. Công cụ kia dựng bố cục riêng cho từng bài, đẹp và hợp nội dung hơn nhưng đắt hơn ba lần.",
      },
      {
        q: "Có bao nhiêu mẫu để chọn?",
        a: "Hiện có bốn mẫu, hợp với bốn kiểu tiết học hay gặp. Mẫu mới thêm dần theo phản hồi.",
      },
    ],
  },

  {
    id: "edu.beautify-pptx",
    slug: "lam-dep-bai-giang-cu",
    nganh: "giao-duc",
    ten: "Làm đẹp bài giảng cũ",
    tomTat: "Giữ nguyên nội dung, dựng lại bố cục, phông chữ và màu",
    moTa:
      "Đưa file .pptx cũ của cô. Công cụ giữ nguyên toàn bộ nội dung chữ, dựng lại bố cục, phông chữ và bảng màu cho gọn và dễ nhìn hơn. Hợp với bài giảng làm từ nhiều năm trước hoặc bài tải về từ mạng.",
    ext: "pptx",
    thoiGian: [6, 12],
    price_vnd: 32_000,
    costCapUmd: 840_000,
    model: "claude-haiku-4-5",
    freeEligible: false,
    accepts: [".pptx"],
    fields: [
      { kind: "style", name: "kieu", label: "Kiểu trình bày mới", default: "Sáng, gọn" },
      { kind: "segmented", name: "giu_hinh", label: "Hình trong bài cũ", options: ["Giữ nguyên", "Thay mới"], default: "Giữ nguyên" },
    ],
    nhanDuoc: [
      "File .pptx mới, nội dung giữ nguyên từng chữ",
      "Bố cục, phông chữ, bảng màu dựng lại đồng bộ",
      "File cũ của cô không bị đụng tới",
    ],
    hoi: [
      {
        q: "Có mất nội dung không?",
        a: "Không. Công cụ chỉ dựng lại cách trình bày. Nếu thấy thiếu chữ nào so với bài gốc thì báo lỗi, hoàn tiền ngay.",
      },
    ],
  },

  {
    id: "edu.exam",
    slug: "soan-de-kiem-tra",
    nganh: "giao-duc",
    ten: "Soạn đề kiểm tra",
    tomTat: "Ma trận đề, đáp án và hướng dẫn chấm",
    moTa:
      "Ma trận đề theo bốn mức nhận thức, đề chính thức, đáp án và hướng dẫn chấm. Chọn được đề 15 phút, 45 phút hoặc đề học kỳ. Bám khung Chương trình giáo dục phổ thông 2018.",
    ext: "docx",
    thoiGian: [4, 8],
    price_vnd: 12_000,
    costCapUmd: 282_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".docx", ".pdf", ".md", ".txt"],
    fields: [
      ...truongLop,
      { kind: "segmented", name: "loai_de", label: "Loại đề", options: ["15 phút", "45 phút", "Học kỳ"], default: "45 phút" },
      { kind: "segmented", name: "hinh_thuc", label: "Hình thức", options: ["Trắc nghiệm", "Tự luận", "Kết hợp"], default: "Kết hợp" },
      { kind: "text", name: "pham_vi", label: "Phạm vi kiến thức", placeholder: "ví dụ: từ bài 1 đến bài 6, học kỳ I" },
    ],
    nhanDuoc: [
      "Ma trận đề theo bốn mức nhận thức",
      "Đề chính thức, dàn sẵn khổ A4",
      "Đáp án và hướng dẫn chấm chi tiết",
    ],
    hoi: [
      {
        q: "Đề có đúng ma trận theo quy định không?",
        a: "Ma trận theo bốn mức nhận thức (nhận biết, thông hiểu, vận dụng, vận dụng cao) như hướng dẫn hiện hành. Cô vẫn nên đọc lại và chỉnh tỉ lệ cho hợp với lớp mình.",
      },
      {
        q: "Có tự nghĩ ra câu hỏi sai kiến thức không?",
        a: "Có thể có. Đây là bản nháp chất lượng cao, không phải đề đã thẩm định. Luôn đọc lại đáp án trước khi in.",
      },
    ],
  },

  {
    id: "edu.lesson-plan",
    slug: "ke-hoach-bai-day",
    nganh: "giao-duc",
    ten: "Kế hoạch bài dạy",
    tomTat: "Giáo án theo mẫu Công văn 5512",
    moTa:
      "Giáo án theo mẫu Công văn 5512: mục tiêu, thiết bị dạy học, tiến trình bốn hoạt động, dự kiến sản phẩm học sinh. Điền sẵn theo bài và lớp cô chọn.",
    ext: "docx",
    thoiGian: [3, 5],
    price_vnd: 10_000,
    costCapUmd: 240_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".docx", ".pdf", ".md", ".txt"],
    fields: [
      ...truongLop,
      { kind: "text", name: "ten_bai", label: "Tên bài dạy", placeholder: "ví dụ: Lão Hạc" },
      { kind: "segmented", name: "thoi_luong", label: "Thời lượng", options: ["1 tiết", "2 tiết"], default: "1 tiết" },
    ],
    nhanDuoc: [
      "Giáo án .docx theo đúng thể thức Công văn 5512",
      "Bốn hoạt động: khởi động, hình thành kiến thức, luyện tập, vận dụng",
      "Dự kiến sản phẩm học sinh từng hoạt động",
    ],
    hoi: [
      {
        q: "Có đúng mẫu 5512 không?",
        a: "Đúng thể thức và đủ mục. Nội dung trong từng mục là bản nháp, cô đọc lại và chỉnh cho hợp lớp mình.",
      },
    ],
  },

  {
    id: "edu.worksheet",
    slug: "phieu-bai-tap",
    nganh: "giao-duc",
    ten: "Phiếu bài tập phân hoá",
    tomTat: "Ba mức độ cho ba nhóm học sinh, in A4 sẵn",
    moTa:
      "Cùng một nội dung chia làm ba mức độ cho ba nhóm học sinh trong lớp. Dàn sẵn khổ A4, in ra là phát được. Có đáp án riêng cho giáo viên.",
    ext: "docx",
    thoiGian: [3, 6],
    price_vnd: 9_000,
    costCapUmd: 210_000,
    model: "claude-haiku-4-5",
    freeEligible: true,
    accepts: [".docx", ".pdf", ".md", ".txt"],
    fields: [
      ...truongLop,
      { kind: "text", name: "noi_dung", label: "Nội dung bài tập", placeholder: "ví dụ: phép cộng phân số khác mẫu" },
      { kind: "stepper", name: "so_cau", label: "Số câu mỗi mức", min: 3, max: 15, default: 6, unit: "câu" },
    ],
    nhanDuoc: [
      "Ba phiếu cho ba nhóm trình độ",
      "Dàn sẵn khổ A4, in là dùng",
      "Đáp án riêng cho giáo viên",
    ],
    hoi: [
      {
        q: "Ba mức chia theo tiêu chí gì?",
        a: "Theo mức độ nhận thức: nhóm cần củng cố, nhóm đạt chuẩn, nhóm nâng cao. Cùng một nội dung kiến thức, khác độ khó và mức gợi ý.",
      },
    ],
  },
];
