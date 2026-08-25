import { SiteFooter, SiteHeader } from "@/components/site-chrome";

export const metadata = {
  title: "Chính Sách Bảo Mật Dữ Liệu — Trợ Lý AI",
  description: "Cam kết bảo mật thông tin và dữ liệu tài liệu cá nhân của người dùng trên Trợ Lý AI.",
};

export default function ChinhSachDuLieuPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-6 md:px-12 py-12 max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink mb-3">
          Chính Sách Bảo Mật Dữ Liệu & Tài Liệu
        </h1>
        <p className="text-sm text-ink-3 mb-8">
          Cập nhật lần cuối: Ngày 25 tháng 08 năm 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed text-ink-2">
          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">1. Nguyên Tắc Bảo Mật Tuyệt Đối</h2>
            <p>
              Trợ Lý AI thấu hiểu rằng tài liệu giáo án, sao kê tài chính, biên bản nghiệm thu hay hợp đồng lao động đều chứa thông tin nhạy cảm. Chúng tôi cam kết <b>không bao giờ chia sẻ, bán hoặc sử dụng dữ liệu của bạn cho bất kỳ bên thứ ba nào</b>.
            </p>
          </section>

          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">2. Tự Động Xóa File Sau Khi Tải Về</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Mọi file tài liệu bạn tải lên hoặc máy tạo ra sẽ được mã hóa trên đường truyền SSL/TLS.</li>
              <li>Hệ thống lưu trữ tạm thời trong vòng 7 ngày để bạn có thể tải lại file nếu lỡ làm mất, sau đó hệ thống tự động xóa sạch hoàn toàn khỏi máy chủ.</li>
            </ul>
          </section>

          <section className="bg-surface border-2 border-line-strong rounded-2xl p-6 shadow-c1">
            <h2 className="text-lg font-bold text-ink mb-3">3. Không Dùng Dữ Liệu Cá Nhân Để Huấn Luyện AI</h2>
            <p>
              Nội dung thông tin cá nhân và tài liệu của bạn được tách biệt và xử lý độc lập, tuyệt đối không bị đưa vào tập dữ liệu dùng để huấn luyện các mô hình AI công khai.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
