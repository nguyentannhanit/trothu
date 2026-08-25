import { DongTich, Icon, ICONS, LuuY, Nut, The, Tien, cx } from "@/components/ui";
import { phienHienTai } from "@/lib/phien";
import { vnd } from "@/lib/format";

export const dynamic = "force-dynamic";

const GOI = [
  { tien: 50_000, tang: 0, luot: "~1 bài giảng" },
  { tien: 100_000, tang: 0, luot: "~2 bài giảng" },
  { tien: 300_000, tang: 15_000, luot: "~7 bài giảng" },
  { tien: 500_000, tang: 50_000, luot: "~12 bài giảng" },
];

const QUY_DOI = [
  { ten: "Bài giảng PowerPoint · 45.000₫", gia: 45_000 },
  { ten: "Bài giảng từ mẫu · 15.000₫", gia: 15_000 },
  { ten: "Đề kiểm tra · 12.000₫", gia: 12_000 },
  { ten: "Phiếu bài tập · 9.000₫", gia: 9_000 },
];

export default async function TrangNap() {
  const phien = await phienHienTai();
  const soDu = phien?.soDu ?? 0;
  const chon = GOI[2];
  const sauKhiNap = soDu + chon.tien + chon.tang;

  return (
    <div className="max-w-[1000px] mx-auto px-5 lg:px-6 pt-9 pb-13">
      <h1 className="text-[30px] font-bold tracking-[-0.03em] mb-1.5">Nạp tiền vào tài khoản</h1>
      <p className="text-[15.5px] text-ink-2 mb-7">
        Tiền trong tài khoản không hết hạn và dùng được cho mọi công cụ ở cả 5 ngành.
      </p>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px] items-start">
        <div className="flex flex-col gap-3.5">
          <The className="p-5.5">
            <Buoc so={1} ten="Chọn số tiền" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
              {GOI.map((g) => (
                <div
                  key={g.tien}
                  className={cx(
                    "relative rounded-lg border-[1.5px] px-3.5 py-3.5",
                    g === chon ? "bg-accent-soft border-accent" : "bg-surface border-line-strong",
                  )}
                >
                  <div className="text-[18px] font-bold tracking-[-0.025em] tabular">{vnd(g.tien)}</div>
                  <div className="text-[12.5px] text-ink-3 mt-0.5">{g.luot}</div>
                  {g.tang > 0 && (
                    <span className="absolute -top-2 right-2.5 text-[11px] font-semibold text-white bg-accent rounded-full px-2 py-0.5">
                      Tặng {Math.round((g.tang / g.tien) * 100)}%
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 border border-dashed border-line-strong rounded-lg px-4 py-3.5">
              <span className="text-[13.5px] text-ink-3">Hoặc nhập số khác</span>
              <span className="grow font-mono text-sm text-ink-5">tối thiểu 50.000₫</span>
              <span className="text-sm font-semibold text-ink-4">₫</span>
            </div>
          </The>

          <The className="p-5.5">
            <Buoc so={2} ten="Cách thanh toán" />
            <div className="grid sm:grid-cols-2 gap-2.5 mb-5.5">
              <div className="flex items-center gap-3 border-[1.5px] border-accent bg-accent-soft rounded-lg px-4 py-3.5">
                <span className="inline-flex w-8.5 h-8.5 items-center justify-center rounded-sm bg-surface text-accent shrink-0">
                  <Icon d={ICONS.qr} size={18} />
                </span>
                <div className="grow">
                  <div className="text-[14.5px] font-semibold">Chuyển khoản QR</div>
                  <div className="text-[12.5px] text-ink-3 mt-px">Tự động cộng tiền · không mất phí</div>
                </div>
                <span className="text-accent">
                  <Icon d={ICONS.check} size={17} width={2.8} />
                </span>
              </div>
              <div className="flex items-center gap-3 border-[1.5px] border-line-strong rounded-lg px-4 py-3.5 opacity-60">
                <span className="inline-flex w-8.5 h-8.5 items-center justify-center rounded-sm bg-[#F6E9F2] text-[12px] font-bold text-[#A50064] shrink-0">
                  M
                </span>
                <div className="grow">
                  <div className="text-[14.5px] font-semibold">Ví MoMo</div>
                  <div className="text-[12.5px] text-ink-3 mt-px">Sắp có — cần giấy phép kinh doanh</div>
                </div>
              </div>
            </div>

            <div className="border border-line rounded-xl bg-surface-2 p-5.5">
              <p className="text-[13.5px] leading-relaxed text-ink-2 mb-4">
                Mã QR và thông tin chuyển khoản hiện ra sau khi bấm nút bên phải. Mỗi lần nạp có một mã giao dịch riêng
                để hệ thống tự khớp tiền.
              </p>
              <LuuY>
                Giữ nguyên <strong className="font-semibold">nội dung chuyển khoản</strong> mà hệ thống đưa. Ghi sai thì
                không tự cộng tiền được, phải nhắn Zalo để xử lý tay.
              </LuuY>
            </div>
          </The>
        </div>

        <div className="flex flex-col gap-3.5">
          <The className="p-5.5 rounded-2xl shadow-[var(--shadow-c3)]">
            <div className="text-[15px] font-semibold tracking-[-0.015em] mb-4">Đơn nạp</div>
            <div className="flex flex-col gap-2.5">
              <Dong ten="Số tiền nạp" tien={vnd(chon.tien)} />
              <Dong ten="Tặng thêm 5%" tien={`+ ${vnd(chon.tang)}`} nhan />
              <Dong ten="Số dư hiện có" tien={vnd(soDu)} />
            </div>
            <div className="border-t border-line mt-4 pt-4 flex items-baseline justify-between">
              <span className="text-[14.5px] font-semibold">Số dư sau khi nạp</span>
              <Tien n={sauKhiNap} co="xl" />
            </div>
            <Nut kieu="chinh" co="lg" className="w-full mt-4.5">
              Lấy mã QR chuyển khoản
            </Nut>
          </The>

          <The className="p-4.5">
            <div className="text-[13.5px] font-semibold mb-3.5">{vnd(sauKhiNap)} dùng được bao nhiêu</div>
            <div className="flex flex-col gap-3">
              {QUY_DOI.map((q) => {
                const so = Math.floor(sauKhiNap / q.gia);
                const max = Math.max(1, Math.floor(sauKhiNap / QUY_DOI[QUY_DOI.length - 1].gia));
                return (
                  <div key={q.ten}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-[13px] text-ink-2">{q.ten}</span>
                      <span className="font-mono text-[12.5px] font-semibold tabular">{so} lần</span>
                    </div>
                    <div className="h-[5px] rounded-sm bg-surface-4 overflow-hidden">
                      <div
                        className="h-full rounded-sm bg-accent"
                        style={{ width: `${Math.min(100, (so / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </The>

          <The className="px-4.5 py-4 flex flex-col gap-2.5">
            <DongTich>Tiền không hết hạn, không tự động gia hạn</DongTich>
            <DongTich>Chạy lỗi được hoàn lại trong 24 giờ</DongTich>
            <DongTich>Xuất hoá đơn nếu cần — nhắn Zalo hỗ trợ</DongTich>
          </The>
        </div>
      </div>
    </div>
  );
}

function Buoc({ so, ten }: { so: number; ten: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-ink text-white font-mono text-[11px]">
        {so}
      </span>
      <span className="text-base font-semibold tracking-[-0.015em]">{ten}</span>
    </div>
  );
}

function Dong({ ten, tien, nhan }: { ten: string; tien: string; nhan?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[13.5px]">
      <span className="text-ink-3">{ten}</span>
      <span className={cx("font-medium tabular", nhan && "text-accent")}>{tien}</span>
    </div>
  );
}
