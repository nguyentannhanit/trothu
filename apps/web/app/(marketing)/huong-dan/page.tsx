import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Icon, ICONS, Nut, The } from "@/components/ui";
import { NGANH, TOOLS, toolHref } from "@/lib/tools";

export const metadata = {
  title: "Hướng dẫn dùng Trợ Thủ",
  description: "Ba bước để tạo tệp đầu tiên, cách nạp tiền, và câu trả lời cho những thắc mắc hay gặp.",
  alternates: { canonical: "/huong-dan" },
};

const BUOC = [
  {
    so: "01",
    ten: "Chọn công cụ và nhập nội dung",
    moTa: "Vào trang ngành của bạn, chọn việc cần làm. Kéo thả file có sẵn — giáo án Word, sao kê Excel, hồ sơ PDF — hoặc chỉ gõ vài dòng yêu cầu. Không có biểu mẫu dài nào phải điền.",
  },
  {
    so: "02",
    ten: "Xem giá rồi mới bấm",
    moTa: "Cột bên phải hiện tổng tiền và số dư còn lại sau khi tạo. Bấm là trừ tiền và bắt đầu chạy. Đóng trình duyệt cũng được, việc vẫn chạy tiếp.",
  },
  {
    so: "03",
    ten: "Tải tệp về và sửa tiếp",
    moTa: "Xong thì tệp nằm trong mục Tệp đã tạo. Mở bằng Word, Excel hoặc PowerPoint có sẵn trên máy, sửa được từng chữ. Không ưng thì bấm báo lỗi trong 24 giờ để lấy lại tiền.",
  },
];

const HOI = [
  {
    q: "Tôi có phải cài phần mềm gì không?",
    a: "Không. Mọi thứ chạy trên trang web. Máy của bạn chỉ cần trình duyệt và một bộ Office để mở tệp kết quả.",
  },
  {
    q: "Máy cấu hình yếu có dùng được không?",
    a: "Được. Phần nặng chạy trên máy chủ. Máy của bạn chỉ hiển thị tiến trình.",
  },
  {
    q: "Đang chạy mà tắt máy thì sao?",
    a: "Việc vẫn chạy tiếp. Lúc quay lại, mở mục Tệp đã tạo là thấy kết quả. Không mất tiền, không phải làm lại.",
  },
  {
    q: "Tệp của tôi có bị dùng vào việc khác không?",
    a: "Không. Tệp nguồn bị xoá sau [SỐ] ngày, không dùng để huấn luyện mô hình, không chia sẻ cho bên thứ ba. Chi tiết ở trang Chính sách dữ liệu.",
  },
  {
    q: "Kết quả sai thì làm sao?",
    a: "Bấm báo lỗi trong 24 giờ, tiền hoàn lại vào tài khoản, không cần giải thích. Nếu chỉ hỏng một phần thì yêu cầu làm lại riêng phần đó, miễn phí.",
  },
  {
    q: "Có hỗ trợ trực tiếp không?",
    a: "Có. Nhắn Zalo theo số ở chân trang. Kèm mã việc (8 ký tự đầu) để tra nhanh hơn.",
  },
];

export default function TrangHuongDan() {
  return (
    <>
      <SiteHeader trang="huong-dan" />

      <section className="px-6 md:px-16 pt-14 pb-11">
        <h1 className="text-[36px] md:text-[42px] leading-tight font-extrabold tracking-[-0.035em] max-w-[20ch] text-balance">
          Ba bước, không có bước nào phải học
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-ink-2 max-w-[62ch]">
          Cả {TOOLS.length} công cụ trên Trợ Thủ đều chạy đúng ba bước này. Quen một cái là dùng được hết.
        </p>
      </section>

      <section className="px-6 md:px-16 pb-13">
        <div className="grid gap-3.5 md:grid-cols-3">
          {BUOC.map((b) => (
            <The key={b.so} className="p-6">
              <span className="inline-flex w-11 h-11 items-center justify-center rounded-[11px] bg-accent-soft font-mono text-sm font-medium text-accent mb-4">
                {b.so}
              </span>
              <h2 className="text-[16.5px] font-semibold tracking-[-0.015em] mb-2">{b.ten}</h2>
              <p className="text-sm leading-relaxed text-ink-2">{b.moTa}</p>
            </The>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 pb-13">
        <h2 className="text-[25px] font-bold tracking-[-0.025em] mb-4.5">Bắt đầu từ ngành của bạn</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NGANH.map((n) => (
            <Link key={n.id} href={`/${n.slug}`}>
              <The className="p-5 h-full hover:border-line-strong transition-colors">
                <span
                  className="inline-flex w-9 h-9 items-center justify-center rounded-[10px] mb-3.5"
                  style={{ background: `${n.mau}18`, color: n.mau }}
                >
                  <Icon d={n.icon} size={18} />
                </span>
                <h3 className="text-[15.5px] font-semibold tracking-[-0.015em] mb-1.5">{n.ten}</h3>
                <p className="text-[13.5px] leading-relaxed text-ink-3">{n.moTa}</p>
              </The>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 pb-13">
        <h2 className="text-[25px] font-bold tracking-[-0.025em] mb-5">Câu hỏi hay gặp</h2>
        <div className="grid gap-3.5 md:grid-cols-2">
          {HOI.map((h) => (
            <The key={h.q} className="px-5.5 py-5">
              <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] mb-2">{h.q}</h3>
              <p className="text-sm leading-relaxed text-ink-2">{h.a}</p>
            </The>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-16 pb-14">
        <The className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-8 rounded-2xl">
          <div>
            <h2 className="text-[22px] font-bold tracking-[-0.025em] mb-1.5">Vẫn chưa rõ chỗ nào?</h2>
            <p className="text-[14.5px] text-ink-2">
              Nhắn Zalo, chúng tôi trả lời trong giờ hành chính. Hoặc cứ làm thử một việc miễn phí cho biết.
            </p>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <Nut kieu="chinh" href={toolHref(TOOLS[3])}>
              Làm thử miễn phí
            </Nut>
            <Nut kieu="vien" href="/gia">
              <Icon d={ICONS.info} size={16} />
              Bảng giá
            </Nut>
          </div>
        </The>
      </section>

      <SiteFooter />
    </>
  );
}
