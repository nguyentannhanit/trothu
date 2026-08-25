"use client";

import { Icon, ICONS, The } from "./ui";

export function TestimonialsSection() {
  const reviews = [
    {
      id: 1,
      name: "Cô Nguyễn Thị Mai",
      role: "Giáo viên Địa lý THCS — Hà Nội",
      avatarBg: "bg-indigo-600",
      avatarInitial: "M",
      quote:
        "Trước đây để chuẩn bị 1 tiết bài giảng điện tử PowerPoint kèm câu hỏi trắc nghiệm tôi mất nguyên cả buổi tối. Từ ngày dùng Trợ Lý AI, tôi chỉ cần gõ tên tiết dạy bám sách Kết Nối 2018 là có ngay slide PPTX 14 trang hình ảnh đẹp mắt, về chỉnh sửa thêm bớt cực nhanh.",
      tag: "🎓 Ngành Giáo dục",
    },
    {
      id: 2,
      name: "Anh Trần Văn Hùng",
      role: "Kế toán trưởng Công ty Xây dựng — Đà Nẵng",
      avatarBg: "bg-emerald-600",
      avatarInitial: "H",
      quote:
        "Bảng sao kê ngân hàng hơn 800 dòng mỗi tháng chạy đối soát thủ công rất dễ sót. Tool đối soát trên Trợ Lý AI tô màu sẵn các dòng chênh lệch tiền chỉ trong 2 phút. Phí 12k/lượt quá rẻ so với công sức bỏ ra.",
      tag: "📊 Ngành Kế toán",
    },
    {
      id: 3,
      name: "Chị Lê Thị Thanh Thảo",
      role: "Trưởng phòng Hành chính Nhân sự — TP. Hồ Chí Minh",
      avatarBg: "bg-purple-600",
      avatarInitial: "T",
      quote:
        "Tạo hợp đồng lao động thử việc hay chính thức cho nhân viên mới chỉ cần gõ thông tin là ra file Word A4 chuẩn Bộ luật lao động 2019. Rất thích mô hình nạp tiền trước dùng dần, không bị âm thầm trừ phí gia hạn như dịch vụ khác.",
      tag: "💼 Ngành Nhân sự",
    },
  ];

  return (
    <section className="px-6 md:px-12 py-16 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
          ĐÁNH GIÁ TỪ NGƯỜI DÙNG THỰC TẾ
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Hơn 2,000+ thầy cô & dân văn phòng tin dùng
        </h2>
        <p className="text-sm sm:text-base text-ink-3 mt-2 font-medium">
          Lắng nghe chia sẻ từ những người làm công việc giấy tờ hằng ngày trên khắp Việt Nam.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {reviews.map((r) => (
          <The
            key={r.id}
            className="p-6 flex flex-col justify-between border-2 border-line-strong hover:border-accent hover-float active-press bg-surface"
          >
            <div>
              {/* Star rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex text-amber-400 gap-1 text-base">
                  {"★★★★★"}
                </div>
                <span className="text-[11px] font-bold text-accent bg-accent-soft px-2.5 py-1 rounded-full border border-accent-line">
                  {r.tag}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-ink-2 italic mb-6">
                "{r.quote}"
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-line-strong">
              <div className={`w-10 h-10 rounded-full ${r.avatarBg} text-white font-extrabold flex items-center justify-center text-sm shadow-sm`}>
                {r.avatarInitial}
              </div>
              <div>
                <div className="text-sm font-extrabold text-ink">{r.name}</div>
                <div className="text-xs text-ink-4 font-medium">{r.role}</div>
              </div>
            </div>
          </The>
        ))}
      </div>
    </section>
  );
}
