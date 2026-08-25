import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import { DongTich, Icon, ICONS, NhanTep, Nut, The, Tien, cx } from "@/components/ui";
import { NGANH, toolHref, toolsOf } from "@/lib/tools";
import { khoangThoiGian, vnd } from "@/lib/format";

export const metadata = {
  title: "Bảng giá — trả theo lượt dùng, không thuê bao",
  description:
    "Giá từng công cụ ghi rõ, nạp trước dùng dần, tiền không hết hạn. Chạy hỏng được hoàn lại vào tài khoản.",
  alternates: { canonical: "/gia" },
};

const GOI = [
  { ten: "Dùng thử", tien: 50_000, nhan: 50_000, noiBat: false, nhanTang: "", vd: ["1 bài giảng", "hoặc 5 phiếu bài tập"] },
  { ten: "Một tháng dạy", tien: 100_000, nhan: 100_000, noiBat: false, nhanTang: "", vd: ["2 bài giảng", "hoặc 8 đề kiểm tra"] },
  { ten: "Một học kỳ", tien: 300_000, nhan: 315_000, noiBat: true, nhanTang: "Tặng 5% — hay chọn nhất", vd: ["7 bài giảng", "hoặc 21 mẫu có sẵn"] },
  { ten: "Cả năm học", tien: 500_000, nhan: 550_000, noiBat: false, nhanTang: "Tặng 10%", vd: ["12 bài giảng", "hoặc 35 mẫu có sẵn"] },
];

const HOI = [
  {
    q: "Tiền nạp có hết hạn không?",
    a: "Không. Tiền nằm trong tài khoản cho tới khi dùng hết. Không có gói tháng, không tự động trừ tiền, không cần nhớ huỷ.",
  },
  {
    q: "Tạo ra không dùng được thì sao?",
    a: "Báo lỗi trong 24 giờ là hoàn lại đầy đủ vào tài khoản, không cần giải thích. Nếu chỉ hỏng một trang thì yêu cầu làm lại riêng phần đó, miễn phí.",
  },
  {
    q: "Có rút tiền ra được không?",
    a: "Không rút ra tiền mặt. Trước khi nạp mức lớn, nên nạp 50.000₫ làm thử vài việc xem có hợp không đã.",
  },
  {
    q: "Trả bằng cách nào?",
    a: "Chuyển khoản ngân hàng bằng mã QR — tiền vào tài khoản trong khoảng 1 phút, không mất phí. Ví MoMo sẽ có sau.",
  },
  {
    q: "Có hoá đơn cho cơ quan không?",
    a: "Có. Nhắn Zalo hỗ trợ kèm thông tin đơn vị, chúng tôi xuất hoá đơn cho phần đã nạp.",
  },
  {
    q: "Vì sao mỗi công cụ một giá khác nhau?",
    a: "Vì chi phí máy tính khác nhau thật. Bài giảng phải dựng từng trang nên tốn hơn nhiều so với soạn một phiếu bài tập bằng chữ. Giá ở đây bám theo chi phí thật, không phải đặt bừa.",
  },
];

export default function TrangGia() {
  return (
    <>
      <SiteHeader trang="gia" />

      <section className="px-6 md:px-16 pt-14 pb-10 text-center">
        <h1 className="mx-auto max-w-[22ch] text-[36px] md:text-[44px] leading-[1.1] font-extrabold tracking-[-0.035em]">
          Trả theo lượt dùng.
          <br />
          Không thuê bao.
        </h1>
        <p className="mx-auto mt-3.5 max-w-[62ch] text-[17px] leading-relaxed text-ink-2">
          Nạp tiền vào tài khoản, mỗi lần tạo trừ đúng số ghi sẵn. Tiền không hết hạn, không tự động gia hạn, dùng chung
          cho mọi công cụ ở cả {NGANH.length} ngành.
        </p>
      </section>

      <section className="px-6 md:px-16 pb-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GOI.map((g) => (
            <div
              key={g.ten}
              className={cx(
                "relative rounded-2xl border-[1.5px] px-6 pt-6.5 pb-6",
                g.noiBat ? "bg-accent-soft border-accent" : "bg-surface border-line-strong",
              )}
            >
              {g.nhanTang && (
                <div className="absolute -top-2.5 left-6 text-[11.5px] font-semibold text-white bg-accent rounded-full px-2.5 py-1">
                  {g.nhanTang}
                </div>
              )}
              <div className="text-[13.5px] font-semibold text-ink-3 mb-2.5">{g.ten}</div>
              <div className="text-[30px] font-bold tracking-[-0.035em] mb-1.5 tabular">{vnd(g.tien)}</div>
              <div className="text-[13.5px] text-ink-3 mb-5">
                Vào tài khoản <strong className="text-ink font-semibold">{vnd(g.nhan)}</strong>
              </div>
              <div className="flex flex-col gap-2.5 mb-5.5">
                {g.vd.map((v) => (
                  <div key={v} className="flex items-center gap-2 text-[13px] text-ink-2">
                    <span className="text-accent shrink-0">
                      <Icon d={ICONS.check} size={14} width={2.6} />
                    </span>
                    {v}
                  </div>
                ))}
              </div>
              <Nut kieu={g.noiBat ? "chinh" : "phu"} href="/app/nap" className="w-full">
                Nạp {vnd(g.tien)}
              </Nut>
            </div>
          ))}
        </div>
        <p className="text-center text-[13.5px] text-ink-4 mt-4.5">
          Việc đầu tiên miễn phí — không cần nạp gì để thử.
        </p>
      </section>

      <section className="px-6 md:px-16 pb-14">
        <h2 className="text-[27px] font-bold tracking-[-0.028em] mb-1.5">Giá từng công cụ</h2>
        <p className="text-[15px] text-ink-3 mb-5.5">
          Giá cố định cho một lần tạo. Chạy hỏng được hoàn lại vào tài khoản.
        </p>

        <The className="overflow-hidden rounded-2xl">
          <div className="hidden md:grid grid-cols-[1fr_130px_130px_120px] gap-5 px-6 py-3.5 bg-surface-2 border-b border-line font-mono text-[10.5px] tracking-[0.07em] text-ink-5">
            <div>CÔNG CỤ</div>
            <div>ĐẦU RA</div>
            <div>THỜI GIAN</div>
            <div className="text-right">GIÁ / LẦN</div>
          </div>

          {NGANH.map((n) => (
            <div key={n.id}>
              <div className="px-6 pt-3.5 pb-2 bg-[#FCFCFD] border-b border-line">
                <span className="inline-flex items-center gap-2 text-[12.5px] font-bold tracking-[0.03em] text-ink-2">
                  <span className="w-[7px] h-[7px] rounded-sm" style={{ background: n.mau }} />
                  {n.ten.toUpperCase()}
                </span>
              </div>
              {toolsOf(n.slug).map((t) => (
                <Link
                  key={t.id}
                  href={toolHref(t)}
                  className="grid md:grid-cols-[1fr_130px_130px_120px] gap-2 md:gap-5 px-6 py-3.5 border-b border-line items-center hover:bg-surface-2"
                >
                  <div>
                    <div className="text-[15px] font-medium">{t.ten}</div>
                    <div className="text-[12.5px] text-ink-4 mt-0.5">{t.tomTat}</div>
                  </div>
                  <div>
                    <NhanTep ext={t.ext} />
                  </div>
                  <div className="text-[13px] text-ink-3">{khoangThoiGian(t.thoiGian)}</div>
                  <div className="md:text-right">
                    <Tien n={t.price_vnd} co="lg" />
                  </div>
                </Link>
              ))}
            </div>
          ))}
        </The>

        <The className="flex items-start gap-2.5 mt-3.5 px-4.5 py-4">
          <span className="text-ink-4 shrink-0 mt-px">
            <Icon d={ICONS.info} size={17} />
          </span>
          <p className="text-[13.5px] leading-relaxed text-ink-2">
            Một số công cụ có tuỳ chọn làm tăng giá — ví dụ bài giảng có{" "}
            <strong className="font-semibold">hình minh hoạ vẽ riêng</strong> cộng thêm 8.000₫. Màn hình tạo luôn hiện
            tổng tiền và số dư còn lại trước khi bấm.
          </p>
        </The>
      </section>

      <section className="px-6 md:px-16 pb-14">
        <h2 className="text-[27px] font-bold tracking-[-0.028em] mb-5">Câu hỏi về tiền</h2>
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
        <The className="grid gap-10 lg:grid-cols-2 items-center p-9 rounded-2xl">
          <div>
            <h2 className="text-[24px] font-bold tracking-[-0.028em] mb-3">Ba điều luôn đúng</h2>
            <div className="flex flex-col gap-2.5">
              <DongTich>Biết giá trước khi bấm, không phát sinh</DongTich>
              <DongTich>Chạy hỏng được hoàn lại vào tài khoản</DongTich>
              <DongTich>Tiền không hết hạn, không tự động gia hạn</DongTich>
            </div>
          </div>
          <div className="lg:justify-self-end">
            <Nut kieu="chinh" co="lg" href="/dang-nhap">
              Bắt đầu miễn phí
            </Nut>
          </div>
        </The>
      </section>

      <div className="px-6 md:px-16 pb-11 text-center text-[13.5px] text-ink-4">
        Giá đã gồm thuế · Xuất hoá đơn theo yêu cầu · [TÊN HỘ KINH DOANH] · MST [MÃ SỐ THUẾ]
      </div>

      <SiteFooter />
    </>
  );
}
