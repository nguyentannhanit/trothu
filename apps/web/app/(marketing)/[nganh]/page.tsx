import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { DuongDan, SiteFooter, SiteHeader } from "@/components/site-chrome";
import { Icon, ICONS, NhanTep, Nut, The, Tien } from "@/components/ui";
import { NGANH, getNganh, reNhat, toolHref, toolsOf } from "@/lib/tools";
import { khoangThoiGian, vnd } from "@/lib/format";

export function generateStaticParams() {
  return NGANH.map((n) => ({ nganh: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ nganh: string }> }): Promise<Metadata> {
  const n = getNganh((await params).nganh);
  if (!n) return {};
  const so = toolsOf(n.slug).length;
  return {
    title: `Công cụ cho ngành ${n.ten}`,
    description: `${so} công cụ xử lý giấy tờ cho ngành ${n.ten}. ${n.moTa} Đầu ra là file gốc sửa được, giá từ ${vnd(reNhat(n.slug))} một lần.`,
    alternates: { canonical: `/${n.slug}` },
  };
}

export default async function TrangNganh({ params }: { params: Promise<{ nganh: string }> }) {
  const nganh = getNganh((await params).nganh);
  if (!nganh) notFound();
  const congCu = toolsOf(nganh.slug);
  const laGiaoDuc = nganh.slug === "giao-duc";

  return (
    <>
      <SiteHeader trang="cong-cu" />

      <section className="px-6 md:px-16 pt-10 pb-11">
        <DuongDan muc={[{ nhan: "Trang chủ", href: "/" }, { nhan: nganh.ten }]} />

        <div className="grid gap-14 lg:grid-cols-[1.25fr_0.75fr] items-start mt-5">
          <div>
            <h1 className="text-[34px] md:text-[42px] leading-[1.12] font-extrabold tracking-[-0.035em] text-balance">
              {laGiaoDuc ? (
                <>
                  Công cụ soạn bài giảng
                  <br />
                  và hồ sơ dạy học
                </>
              ) : (
                <>Công cụ cho ngành {nganh.ten}</>
              )}
            </h1>
            <p className="mt-4.5 text-[16.5px] leading-relaxed text-ink-2">
              {congCu.length} công cụ dành riêng cho ngành {nganh.ten.toLowerCase()}. {nganh.moTa}
            </p>
            <p className="mt-3.5 text-[16.5px] leading-relaxed text-ink-2">
              Đầu ra là file <strong className="font-semibold">gốc</strong> — mở bằng Word, Excel hoặc PowerPoint có sẵn
              trên máy, sửa được từng chữ, từng ô. Không phải ảnh, không phải PDF khoá, không cần cài thêm phần mềm nào.
            </p>
          </div>

          <The className="p-5.5">
            <div className="text-[14.5px] font-semibold mb-4">Ngành {nganh.tenNgan} trên Trợ Thủ</div>
            <div className="flex flex-col gap-3">
              {[
                { ten: "Công cụ", giaTri: String(congCu.length) },
                { ten: "Rẻ nhất", giaTri: vnd(reNhat(nganh.slug)) },
                { ten: "Hồ sơ đã tạo", giaTri: "[N]" },
              ].map((s) => (
                <div key={s.ten} className="flex items-baseline justify-between pb-3 border-b border-line last:border-0">
                  <span className="text-[13.5px] text-ink-3">{s.ten}</span>
                  <span className="font-mono text-[15px] font-semibold tabular">{s.giaTri}</span>
                </div>
              ))}
            </div>
            <Nut kieu="chinh" href="/dang-nhap" className="w-full mt-4">
              Làm thử bài đầu — miễn phí
            </Nut>
          </The>
        </div>
      </section>

      <section className="px-6 md:px-16 pb-13">
        <h2 className="text-[25px] font-bold tracking-[-0.025em] mb-4.5">
          {congCu.length} công cụ cho ngành {nganh.tenNgan.toLowerCase()}
        </h2>
        <div className="flex flex-col gap-3">
          {congCu.map((t) => (
            <The key={t.id} className="grid gap-5.5 md:grid-cols-[46px_1fr_190px_132px] items-center px-5.5 py-5">
              <span className={`inline-flex w-11.5 h-11.5 items-center justify-center rounded-lg ${t.ext === "pptx" ? "bg-pptx-bg" : t.ext === "xlsx" ? "bg-xlsx-bg" : "bg-docx-bg"}`}>
                <NhanTep ext={t.ext} />
              </span>
              <div>
                <h3 className="text-[17px] font-semibold tracking-[-0.015em] mb-1">{t.ten}</h3>
                <p className="text-sm leading-relaxed text-ink-3 max-w-[62ch]">{t.moTa}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[13px] text-ink-4">{khoangThoiGian(t.thoiGian)}</span>
                <Tien n={t.price_vnd} co="lg" />
              </div>
              <Nut kieu="phu" href={toolHref(t)}>
                Dùng ngay
              </Nut>
            </The>
          ))}
        </div>
      </section>

      {laGiaoDuc && <TheoCapHoc />}

      <section className="px-6 md:px-16 pb-13">
        <h2 className="text-[25px] font-bold tracking-[-0.025em] mb-5">Câu hỏi hay gặp</h2>
        <div className="grid gap-3.5 md:grid-cols-2">
          {congCu
            .flatMap((t) => t.hoi.slice(0, 1).map((h) => ({ ...h, tool: t.ten })))
            .slice(0, 6)
            .map((h) => (
              <The key={h.q} className="px-5.5 py-5">
                <h3 className="text-[15.5px] font-semibold tracking-[-0.01em] mb-2">{h.q}</h3>
                <p className="text-sm leading-relaxed text-ink-2">{h.a}</p>
              </The>
            ))}
        </div>
      </section>

      <section className="px-6 md:px-16 pb-13">
        <div className="bg-ink text-white rounded-3xl px-8 md:px-12 py-11 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <h2 className="text-[30px] leading-tight font-bold tracking-[-0.03em] mb-3">
              Làm thử một việc, không mất tiền
            </h2>
            <p className="text-[15.5px] leading-relaxed text-white/60 max-w-[48ch]">
              Việc đầu tiên miễn phí. Tải file về, mở trong Word hoặc PowerPoint, sửa thử vài chữ — thấy dùng được rồi
              hãy nạp tiền.
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
            <Nut kieu="trang" co="lg" href="/dang-nhap" className="w-full">
              Bắt đầu miễn phí
            </Nut>
            <Link
              href="/gia"
              className="w-full h-12 inline-flex items-center justify-center rounded-md border border-white/20 text-[14.5px] font-medium hover:bg-white/5"
            >
              Xem bảng giá
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 pb-14">
        <div className="text-[13px] text-ink-4 mb-3">Tìm nhiều nhất trong ngành {nganh.tenNgan}</div>
        <div className="flex flex-wrap gap-2">
          {congCu.map((t) => (
            <Link
              key={t.id}
              href={toolHref(t)}
              className="text-[13px] text-ink-3 border border-line rounded-full px-3.5 py-1.5 hover:border-accent hover:text-accent"
            >
              {t.ten.toLowerCase()}
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </>
  );
}

const CAP_HOC = [
  {
    ten: "Tiểu học",
    lop: "Lớp 1–5",
    mon: ["Toán", "Tiếng Việt", "Tự nhiên và Xã hội", "Đạo đức", "Khoa học", "Lịch sử và Địa lí", "Tin học", "Công nghệ"],
  },
  {
    ten: "THCS",
    lop: "Lớp 6–9",
    mon: ["Toán", "Ngữ văn", "Khoa học tự nhiên", "Lịch sử và Địa lí", "Tiếng Anh", "GDCD", "Tin học", "Công nghệ", "Âm nhạc", "Mĩ thuật"],
  },
  {
    ten: "THPT",
    lop: "Lớp 10–12",
    mon: ["Toán", "Ngữ văn", "Vật lí", "Hoá học", "Sinh học", "Lịch sử", "Địa lí", "Tiếng Anh", "Tin học", "Giáo dục kinh tế và pháp luật"],
  },
];

function TheoCapHoc() {
  return (
    <section className="px-6 md:px-16 pb-13">
      <h2 className="text-[25px] font-bold tracking-[-0.025em] mb-1.5">Chọn theo cấp học và môn</h2>
      <p className="text-[15px] text-ink-3 mb-5">
        Chọn cấp và môn ngay trong màn tạo — công cụ tự điều chỉnh bố cục và cách trình bày cho hợp đặc thù môn đó.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {CAP_HOC.map((k) => (
          <The key={k.ten} className="p-5.5">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-[16.5px] font-semibold tracking-[-0.015em]">{k.ten}</span>
              <span className="font-mono text-xs text-ink-5">{k.lop}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {k.mon.map((m) => (
                <span key={m} className="text-[13px] text-ink-2 bg-surface-3 rounded-full px-3 py-1.5">
                  {m}
                </span>
              ))}
            </div>
          </The>
        ))}
      </div>
      <p className="mt-4 text-[13px] text-ink-4 flex items-center gap-2">
        <Icon d={ICONS.info} size={15} />
        Mỗi môn sẽ có trang riêng khi thư viện bài giảng mở — xem docs/seo-plan.md mục 4.
      </p>
    </section>
  );
}
