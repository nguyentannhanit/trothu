import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Điều Khoản Sử Dụng — Trợ Thủ",
  description: "Quy định sử dụng dịch vụ và chính sách thanh toán, hoàn tiền của Trợ Thủ.",
};

export default function DieuKhoanPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-3">
          Điều Khoản Sử Dụng Dịch Vụ
        </h1>
        <p className="text-sm text-ink-3 mb-8">
          Cập nhật lần cuối: Ngày 25 tháng 08 năm 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-ink-2">
          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">1. Nguyên Tắc Hoạt Động & Mô Hình Nạp Tiền</h2>
            <p className="mb-2">
              Trợ Thủ cung cấp dịch vụ công cụ AI hỗ trợ xử lý giấy tờ và công việc nghiệp vụ theo mô hình <b>nạp tiền trước, dùng dần theo từng lượt</b>.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Không thu phí đăng ký thuê bao hàng tháng.</li>
              <li>Số tiền người dùng nạp vào tài khoản có hạn dùng vĩnh viễn và không bị tự động trừ phí khi không sử dụng.</li>
              <li>Mỗi công cụ đều hiển thị rõ số tiền trừ trực tiếp trên mỗi lượt thực hiện thành công.</li>
            </ul>
          </section>

          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">2. Cam Kết Hoàn Tiền 100% Khi Chạy Lỗi</h2>
            <p className="mb-2">
              Trong trường hợp hệ thống xảy ra sự cố kỹ thuật dẫn đến không tạo ra file hoặc file trả về bị hỏng cấu trúc không mở được:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Hệ thống tự động kiểm tra và hoàn trả 100% số tiền của lượt đó lại vào tài khoản người dùng ngay lập tức.</li>
              <li>Người dùng có thể liên hệ Zalo CSKH để được trợ giúp nếu gặp bất kỳ vướng mắc nào.</li>
            </ul>
          </section>

          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">3. Quyền Sở Hữu Tài Liệu Đã Xuất</h2>
            <p>
              Mọi tệp tin (.docx, .xlsx, .pptx) được tạo ra bởi Trợ Thủ thuộc quyền sở hữu toàn quyền của người dùng. Người dùng có thể tự do sao chép, chỉnh sửa, lưu trữ hoặc thương mại hóa tài liệu của mình mà không cần trả thêm phí bản quyền.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
